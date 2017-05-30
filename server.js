const express = require('express');
const app     = express();
const port    = process.env.PORT || 8000;

app.use(express.static('public'));

app.listen(port, () => console.log("Optimizer Frontend running on port: ", port));
