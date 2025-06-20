const {forgetPWDFXN,forgotPWDOTPFXN,resetPasswordFXN}=require("../controllers/forgetPWD")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.post("/forgotPassword", forgetPWDFXN);
router.post("/forgotpwdOTPconfirmation/:email", forgotPWDOTPFXN);
router.post("/resetPasswd/:userEmail", resetPasswordFXN);

module.exports = router;