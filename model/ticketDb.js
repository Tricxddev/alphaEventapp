const mongoose =require("mongoose")
const {orgORGmodel,indiOrgModel,allUserModel}=require("./organizerDB")
const eventModel=require("./eventsDB")

const ticktsChema=new mongoose.Schema({
    paymentID:{type:String},
    tickets: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          ticketType:{type:String,required:true,ref:"eventModel",enum:["Regular","VIP","Early Bird"]},
          ticketID: {type:String},
          quantity: {type:Number}
        }],
    eventID:{type:String,ref:"eventModel"},
    email:{type:String},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},
    orgID:{type:mongoose.Schema.Types.ObjectId,ref:"indiOrgModel"},
    purchaseDate:{type:Date,require:true}
});
const ticktModel= new mongoose.model("ticktModel",ticktsChema)

module.exports=ticktModel