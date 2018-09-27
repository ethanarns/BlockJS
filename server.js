const db = require("./db");
const path = require('path');
const express = require('express');
const app = express();
// .env holds the connection info
require('dotenv').config();

const PORT = 3001;

app.use("/libs", express.static(path.join(__dirname, 'libs')));
app.use("/components", express.static(path.join(__dirname, "components")));
app.use("/audio", express.static(path.join(__dirname, "audio")));

app.get("/", async function(req, res) {
    var saveResult = await db.query('SELECT * FROM saves');
    var ip = getIp(req);
    console.log(ip);
    console.log(saveResult.rows);
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/save", async function(req, res) {
    var jsonRecord = {a: 1};
    var ip = getIp(req);
    ip === "Invalid IP" ? "Localhost" : ip;
    var saveResult = await db.query('INSERT INTO saves (ip, blocks) VALUES ($1, $2)', [ip, jsonRecord]);
});

var server = app.listen(PORT, function() {
    console.log("Listening on port " + server.address().port);
});

function getIp(req) {
    var header = req.headers['x-forwarded-for'];
    if (!header) {
        console.log(`[${new Date()}] Invalid header!`);
        return "Invalid IP";
    }
    else {
        header = header.split(", ")[0]; // Will get first IP, even if only one in header
    }
    if (!validator.isIP(header)) {
        console.log(`[${new Date()}] IP '` + header + "' was detected as invalid!");
        return "Invalid IP";
    }
    return header;
}