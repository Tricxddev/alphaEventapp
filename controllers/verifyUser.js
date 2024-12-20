const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const verifyMailer=require("../services/verifyUserMail")

const verifyUserFXN=async(req,res)=>{
    try {
      const {userID}=req.params;
      const verifyID= await allUserModel.findOne({userID});
      if(!verifyID){
        res.redirect('/new&User')
      };
      const veriName= await verifyID.name;
      const veriToken= await verifyID.verifyOTpw;
      const verifyMail= await verifyID.email
      await verifyMailer(veriToken,veriName,verifyMail);
  
      res.status(400).json({msg:"SUCCESSFUL"})
    
    } catch (error) {
      return res.status(400).json({msg:error.message})
    }
  
  }
  module.exports=verifyUserFXN
  