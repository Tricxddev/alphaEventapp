const {eventDetailsFXN,socialAppeventFXN}=require("../controllers/eventDetails")
const express = require("express")
//const { Module } = require("module")
const {checkSession,logActivity,eventClickGet}=require("../middleware/sessionChecker")
const router = express.Router()

router.get("/eventDetails/:eventID",eventClickGet,eventDetailsFXN)
router.get("/socialDetails/:eventID",eventClickGet,socialAppeventFXN)
module.exports=router