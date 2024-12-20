const verifyUserFXN=require("../controllers/verifyUser")
const express = require("express")
const { Module } = require("module")
const router = express.Router()

router.get("/fetureventAllGet",verifyUserFXN)

module.exports=router