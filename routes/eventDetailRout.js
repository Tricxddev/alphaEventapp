const eventDetailsFXN=require("../controllers/eventDetails")
const express = require("express")
//const { Module } = require("module")
const {checkSession,logActivity,eventClickGet}=require("../middleware/sessionChecker")
const router = express.Router()

router.get("/eventDetails/:eventID",eventClickGet,eventDetailsFXN)

module.exports=router