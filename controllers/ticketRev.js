
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")



const ticketRevFXN=async(req,res)=>{
    const{userEmail}=req.params
    
    try {
      // Search in indiOrgModel
      const findIndiUser = await indiOrgModel.findOne({ email: userEmail });
     

      if (findIndiUser) {
        console.log("found in indUser")
        return res.status(200).json({
          msg: "SUCCESSFUL",
          totalRevenue: findIndiUser.totalEarning
        })}else{console.log("found in Orguser")}

      // Search in orgORGmodel
      const findOrgUser = await orgORGmodel.findOne({ email: userEmail });
  
      if (findOrgUser) {
        console.log("found in Orguser")
        return res.status(200).json({
          msg: "SUCCESSFUL",
          totalRevenue: findOrgUser.totalEarning
        })}else{console.log("found in indUser")}
      
  
      // If no user found in either model
      return res.status(404).json({
        msg: "User not found"
      });
  
    } catch (error) {
      console.error("Error fetching ticket revenue:", error);
      return res.status(500).json({
        msg: "Server Error",
        error: error.message,
      });}
  };
  module.exports=ticketRevFXN