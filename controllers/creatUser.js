const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const moment=require("moment")


const creatUserFXN=async(req,res)=>{
    try {
      const {userID}=req.params;
      const {firstName,lastName,countryCd,phnNum,address}=req.body
      const existingUser=await indiOrgModel.findOne({userID});
      if(existingUser){return res.status(409).json({msg:"USER ALREADY AN ORGANIZER:I"})}
      const findUser=await allUserModel.findOne({userID});
      const regdate=new  Date()
      const reaDate=  moment(regdate).format('MMMM Do YYYY, h:mm:ss a');
      indiUserCreate= await indiOrgModel.create({
        IndName:{
          firstName:firstName.toUpperCase(),
          lastName:lastName.toUpperCase()},
        phnCntkt:{
          countryCd,
          phnNum},
        address,
        email:findUser.email,
        userID:findUser.userID,
        regDate:regdate,
        userFollow:[],
        userFollowCnt:0,
        crtdTketz:[],
        crtdTketCnt:0,
        totalEarning:0})    
    const updtRole= await allUserModel.findOneAndUpdate(
      {userID:findUser.userID},
      {role:"organizer"},
      {new:true})
  
    res.status(200).json({
      msg:"SUCCESSFULL",
      reaDate,
      updtRole
    })
    } catch (error) {return res.status(400).json({msg:error.message})}  
  }
  module.exports=creatUserFXN