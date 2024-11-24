const mongoose =require("mongoose")

const o2authUserSchema= new mongoose.Schema({
    googleId: { type: String, unique: true, required: true },  // Google unique ID
    name: { type: String, required: true },                    // User's full name
    email: { type: String, unique: true, required: true },     // User's email

},{timestamps:true})

const o2authUser= new mongoose.model("o2authUser",o2authUserSchema)


module.exports=o2authUser