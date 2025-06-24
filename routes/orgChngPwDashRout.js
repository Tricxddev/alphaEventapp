const {changePwDashFXN}=require("../controllers/orgChngPwDash")
const express = require("express")
const router = express.Router()
const { Module } = require("module")

router.patch("/changePasswd/:userID", changePwDashFXN)

module.exports = router