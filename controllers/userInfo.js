const dotenv = require("dotenv")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")

const userInfoFXN=async (req, res) => {
    try {
      // Retrieve the token from the Authorization header
      const authHeader = req.headers.authorization;
      // console.log(authHeader)
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, msg: 'Unauthorized access' });
      }
  
      const token = authHeader.split(' ')[1];
      
  
      // Verify the token
      const decoded = jwt.verify(token, process.env.refresTk);
  
      //console.log(decoded)
  
      // Use the decoded token to find the user
      const user = await allUserModel.findOne({ email: decoded.email });
  
      //console.log(user)
  
      if (user) {
        res.status(200).json({
          msg: "SUCCESSFUL",
          data:{
          name: user.name,
          email: user.email,}
        });
      } else {
        res.status(404).json({ success: false, msg: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  };

  module.exports=userInfoFXN

