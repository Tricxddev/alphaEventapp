const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
    email: {type: String,required: true,unique: true},
    otp: {type: String,required: true},
    createdAt: {type: Date,default: Date.now, expires: '10m' 
    }
});
const Otp = new mongoose.model("Otp", otpSchema);

module.exports = Otp;