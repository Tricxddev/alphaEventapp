const mongoose =require("mongoose")
const jwt=require("jsonwebtoken")
const {allUserModel,indiOrgModel} = require('../model/organizerDB')

// AUTH
exports.authFxn = async (req, res, next) => {
  try {
    const tk = req.headers.authorization;

    if (!tk) {
      return res.status(401).json({ message: "Access Denied!" });
    }

    const token = tk.split(" ")[1];

    const decoded = jwt.verify(token, process.env.refresTk);
    console.log(decoded.email);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid login details" });
    }
    const userMail = decoded.email;
    const user = await allUserModel.findOne({ email: userMail });

    if (!user) {
      return res.status(404).json({ message: "User account not found!" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
