'use strict';

// Libraries
const express = require('express');
const client = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');

// Globals
const PORT = 8080;
const HOST = '0.0.0.0';
const DB_PORT = 27017;
const DB_URL = `mongodb://mongo:${DB_PORT}/moviedb`;
const DATASETS_FOLDER = '/app/datasets/'

const app = express();
let db;

// Async functions for fs library
function readdirAsync(datasets_folder) {
  return new Promise( (resolve, reject) => {
    fs.readdir(datasets_folder, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}
function statIsFileAsync(file_path) {
  return new Promise( (resolve, reject) => {
    fs.stat(file_path, (err, stat) => {
      if (err) reject(err);
      resolve(stat.isFile());
    });
  });
}
function readFileAsync(file_path) {
  return new Promise( (resolve, reject) => {
    fs.readFile(file_path, 'utf-8', (err, data) => {
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
  for (let i in columns) {
    if (columns[i]['dataTypeName'] !== 'meta_data') {
      columnIndices[columns[i]['name']] = i;
    }
  }
  return columnIndices;
}

// Creates the list of inserts from the data with the columns in columnIndices
function createInsertData(data, columnIndices) {
  const toInsert = data.map( (dataRow) => {
    let row = {};
    for (let col in columnIndices) {
      row[col] = dataRow[columnIndices[col]];
    }
    return row;
  });
  return toInsert;
}

// Insert datasets into the database that do not exist yet in the database
// from the datasets folder.
const initialiseDatabase = async () => {
  try {
    db = await client.connect(DB_URL);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map( (collection) => {
      return collection['name'];
    });
    const files = await readdirAsync(DATASETS_FOLDER);

    files.map(async (file) => {
      const file_path = path.join(DATASETS_FOLDER, file);
      if (await statIsFileAsync(file_path)) {
        const place = getPlace(file);
        if (collectionNames.indexOf(place) == -1) {
          const obj = JSON.parse(await readFileAsync(file_path));
          const columnIndices = getColumnIndices(
            obj['meta']['view']['columns']);
          const toInsert = createInsertData(obj['data'], columnIndices);
          await db.collection(place).insertMany(toInsert);
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
}

initialiseDatabase();

// https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

app.get('/', asyncMiddleware(async (req, res, next) => {
  res.send(`${DB_URL}\n`);
}));

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);