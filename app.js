const express = require("express");

const app = express();

app.use(express.json())
//Routs imports
const product = require("./routes/productRouts")

app.use("/api/v1", product);

module.exports = app;