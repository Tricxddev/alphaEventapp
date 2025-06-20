const {Pool} =require("pg")
const dotenv=require("dotenv").config()
const fs=require("fs")
const path=require("path")

const pool= new Pool({
    connectionString: process.env.RDB_URL,
    ssl: {
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.resolve(__dirname, "./root.crt")).toString(), // Adjust the path to your CA certificate
    }
})

const rdbmsConnect= async()=>{
    try{
        await pool.connect()
        console.log("RDBMS CONNECTED")
    }catch(err){
        console.log("Error:", err)
    }
}

module.exports=rdbmsConnect