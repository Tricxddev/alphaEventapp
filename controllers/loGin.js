const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const bcrypt=require("bcrypt")
const moment=require("moment")


const loginFXN=async(req,res)=>{
    try{
      const{email,passWd}=req.body
      const existinUser = await allUserModel.findOne({email:email})
      //console.log(req.body)
  
      if(!existinUser){
        return res.status(403).json({msg:"ACCESSRR DENIED"})
      };
      const unHaspwd= await bcrypt.compare(passWd,existinUser.passWd)
      if(!unHaspwd){
        return res.status(403).json({msg:"ACCESS DENIED"})
      }
      const updlastLogin= await allUserModel.findOneAndUpdate(
        {userID:existinUser.userID},
        {lastLogin:new Date()},
        {new:true})
      const datexepl=  moment(updlastLogin.lastLogin).format('MMMM Do YYYY, h:mm:ss a')
      res.status(200).json({
        msg:"SUCCESSFUL",
        userID:existinUser.userID,
        name:existinUser.name,
        lastLogin:datexepl
      })
    }catch(error){return res.status(400).json({msg:error.message})}
  
  }
  module.exports=loginFXN