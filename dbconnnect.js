const mongoose=require("mongoose")


const dbconnect=async()=>{
    mongoose.connect(`${process.env.db}`)
     .then(()=>{
        console.log("app now connected to db")
     })
}

module.exports=dbconnect