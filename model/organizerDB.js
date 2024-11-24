const mongoose =require("mongoose")

//SCHEMA & MODEL OF ALL USERS_DB
const allUserSchema= new mongoose.Schema({
    userID:{type:mongoose.Schema.Types.ObjectId,required:true},
    name:{type:String},
    email:{type:String},
    passWd:{type:String,required:true},
    role:{type:String,enum:["attendee","organizer","admin","none"],default:"none"},
    accntStatus:{type:String,enum:["active","suspended"],default:"active"},
    verifyOTpw:{type:String},
    profilePic:{type:String},
    lastLogin:{type:Date},
    isEmailVerified:{type:Boolean,default:false}
},{timestamps:true})
 const allUserModel= new mongoose.model("allUserModel",allUserSchema)


//SCHEMA & MODEL FOR INDIVIDUAL AS AN ORGANIZER
const indiOrgSchema= new mongoose.Schema({
    IndName:{
        firstName:{type:String,required:true},
        lastName:{type:String}},//name of individual as an organizer
    phnCntkt:{
        countryCd:{type:String,required:true,enum:["+1","+44","+91","+234"]},
        phnNum:{type:String,required:true,minlenght:8,maxlenght:11}},//phone details of organizer
    address:{type:String},//organizer address
    email:{type:String,required:true},//email details of organizer
    userID:{type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},//ID details of organizer
    regDate:{type:Date,default:Date.now},//registration date of organizer
    userFollow:[{type:String}],//follwers id of organizer
    userFollowCnt:{type:Number,default:0},//followers id count of organizer
    crtdTketz:[{type:String}],//all tickets created  by organizer
    crtdTketCnt:{type:Number,default:0},//all tickets count created  by organizer
    totalEarning:{type:Number,default:0}//all tickets sales value earned by organizer

},{timestamps:true})

const indiOrgModel= new mongoose.model("indiOrgModel",indiOrgSchema)

//SCHEMA & MODEL FOR ORGANIZATION AS AN ORGANIZER
const orgORGSchema= new mongoose.Schema({
    orgName:{type:String,required:true},//name of ORGANIZATION as an organizer
    phnCntkt:{
        countryCd:{type:String,required:true,enum:["+1","+44","+91","+234"]},
        phnNum:{type:String,required:true,minlenght:10,maxlenght:15}},//phone details of organizer
    email:{type:String,required:true},//email details of organizer
    userID:{type:mongoose.Schema.Types.ObjectId,ref:"allUserModel"},//ID details of organizer
    orgID:{type:String,unique:true},//ID details of organizer
    regDate:{type:Date,default:Date.now},//registration date of organizer
    userFollow:[{type:String}],//follwers id of organizer
    userFollowCnt:{type:Number,default:0},//followers id count of organizer
    crtdTketz:[{type:String}],//all tickets created  by organizer
    crtdTketCnt:{type:Number,default:0},//all tickets count created  by organizer
    totalEarning:{type:Number,default:0}//all tickets sales value earned by organizer
},{timestamps:true})

const orgORGmodel= new mongoose.model("orgORGmodel",orgORGSchema)

module.exports={orgORGmodel,indiOrgModel,allUserModel}