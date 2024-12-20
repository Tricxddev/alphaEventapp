const tickzCrtFXN=require("../controllers/confirmToken")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/tickzCrt/:eventID",tickzCrtFXN)

module.exports=router