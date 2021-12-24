const mongoose  = require("mongoose");


//useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options. Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and useFindAndModify is false.
const connectDatabase = ()=>{
    mongoose.connect(process.env.DB_URI,{useNewUrlParser:true, useUnifiedTopology:true}).then((data)=>{
        console.log(`Mongodb Connected with server : ${data.connection.host}`)
    })
}

module.exports = connectDatabase