const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const bcrypt=require("bcrypt")
const changePwDashFXN=async(req,res)=>{
  try {
    const {userID}=req.params;
    const {oldPasswd,newPasswd}=req.body;
    const findUser= await allUserModel.findOne({userID:userID});
    if(!findUser){
      return res.status(404).json({msg:"USER NOT FOUND"})
    }
    const isMatch = await bcrypt.compare(oldPasswd, findUser.passWd);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }
    const hashedNewPasswd = await bcrypt.hash(newPasswd, 12);
    const updatedUser = await allUserModel.findOneAndUpdate(
      { userID: userID },
      { passWd: hashedNewPasswd },
      { new: true }
    );
    res.status(200).json({
      msg: "Password updated successfully",
    });
  } catch (error) {res.status(500).json({ msg: error.message })}}

module.exports={changePwDashFXN}