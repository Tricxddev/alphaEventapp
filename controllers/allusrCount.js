const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")


const userCountFXN=async(req,res)=>{
    const userCount=await allUserModel.countDocuments()
    res.json(userCount)
  }
  module.exports=userCountFXN