const express = require('express');
const app = express();

const PORT = 3000;

app.listen(PORT, function() {
    console.log("Listening on port " + PORT);
});