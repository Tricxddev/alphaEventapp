const mongoose =require("mongoose")
const eventsDB= require("./eventsDB")


const reviewDb= new mongoose.Schema({
    reviewID:{type:String,required:true},
    userID:{type:mongoose.Schema.Types.ObjectId},
    eventID:{type:mongoose.Schema.Types.ObjectId,ref:"eventModel"},
    orgID:{type:mongoose.Schema.Types.ObjectId,ref:["indiOrgModel","orgORGmodel"]},
    revComment:{type:String,maxlenght:50},
    rating:{type:Number,default:0}
})