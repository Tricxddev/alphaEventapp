const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")

const manualoGinUfetFXN=async(req,res)=>{
    const{userEmail}=req.params
    const finduser= await allUserModel.findOne({email:userEmail});
    return res.status(200).json({
      msg:"SUCCESSFUL",
      name:finduser.name
    })
  };
  module.exports=manualoGinUfetFXN