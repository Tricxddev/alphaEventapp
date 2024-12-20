const orgUserCreatFXN=require("../controllers/featuredEvnt")
const express = require("express")
const { Module } = require("module")
const router = express.Router()

router.get("/creat%ORGoRg/:userID",orgUserCreatFXN)

module.exports=router