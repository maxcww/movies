"use strict";

// Libraries
const express = require("express");

// Globals
const PORT = 3000;
const HOST = "0.0.0.0";

const app = express();
app.get("/", (req, res) => {
    res.send(`${DB_URL}\n`);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);