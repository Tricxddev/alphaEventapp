const {confirmTokenFXN}=require("../controllers/confirmToken")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.post("/confirmedToken/:userID",confirmTokenFXN)

module.exports=router