const ticketRevFXN=require("../controllers/ticketRev")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/orGTicketRev/:userEmail",ticketRevFXN)

module.exports=router