const {Pool} = require("pg")
const dotenv = require("dotenv").config()
const fs= require("fs")
const path= require("path")

const pool= new Pool({
    connectionString:process.env.RDB_URL,
        ssl: {
            rejectUnauthorized: false,
            ca: fs.readFileSync(path.resolve(__dirname, "./root.crt")).toString(), // Adjust the path to your CA certificate
        }
})
files=['users.sql']

const createDBTBL=async()=>{
    try{
     for(file of files){
        const filePath=path.join(__dirname,'alventDB',file)
        const sql=fs.readFileSync(filePath,'utf-8')
        console.log(`Executing File:${file}`)
        await pool.query(sql)
        console.log("Table Created")

     }
    }catch(err){
        console.log("Error:", err)
    }finally{
        await pool.end()
    }
};
createDBTBL()