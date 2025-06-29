const mongoose =require("mongoose")
//const organizerDB=require("./organizerDB")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")

const sessionSchema=new mongoose.Schema({
    sessionID:{type:String,required:true},
    userID:{type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},
    sessToken:{type:String,required:true},
    loginRoute:{type:String,enum:['manual','google','facebook','apple']},
    activityLog: [{
      action: {type:String},
      route: {type:String},
      method: {type:String},
      timestamp: { type: Date, default: Date.now },
      ip: {type:String},
      userAgent: {type:String}
    }],
    createdAt: {type: Date,default: Date.now}
    //refrshTkn:{type:String,required:true}
},{timestamps:true})

const sessionModel= new mongoose.model("sessionModel",sessionSchema)

module.exports=sessionModel


