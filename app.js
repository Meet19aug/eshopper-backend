const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const errorMiddleware = require("./middleware/error")

// When you requred to use POST & PUT REQUESTS as in this request we are sendind data or json OBject to server not needed for DELETE & GET
app.use(express.json());
app.use(cookieParser());

//Routs imports
const product = require("./routes/productRouts")
const user = require("./routes/userRouts")

//The app.use() function is used to mount the specified middleware function(s) at the path which is being specified. It is mostly used to set up middleware for your application.
app.use("/api/v1", product);
app.use("/api/v1/",user);

//Middleware for error
app.use(errorMiddleware)


module.exports = app;