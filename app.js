const express = require("express");
const errorMiddleware = require("./middleware/error")

const app = express();

// When you requred to use POST & PUT REQUESTS as in this request we are sendind data or json OBject to server not needed for DELETE & GET
app.use(express.json())

//Routs imports
const product = require("./routes/productRouts")

//The app.use() function is used to mount the specified middleware function(s) at the path which is being specified. It is mostly used to set up middleware for your application.
app.use("/api/v1", product);

//Middleware for error
app.use(errorMiddleware)


module.exports = app;