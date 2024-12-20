const mongoose =require("mongoose")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")

const eventSchema = new mongoose.Schema({
    eventID:{type:String,required:true},
    eventTitle:{type:String,required:true,maxlenght:50},
    eventImgURL:{type:String},
    eventDesc:{type:String},
    eventDate:{
        eventStart:{type:Date,required:true,default:Date.now},
        eventEnd:{type:Date,required:true,default:Date.now}
    },
    EndTime:{type: String},
    StartTime:{type: String},
    //eventCat:{type: String},
    eventType:{type:String,required:true,enum:["Physical","Online"]},
    isPrivate: { type: Boolean, default: false },
    eventLocation:{
        eventVenue:{type:String},
        eventCity:{type:String},
        eventState:{type:String},
        eventCountry:{type:String},
        },
    eventUrl:{type:String},
    //accessibilityOption:{type:String},
    maximumattedees:{type:Number,default:0},
    //customTags: [{ type: String }], 
    orgID:{type:mongoose.Schema.Types.ObjectId,ref:"orgORGmodel"},
    userID:{type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},
    ticketPrice:{type:Number,default:0},
    tickeType:{type:String,required:true,enum:["others","Vip"]},
    eventCapacity:{type:Number,default:0},
    eventTicketSold:{type:Number,default:0},
    eventTicketCount:{type:Number,default:0},//not updated in all db
    //publishEvnt:{type:String,require:true,enum:["yes","no"]}

})

const eventModel= new mongoose.model("eventModel",eventSchema)

module.exports=eventModel