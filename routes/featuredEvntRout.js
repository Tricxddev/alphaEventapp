const fetureventFXN=require("../controllers/featuredEvnt")
const express = require("express")
const { Module } = require("module")
const router = express.Router()

router.get("/verifyUser/:userID",fetureventFXN)

module.exports=router