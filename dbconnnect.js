const mongoose=require("mongoose")


const dbconnect=async()=>{
    mongoose.connect(`${process.env.db}`)
     .then(()=>{
        console.log("MONGODB CONNECTED")
     })
}

module.exports=dbconnect