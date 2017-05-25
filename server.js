const express = require('express');
const app     = express();
const port    = 8000;

app.use(express.static('public'));

app.listen(port, () => console.log("Optimizer Frontend running on port: ", port));
