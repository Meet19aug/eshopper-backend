const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");

//for connecting to database.
const connectDatabase = require("./config/database")

//Handling Uncaught Exception console.log(youtube)
process.on("uncaughtException", (err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting Down the server due to  Uncaught Exception`);

    server.close(()=>{
        process.exit(1);
    })
})

//config
dotenv.config({path: "backend/config/config.env"})

//Connecting to database [server-database]
connectDatabase();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})


const server = app.listen(process.env.PORT, ()=> {
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})

//Unhandle Promise Rejection
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting Down the server due to Unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    });
})