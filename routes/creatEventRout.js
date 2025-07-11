const creatEventFXN=require("../controllers/creatEnvt")
const express = require("express")
const { Module } = require("module")
const multer = require("multer");
const upload = multer().none(); // no files, just fields

const router = express.Router()

router.post("/createVnt/:userID",upload,creatEventFXN)

module.exports=router