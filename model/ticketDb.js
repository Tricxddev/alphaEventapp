const mongoose =require("mongoose")
const {orgORGmodel,indiOrgModel,allUserModel}=require("./organizerDB")
const eventModel=require("./eventsDB")

const ticktsChema=new mongoose.Schema({
    ticketID:{type:String,required:true},
    eventID:{type:String,ref:"eventModel"},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},
    orgID:{type:mongoose.Schema.Types.ObjectId,ref:"indiOrgModel"},
    ticketType:{type:String,required:true,ref:"eventModel",enum:["Regular","VIP","Early Bird"]},
    ticketPrice:{type:Number,require:true,default:0},
    ticketQty:{type:Number,require:true},
    purchaseDate:{type:Date,require:true}
});eventModel
const ticktModel= new mongoose.model("ticktModel",ticktsChema)

module.exports=ticktModel