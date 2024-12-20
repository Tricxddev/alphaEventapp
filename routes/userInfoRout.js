const userInfoFXN=require("../controllers/userInfo")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/userInfo",userInfoFXN)

module.exports=router