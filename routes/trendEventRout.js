const trendEvntFXN=require("../controllers/trendEvnt")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/trndeventAllGet",trendEvntFXN)

module.exports=router