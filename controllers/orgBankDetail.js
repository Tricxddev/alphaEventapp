const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const orgBnkDetFXN=async(req,res)=>{
  try {
    const {userID}=req.params;
    const {bankName,accountNumber,accountHolderName}=req.body;
    const findUser= await indiOrgModel.findOne({userID:userID});
    if(!findUser){
      return res.status(404).json({msg:"USER NOT FOUND"})
    }
    const updatedBankDetails = await indiOrgModel.findOneAndUpdate(
      { userID: userID },
      { 
        $set: {
          "bankDetails.bankName": bankName,
          "bankDetails.accountNumber": accountNumber,
          "bankDetails.accountHolderName": accountHolderName
        }
      },
      { new: true }
    );
    res.status(200).json({
      msg: "Bank details updated successfully",
      data: updatedBankDetails
    });
    
  } catch (error) {
    console.error("Error updating individual organizer:", error);
    res.status(500).json({ msg: error.message });
    
  }
};

const orgBnkDetfetchFXN=async(req,res)=>{
  try {
    const {userID}=req.params;
    const findUser= await indiOrgModel.findOne({userID:userID});
    if(!findUser){
      return res.status(404).json({msg:"USER NOT FOUND"})
    }
    const bankDetails = findUser.bankDetails;
    if (!bankDetails || Object.keys(bankDetails).length === 0 || bankDetails.bankName === "" || bankDetails.accountNumber === "" || bankDetails.accountHolderName === "") {
      return res.status(404).json({ msg: "Bank details is Empty,Kindly Update" });
    }
    res.status(200).json({
      msg: "SUCCESSFUL",
      data: bankDetails})
  } catch (error) {
    console.error("Error fetching individual organizer:", error);
    res.status(500).json({ msg: error.message });
    
  }
}
module.exports={orgBnkDetFXN,orgBnkDetfetchFXN}