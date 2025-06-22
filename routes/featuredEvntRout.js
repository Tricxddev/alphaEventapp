const fetureventFXN=require("../controllers/featuredEvnt")
const express = require("express")
const { Module } = require("module")
const router = express.Router()

router.get("/allFeaturedEvents",fetureventFXN)

module.exports=router