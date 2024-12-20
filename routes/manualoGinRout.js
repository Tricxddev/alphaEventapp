const manualoGinUfetFXN=require("../controllers/manualLgnUseFet")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/userNameMFetch/:userEmail",manualoGinUfetFXN)

module.exports=router