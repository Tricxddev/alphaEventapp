const {allUserModel}=require("../model/organizerDB")
const bcrypt=require("bcrypt")
const verifyMailer=require("../services/verifyUserMail")
const express = require("express")

const generateOTpw= function(){
  return  Math.floor(100000+Math.random()*90000)
};

//app.post("/forgtPassword", 
    const forgetPWDFXN =async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const newUser = await allUserModel.findOne({ email });
    if (!newUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    const otpCode = generateOTpw().toString();
    //console.log('GENotpCode:',otpCode)
    const hashOtp = await bcrypt.hash(otpCode, 6);
    await allUserModel.findOneAndUpdate(
      newUser, { restpasswordOTP: hashOtp },
      {restpasswordOTP_Expires:Date.now() + 10 * 60 * 1000},
      { new: true });

    const veriName = newUser.name; 
    const verifyMail = newUser.email; 


    // Send OTP email
    try {
        console.log("Sending OTP email to:", verifyMail);
        console.log("OTP Code:", otpCode);
        console.log("User Name:", veriName);
        // // Mask email for security
        // const maskedEmail = verifyMail.replace(/(.{2})(.*)(?=@)/, '$1***$3');
        // console.log("Masked Email:", maskedEmail);
      await verifyMailer(otpCode, veriName, verifyMail);
    } catch (mailError) {
      // Rollback OTP changes if email sending fails
      newUser.restpasswordOTP = undefined;
      newUser.restpasswordOTP_Expires = undefined;
      console.error("Error sending email:", mailError);
      return res.status(500).json({ message: "Error sending email. Please try again later." });
    }

    return res.status(200).json({msg:"SUCCESSFUL"
     // message: `A 6-digit verification code has been sent to your email address. Please enter the code sent to ${maskedEmail}.`,
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).json({ msg: error.message });
  }}


// app.post("/forgotpwdOTPconfirmation", 
    const forgotPWDOTPFXN = async (req, res) => {
  const {email}=req.params
  const {verificationCode} = req.body;
    // console.log('email:',email,'verificationCode:',verificationCode)
  try {
    // Find user by email
    const newUser = await allUserModel.findOne({ email });
    if (!newUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    const copmpareOTP= await bcrypt.compare(verificationCode, newUser.restpasswordOTP);
    if(!copmpareOTP){
      return res.status(403).json({ msg: "Invalid OTP" });
    }
    // Check if OTP is expired less than 10 minutes
    if (newUser.restpasswordOTP_Expires < Date.now()+ 10 * 60 * 1000) {
      return res.status(403).json({ msg: "OTP has expired" });
    }
    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ msg: error.message });
  }}


//UPDATE PASSWORD
// app.post("/resetPasswd/:userEmail", 
    const resetPasswordFXN = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { userEmail } = req.params; // Extract email from URL params

    console.log('newPassword:',newPassword,'userEmail:',userEmail)
    // Find user by email
    const newUser = await allUserModel.findOne({ email: userEmail });

    if (!newUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Hash the new password
    const pwhashupdt = await bcrypt.hash(newPassword, 12);
    await allUserModel.findOneAndUpdate(
      {email:userEmail},
      {passWd:pwhashupdt,
        $unset:{restpasswordOTP:1,restpasswordOTP_Expires:1}},
      {new:true})


    res.status(200).json({ msg: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({ msg: error.msg });
  }}

module.exports = {
  forgetPWDFXN,
  forgotPWDOTPFXN,
  resetPasswordFXN
};