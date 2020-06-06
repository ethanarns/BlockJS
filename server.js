// const db = require("./db");

const express = require('express');
const app = express();

const path = require('path');
const validator = require('validator');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// .env holds the connection info
require('dotenv').config();

const PORT = 3001;

app.use("/libs", express.static(path.join(__dirname, 'libs')));
app.use("/components", express.static(path.join(__dirname, "components")));
app.use("/audio", express.static(path.join(__dirname, "audio")));

app.get("/", async function(req, res) {
    // var saveResult = await db.query('SELECT * FROM saves');
    // var ip = getIp(req);
    res.sendFile(path.join(__dirname, 'index.html'));
});

// app.post("/save", async function(req, res) {
//     var ip = getIp(req);
//     var jsonResult = req.body;
//     // Overwrite old save
//     var deleteResult = await db.query('DELETE FROM saves WHERE ip = $1', [ip]);
//     var saveResult = await db.query('INSERT INTO saves (ip, blocks) VALUES ($1, $2)', [ip, jsonResult]);
//     res.send("Success");
// });

// app.get("/load", async function(req, res) {
//     var ip = getIp(req);
//     var loadResult = await db.query('SELECT blocks FROM saves WHERE ip = $1', [ip]);
//     var jsonResult = loadResult.rows[0].blocks.save;
//     res.json(jsonResult);
// })

var server = app.listen(PORT, function() {
    console.log("Listening on port " + server.address().port);
});

/**
 * Retrieves the real IP
 * @param {object} req Request object
 * @returns {string} The ip address, 'error' if error
 * @public
 */
function getIp(req) {
    var header = req.headers['x-forwarded-for'];
    if (!header) {
        return "localhost";
    }
    else {
        header = header.split(", ")[0]; // Will get first IP, even if only one in header
    }
    if (!validator.isIP(header)) {
        console.log(`[${new Date()}] IP '` + header + "' was detected as invalid!");
        return "error";
    }
    return header;
}