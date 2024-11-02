const express = require("express")
const dotenv = require("dotenv")
const app = express()

const dbconnect= require("./dbconnnect")
dotenv.config()
app.use(express.json())
dbconnect()
const PORT= process.env.appPort || 5000

app.listen(PORT,()=>{
    console.log(`This app now listen on ${PORT}`)
})