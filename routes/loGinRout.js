const loginFXN=require("../controllers/loGin")
const express = require("express")
const { Module } = require("module")
const router = express.Router()

router.post("/loginUser",loginFXN)

module.exports=router