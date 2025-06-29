const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const Otp=require("../model/otpdb")
const bcrypt=require("bcrypt")
const mongoose =require("mongoose")
const jwt=require("jsonwebtoken")
const verifyMailer=require("../services/verifyUserMail")

const generateOTpw= function(){
  return  Math.floor(100000+Math.random()*90000)
};

const newUserFXN=async(req,res)=>{
    try {
      const {name,email,passWd}=req.body
        
        if (!name || !email || !passWd) {
        return res.status(400).json({ msg: "All fields are required" });
        }
        emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailregex.test(email)) {
            return res.status(400).json({ msg: "Invalid email format" });
        }
        // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        // if (!passwordRegex.test(passWd)) {
        //     return res.status(400).json({ msg: "Password must be at least 8 characters long and contain at least one letter and one number" });
        // }
        const existinUser = await allUserModel.findOne({email})
        const hashPass= await bcrypt.hash(passWd,12)
      
        if(!existinUser.isEmailVerified || ! existinUser){
        const token = jwt.sign(
          { email: email },
          process.env.refresTk,
          { expiresIn: '1h' },
        )
        const OtpGen=  generateOTpw().toString()
        const hashOtp = await bcrypt.hash(OtpGen, 6);
        const nameCap= await name.toUpperCase()
        const newUser= await allUserModel.create({
          userID:new mongoose.Types.ObjectId(),
          name:nameCap,
          email,
          // restpasswordOTP:hashOtp,
          // restpasswordOTP_Expires:Date.now() + 10 * 60 * 1000,// 10 minutes expiry
          passWd:hashPass,
          lastLogin: new Date()      
        });
        await Otp.create({
          email,
          otp:hashOtp,
        })
        const veriName= await newUser.name;
        const verifyMail= await newUser.email;
        const veriToken= await newUser.verifyOTpw;
        await verifyMailer(OtpGen,veriName,verifyMail);
      
        await indiOrgModel.create({
          IndName:{
                  firstName: nameCap, 
                  lastName: ''},
          phnCntkt:{
            countryCd:"",
            phnNum:""},
          address:"",
          email,
          userID:newUser.userID,
          regDate:new Date(),
          userFollow:[],
          userFollowCnt:0,
          crtdTketz:[],
          crtdTketCnt:0,
          totalEarning:0
        })
        if(!newUser)throw new Error("ERROR IN DATA SAVE");
       
  
        res.status(200).json({
        msg:"SUCCESSFUL",
       // token
        });
        }else{
          return res.status(409).json({msg:"USER ALREADY EXIST KINDLY GO TO LOGIN PAGE"});
        };

    } catch (error){ return res.status(401).json({msg:error.message})
    }};
    module.exports={newUserFXN}