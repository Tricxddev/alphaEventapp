const mongoose =require("mongoose")
const {orgORGmodel,indiOrgModel,allUserModel}=require("./organizerDB")
const eventModel=require("./eventsDB")

const ticktsChema=new mongoose.Schema({
    ticketID:{type:String,required:true},
    eventID:{type:String,ref:"eventModel"},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},
    orgID:{type:mongoose.Schema.Types.ObjectId,ref:"orgORGmodel"},
    tickeType:{type:String,required:true,ref:"eventModel",enum:["general","vip"]},
    ticketPrice:{type:Number,require:true,default:0},
    purchaseDate:{type:Date,require:true}
});
const ticktModel= new mongoose.model("ticktModel",ticktsChema)

module.exports=ticktModel