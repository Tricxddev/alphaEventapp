const newUserFXN=require("../controllers/newUser")
const express = require("express")
const { Module } = require("module")
const router = express.Router()

router.get("/new&User",newUserFXN)

module.exports=router