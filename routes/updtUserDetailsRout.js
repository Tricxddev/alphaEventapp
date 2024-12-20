const updtUserFXN=require("../controllers/updtUserdetails")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/updtPasswd/:googleId",updtUserFXN)

module.exports=router