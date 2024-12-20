const confirmTokenFXN=require("../controllers/confirmToken")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/confirmedToken/:userID",confirmTokenFXN)

module.exports=router