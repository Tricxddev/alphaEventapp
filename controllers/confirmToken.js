
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const Otp=require("../model/otpdb")
const sessionModel=require("../model/sessiosDB")

const confirmTokenFXN=async(req,res)=>{
    try{
    const{userToken}=req.body;
    const {email}=req.params;
    const verifyID= await allUserModel.findOne({email});
    const getOTP=await Otp.findOne({email})
    
    if(!verifyID){
      res.status(403).json({msg:"INVALID ACTION"})
    };
    if(!userToken){
      res.status(403).json({msg:"OTP REQUIRED"})
    };
      // Check if OTP is expired
    if (!getOTP) {
      return res.status(403).json({ msg: "OTP has expired" });
    }
    const veriTokenhashed= await getOTP.otp;
    const compOtp= await bcrypt.compare(userToken,veriTokenhashed);
    
    if(compOtp){
      const checkVerifictn = await allUserModel.findOne({email});
      
      if(checkVerifictn.isEmailVerified=== true)
        {return res.status(400).json({msg:"OTP ALREADY VERIFIED, PLEASE GO TO LOGIN"})};

      await allUserModel.findOneAndUpdate({email},{isEmailVerified:true});

      res.status(200).json({
      msg:"SUCCESSFUL",
      // token:sessionTokz
    })
    }else{res.status(400).json({msg:"INVALID ACTION"})};
    
    }catch(error){return res.status(400).json({msg:error.message})}
  }
  module.exports={confirmTokenFXN}
  