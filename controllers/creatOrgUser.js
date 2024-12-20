const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const moment=require("moment")


const orgUserCreatFXN=async(req,res)=>{
    try {
      const {userID}=req.params;
      const {orgName,countryCd,phnNum,address}=req.body;
      const existingUser=await orgORGmodel.findOne({userID});
      if(existingUser){return res.status(409).json({msg:"USER ALREADY AN ORGANIZER:O"})};
      const findUser=await allUserModel.findOne({userID});
      const orgIdGen= async()=>{
        let orgID
        let isUnique= false
        while(!isUnique){
          const randMNo= await Math.floor( Math.random()*9999)
          orgID=`ALVENT-${randMNo}-${new Date().getFullYear()}`
          const idExist= await orgORGmodel.findOne({orgID});
          if(!idExist) isUnique=true
        };
        return orgID
      };
      const newOrgID=await orgIdGen()
      
      const regdate=new  Date()
      const reaDate= await moment(regdate).format('MMMM Do YYYY, h:mm:ss a');
      orgORGUserCreate= await orgORGmodel.create({
        orgName:orgName.toUpperCase(),
        phnCntkt:{
          countryCd,
          phnNum},
        address,
        email:findUser.email,
        userID:findUser.userID,
        orgID:newOrgID,
        regDate:regdate,
        userFollow:[],
        userFollowCnt:0,
        crtdTketz:[],
        crtdTketCnt:0,
        totalEarning:0})
  
    const updtRole= await allUserModel.findOneAndUpdate({
      userID:findUser.userID},
      {role:"organizer"},
      {new:true});
    //console.log(req)
    res.status(200).json({
      msg:"SUCCESSFULL",
      reaDate,
      orgORGUserCreate
    })} catch (error) {return res.status(400).json({msg:error.message})}
  
  };
  module.exports=orgUserCreatFXN