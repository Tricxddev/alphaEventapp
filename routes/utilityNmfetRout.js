const utilityNmfetchFXN=require("../controllers/utilityNmfetch")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/userNamFetch/:userEmail",utilityNmfetchFXN)

module.exports=router