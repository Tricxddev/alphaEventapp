const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const bcrypt=require("bcrypt")
const moment=require("moment")
const jwt=require("jsonwebtoken")


const loginFXN=async(req,res)=>{
    try{
    const{email,passWd}=req.body
    console.log('payloadPPP:',req.body)

    if (!email || !passWd) {
        return res.status(400).json({ msg: "All fields are required" });
    }
    const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailregex.test(email)) {
        return res.status(400).json({ msg: "Invalid email format" });
    }
    // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    // if (!passwordRegex.test(passWd)) {
    //     return res.status(400).json({ msg: "Password must be at least 8 characters long and contain at least one letter and one number" });
    // }

    const existinUser = await allUserModel.findOne({email:email})
    

    if(!existinUser){
      return res.status(403).json({msg:"NEW USER? GO TO SIGNUP"})
    };
    const unHaspwd= await bcrypt.compare(passWd,existinUser.passWd)
    if(!unHaspwd){
      return res.status(403).json({msg:"ACCESS UNKNOWN"})
    }
    const updlastLogin= await allUserModel.findOneAndUpdate(
      {userID:existinUser.userID},
      {lastLogin:new Date()},
      {new:true});
      const token = jwt.sign(
        { email: email },
        process.env.refresTk,
        { expiresIn: '1h' },
      );
  
    const datexepl= await moment(updlastLogin.lastLogin).format('MMMM Do YYYY, h:mm:ss a')
    res.status(200).json({
      msg:"SUCCESSFUL",
      token,
      userID:existinUser.userID,
      name:existinUser.name,
      lastLogin:datexepl
    })
    }catch(error){return res.status(400).json({msg:error.message})}
  
  }
  module.exports=loginFXN