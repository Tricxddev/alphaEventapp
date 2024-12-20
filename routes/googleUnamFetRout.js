const googleUnmFetFXN=require("../controllers/googleUnameGet")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get("/userNameFetch/",googleUnmFetFXN)

module.exports=router