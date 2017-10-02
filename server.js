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

client.connect(DB_URL, function (err, db) {
  if (err) throw err;

  // First insert datasets into the database that do not exist yet in the
  // database from the datasets folder.
  fs.readdir(DATASETS_FOLDER, function (err, files) {
    if (err) throw err;

    db.listCollections().toArray(function (err, collections) {
      if (err) throw err;

      var collectionNames = [];
      for (var i=0; i < collections.length; i++) {
        collectionNames.push(collections[i]['name']);
      }

      var file_path;
      var place;
      var file;
      for (var i=0; i < files.length; i++) {
        file = files[i];
        file_path = path.join(DATASETS_FOLDER, file);

        // readdir also gets . and .., so check if it really is a file
        fs.stat(file_path, function (err, stat) {
          if (err) throw err;

          if (stat.isFile()) {
            place = getPlace(file);
            if (collectionNames.indexOf(place) == -1) {
              insertDataInCollection(place, db, file_path);
            }
          }
        });
      }
    });
  });

  app.get('/', (req, res) => {
      res.send(`${DB_URL}\n`);
  });

  app.listen(PORT, HOST);
  console.log(`Running on http://${HOST}:${PORT}`);
});

// Removes the .json at the end of filename
function getPlace(filename) {
  return filename.slice(0, -5);
}

// Inserts the data extracted from the json file into the database
function insertDataInCollection(place, db, file_path) {
  fs.readFile(file_path, 'utf8', function (err, data) {
    if (err) throw err;
    
    var obj = JSON.parse(data);
    var columnIndices = getColumnIndices(obj['meta']['view']['columns'])
    var toInsert = createInsertData(obj['data'], columnIndices);
    db.collection(place).insertMany(toInsert, function (err, res) {
      if (err) throw err;
    });
  });
}

// Returns a list of {column name: column index}
function getColumnIndices(columns) {
  var columnIndices = {};
  for (var i=0; i < columns.length; i++) {
    if (columns[i]['dataTypeName'] !== 'meta_data') {
      columnIndices[columns[i]['name']] = i;
    }
  }
  return columnIndices;
}

// Creates the list of inserts from the data with the columns in columnIndices
function createInsertData(data, columnIndices) {
  var toInsert = []
  var row;
  for (var i=0; i < data.length; i++) {
    row = {}
    for (var col in columnIndices) {
      row[col] = data[i][columnIndices[col]];
    }
    toInsert.push(row);
  }
  return toInsert;
}