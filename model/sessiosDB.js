const mongoose =require("mongoose")
//const organizerDB=require("./organizerDB")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")

const sessionSchema=new mongoose.Schema({
    sessionID:{type:String,required:true},
    userID:{type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},
    sessToken:{type:String,required:true},
    //refrshTkn:{type:String,required:true}
},{timestamps:true})

const sessionModel= new mongoose.model("sessionModel",sessionSchema)

module.exports=sessionModel


