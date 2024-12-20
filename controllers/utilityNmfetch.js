const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")


const utilityNmfetchFXN=async(req,res)=>{
    const{userEmail}=req.params

    const finduser= await allUserModel.findOne({email:userEmail});
    //console.log(req.params)
    //console.log("USERFOUND:",finduser)
    
    return res.status(200).json({
      msg:"SUCCESSFUL",
      data:finduser
    })
  };
  module.exports=utilityNmfetchFXN