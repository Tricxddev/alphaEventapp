const mongoose =require("mongoose")

//SCHEMA & MODEL FOR INDIVIDUAL AS AN ORGANIZER
const indiOrgSchema= new mongoose.Schema({
    name:{
        firstName:{type:String,required:true},
        lastName:{type:String,required:true}
    },//name of individual as an organizer
    phnCntkt:{
        countryCd:{type:String,required:true},
        phnNum:{type:Number,required:true,maxlenght:11}
    },//phone details of organizer
    address:{type:String},//organizer address
    email:{type:String,required:true},//email details of organizer
    passWd:{type:String,required:true},//password details of organizer
    orgID:{type:mongoose.Schema.Types.ObjectId,ref:"indiOrgModel",unique:true},//ID details of organizer
    regDate:{type:mongoose.Schema.Types.Date,ref:"indiOrgModel",unique:true},//registration date of organizer
    userFollow:[{type:String}],//follwers id of organizer
    userFollowCnt:{type:Number},//followers id count of organizer
    crtdTketz:[{type:String}],//all tickets created  by organizer
    crtdTketCnt:{type:Number},//all tickets count created  by organizer
    totalEarning:{type:Number,default:0}//all tickets sales value earned by organizer

})

const indiOrgModel= new mongoose.model("indiOrgModel",indiOrgSchema)

//SCHEMA & MODEL FOR ORGANIZATION AS AN ORGANIZER
const orgORGSchema= new mongoose.Schema({
    orgName:{type:String,required:true},//name of ORGANIZATION as an organizer
    phnCntkt:{
        countryCd:{type:String,required:true},
        phnNum:{type:Number,required:true,maxlenght:11}
    },//phone details of organizer
    email:{type:String,required:true},//email details of organizer
    passWd:{type:String,required:true},//password details of organizer
    orgID:{type:mongoose.Schema.Types.ObjectId,ref:"indiOrgModel",unique:true},//ID details of organizer
    regDate:{type:mongoose.Schema.Types.Date,ref:"indiOrgModel",unique:true},//registration date of organizer
    userFollow:[{type:String}],//follwers id of organizer
    userFollowCnt:{type:Number},//followers id count of organizer
    crtdTketz:[{type:String}],//all tickets created  by organizer
    crtdTketCnt:{type:Number},//all tickets count created  by organizer
    totalEarning:{type:Number,default:0}//all tickets sales value earned by organizer
})