const app = require("./app");
const dotenv = require("dotenv");

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