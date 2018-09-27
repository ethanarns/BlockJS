const path = require('path');
const express = require('express');
const app = express();

const PORT = 3001;

app.use("/libs", express.static(path.join(__dirname, 'libs')));
app.use("/components", express.static(path.join(__dirname, "components")));
app.use("/audio", express.static(path.join(__dirname, "audio")));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/save", function(req, res) {

});

var server = app.listen(PORT, function() {
    console.log("Listening on port " + server.address().port);
});