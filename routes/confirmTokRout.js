const {confirmTokenFXN}=require("../controllers/confirmToken")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.post("/confirmedToken/:email",confirmTokenFXN)

module.exports=router