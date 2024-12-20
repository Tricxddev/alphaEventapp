const creatUserFXN=require("../controllers/confirmToken")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/creatIndioRg/:userID",creatUserFXN)

module.exports=router