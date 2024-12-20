const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")

const googleUnmFetFXN=async(req,res)=>{
    const{email}=req.query
    const finduser= await allUserModel.findOne({email});
    return res.status(200).json({
      msg:"SUCCESSFUL",
      userName:finduser.name
    })
  }
  module.exports=googleUnmFetFXN