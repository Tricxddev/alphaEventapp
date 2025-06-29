const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "allUserModel" },
  sessionID: {type:String},
  route: {type:String},
  method: {type:String},
  action: {type:String},
  timestamp: { type: Date, default: Date.now },
  ip: {type:String},
  userAgent: {type:String}
});

const activityModel = mongoose.model("activityModel", activitySchema);

module.exports = activityModel;
