const mongoose =require("mongoose")
const {orgORGmodel,indiOrgModel,allUserModel}=require("../model/organizerDB")
const sessionModel=require("../model/sessiosDB")
const activityModel = require("../model/activitySchema");

//TO BE IMPLEMENTED SOON
const checkSession = async (req, res, next) => {
  try {
    // const sessToken = req.headers["authorization"];

    if(req.path.startsWith("/login") ||
        req.path.startsWith("/signup") ||
        req.path.startsWith("/auth") ||
        req.path.startsWith("/buyTicket-initiate")
      ){return next()}
    // if (!sessToken) {
    //   return res.status(401).json({ msg: "Session token required" });
    // }

    // const session = await sessionModel.findOne({ sessToken });

    // if (!session) {
    //   return res.status(401).json({ msg: "Session expired" });
    // }

    // Optionally attach user/session info to request
    // req.session = session;
    // req.userID = session.userID || "Anonymous";

    next();
  } catch (err) {
    console.error("Session check error:", err.message);
    return res.status(500).json({ msg: "Server error" });
  }
};



const logActivity = async (req, res, next) => {
  try {
    if (req.session) {
      await activityModel.create({
        userID: req.session.userID|| "Anonymous",
        sessionID: req.session.sessionID|| "Anonymous",
        route: req.originalUrl,
        method: req.method,
        action: `${req.method} ${req.originalUrl}`,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
      });
    }
  } catch (err) {
    console.error("Activity logging error:", err.message);
  }
  next();
};


module.exports = {checkSession,logActivity};
