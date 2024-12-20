const eventDetailsFXN=require("../controllers/eventDetails")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/eventDetails/:eventID",eventDetailsFXN)

module.exports=router