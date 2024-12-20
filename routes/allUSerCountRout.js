const userCountFXN=require("../controllers/allusrCount")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/getalluserCont",userCountFXN)

module.exports=router