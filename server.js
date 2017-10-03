'use strict';

// Libraries
const express = require('express');
const client = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');

// Globals
const PORT = 3000;
const HOST = '0.0.0.0';
const DB_PORT = 27017;
const DB_URL = `mongodb://mongo:${DB_PORT}/moviedb`;
const DATASETS_FOLDER = '/app/datasets/'

const app = express();

function onConnectAndReaddirAndCollectionNames(db, files, collectionNames) {
  return Promise.all(files.map(function (file) {
    const file_path = path.join(DATASETS_FOLDER, file);
    return new Promise(function (resolve, reject) {
      fs.stat(file_path, function(err, stat) {
        if (err) return reject(err);
        resolve(stat);
      });
    }).then(function (stat) {
      if (stat.isFile()) {
        const place = getPlace(file);
        if (collectionNames.indexOf(place) == -1) {
          return insertDataInCollection(place, db, file_path);
        }
      }
    }).then(function () {
      return true;
    }).catch(console.log.bind(console));
  }));
}

function onConnectAndReaddir(db, files) {
  return new Promise(function (resolve, reject) {
    resolve(db.listCollections().toArray());
  }).then(function (collections) {
    return Promise.all(collections.map(function (collection) {
      return collection['name'];
    }));
  }).then(function (collectionNames) {
    return onConnectAndReaddirAndCollectionNames(db, files, collectionNames);
  }).catch(console.log.bind(console));
}

function onConnect(db) {
  return new Promise(function (resolve, reject) {
    fs.readdir(DATASETS_FOLDER, function (err, files) {
      if (err) return reject(err);
      resolve(files);
    });
  }).then(function (files) {
    return onConnectAndReaddir(db, files);
  }).catch(console.log.bind(console));
}

client.connect(DB_URL)
  .then(onConnect)
  .then(function (val) {
    console.log(val)
  }).catch(console.log.bind(console));

app.get('/', (req, res) => {
    res.send(`${DB_URL}\n`);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

// Removes the .json at the end of filename
function getPlace(filename) {
  return filename.slice(0, -5);
}

// Inserts the data extracted from the json file into the database
function insertDataInCollection(place, db, file_path) {
  fs.readFile(file_path, 'utf8', function (err, data) {
    if (err) throw err;
    
    const obj = JSON.parse(data);
    const columnIndices = getColumnIndices(obj['meta']['view']['columns'])
    const toInsert = createInsertData(obj['data'], columnIndices);
    db.collection(place).insertMany(toInsert, function (err, res) {
      if (err) throw err;
    });
  });
}

// Returns a list of {column name: column index}
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
  return data.map(function (dataRow) {
    let row = {}
    for (let col in columnIndices) {
      row[col] = dataRow[columnIndices[col]];
    } 
    return row; 
  });
}