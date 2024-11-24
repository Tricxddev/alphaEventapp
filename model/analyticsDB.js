const mongoose =require("mongoose")

//EVENTS ANALYTICS
const eventAnalShcema= new mongoose.Schema({
    eventID:{type:mongoose.Schema.Types.ObjectId,ref:"eventModel"},
    views:{type:Number,default:0},
    clicks:{type:Number,default:0},
    ticketSales:{type:Number,default:0},
    
},{timestamps:true})

const eventAnalModel= new mongoose.model("eventAnalModel",eventDB)

module.exports=eventAnalModel