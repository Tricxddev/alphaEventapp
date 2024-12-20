const totTikContDispFXN=require("../controllers/confirmToken")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/totTikContDisp/:userEmail",totTikContDispFXN
)

module.exports=router