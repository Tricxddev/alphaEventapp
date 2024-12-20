const loginFXN=require("../controllers/loGin")
const express = require("express")
const { Module } = require("module")
const router = express.Router()

router.get("/loginUser",loginFXN)

module.exports=router