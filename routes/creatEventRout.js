const creatEventFXN=require("../controllers/creatEnvt")
const express = require("express")
const { Module } = require("module")
const router = express.Router()

router.get("/createVnt/:userID",creatEventFXN)

module.exports=router