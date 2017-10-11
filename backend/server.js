"use strict";

// Libraries
const express = require("express");
const client = require("mongodb").MongoClient;
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const NodeGeocoder = require("node-geocoder");

// Globals
const PORT = process.env.APP_PORT;
const HOST = process.env.HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_URL = `mongodb://mongo:${DB_PORT}/${DB_NAME}`;
const DATASETS_FOLDER = process.env.DATASETS_FOLDER;

const app = express();
const options = {
  provider: process.env.PROVIDER,
  appId: process.env.APP_ID,
  appCode: process.env.APP_CODE
};
const geocoder = NodeGeocoder(options);
let db;

//---------------- Database initialisation functions ---------------------------
// Async functions for fs library
function readdirAsync(datasets_folder) {
  return new Promise((resolve, reject) => {
    fs.readdir(datasets_folder, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}
function statIsFileAsync(file_path) {
  return new Promise((resolve, reject) => {
    fs.stat(file_path, (err, stat) => {
      if (err) reject(err);
      resolve(stat.isFile());
    });
  });
}
function readFileAsync(file_path) {
  return new Promise((resolve, reject) => {
    fs.readFile(file_path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

// Removes the .json at the end of filename
function getPlace(filename) {
  return filename.slice(0, -5);
}

// Returns a list of {column name: column index} where the datatype is not meta
function getColumnIndices(columns) {
  let columnIndices = {};
  columns.forEach((column, i) => {
    if (column["dataTypeName"] !== "meta_data")
      columnIndices[column["name"]] = i;
  });
  return columnIndices;
}

async function getGeocodes(data, columnIndices, place, i) {
  const locations = data.map(dataRow => {
    return dataRow[i] + ", " + place;
  });
  return await geocoder.batchGeocode(locations);
}

// Creates the list of inserts from the data with the columns in columnIndices
function createInsertData(data, columnIndices, geocodes, i) {
  let toInsert = [];
  data.forEach((dataRow, index) => {
    if (geocodes[index]["value"].length !== 0 && dataRow[i] != null) {
      let row = {};
      for (let col in columnIndices) {
        row[col] = dataRow[columnIndices[col]];
      }
      row["Geocode"] = {
        lat: geocodes[index]["value"][0]["latitude"],
        lng: geocodes[index]["value"][0]["longitude"]
      };
      toInsert.push(row);
    }
  });
  return toInsert;
}

// Insert datasets into the database that do not exist yet in the database
// from the datasets folder.
const initialiseDatabase = async () => {
  try {
    db = await client.connect(DB_URL);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(collection => {
      return collection["name"];
    });
    const files = await readdirAsync(DATASETS_FOLDER);

    files.map(async file => {
      try {
        const file_path = path.join(DATASETS_FOLDER, file);
        if (await statIsFileAsync(file_path)) {
          const place = getPlace(file);
          if (collectionNames.indexOf(place) == -1) {
            const obj = JSON.parse(await readFileAsync(file_path));
            const columnIndices = getColumnIndices(
              obj["meta"]["view"]["columns"]
            );
            // Allows other datasets than the SF one with a column 'locations' instead
            // of 'Locations'.
            const loc = columnIndices.hasOwnProperty("locations")
              ? "locations"
              : "Locations";
            const index = columnIndices[loc];
            const geocodes = await getGeocodes(
              obj["data"],
              columnIndices,
              place,
              index
            );
            const toInsert = createInsertData(
              obj["data"],
              columnIndices,
              geocodes,
              index
            );
            await db.collection(place).insertMany(toInsert);
          }
        }
      } catch (err) {
        console.log("Something went wrong in initialiseDatabase");
        console.log(err);
      }
    });
  } catch (err) {
    console.log("Something went wrong in initialiseDatabase: ");
    console.log(err);
  }
};

// Delay as MongoDB container is sometimes slow and strangely MongoDB has
// no reconnect options according to the documentation of the 2.0 api.
setTimeout(initialiseDatabase, 4000);

// Creates a find query that searches the db for columns with values
// that start with the corresponding value in 'values'
function createFindQuery(columns, values) {
  let findQuery = {};
  values.forEach(function(value, i) {
    if (value !== "") {
      findQuery[columns[i]] = {
        $regex: "^" + value,
        $options: "i"
      };
    }
  });
  return findQuery;
}

//--------------------------- Route functions ----------------------------------
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .then( (data) => {
      next();
    }).catch((err) => {
      res.status(500).send("Something went wrong: " + err);
    });
};

// Add headers for something called CORS so react can fetch.
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET");

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.json());

app.get(
  "/locations",
  asyncMiddleware(async (req, res, next) => {
    res.json(await db.listCollections().toArray());
  })
);

app.get(
  "/columns/:location",
  asyncMiddleware(async (req, res, next) => {
    const location = req.params.location;
    const entry = await db.collection(location).findOne(
      {},
      {
        _id: 0,
        Geocode: 0
      }
    );
    const columns = Object.keys(entry);
    res.send(columns);
  })
);

app.post(
  "/movies/:location",
  asyncMiddleware(async (req, res, next) => {
    const columns = req.body.columns;
    const values = req.body.values;
    const location = req.params.location;

    const findQuery = createFindQuery(columns, values);
    res.json(
      await db
        .collection(location)
        .find(findQuery, { _id: 0 })
        .toArray()
    );
  })
);

app.post(
  "/suggestions/:location",
  asyncMiddleware(async (req, res, next) => {
    const columns = req.body.columns;
    const values = req.body.values;
    const index = req.body.index;
    const column = columns[index];
    const location = req.params.location;

    const findQuery = createFindQuery(columns, values);
    const results = await db
      .collection(location)
      .find(findQuery, { _id: 0, Geocode: 0 })
      .toArray();
    const suggestions = results.map(result => {
      return result[column];
    });
    const uniqueSuggestions = suggestions.filter((value, index) => {
      return suggestions.indexOf(value) === index;
    });
    uniqueSuggestions.sort();
    res.json({ suggestions: uniqueSuggestions });
  })
);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
