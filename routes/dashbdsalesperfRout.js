const{dashboardsalesFXN}=require("../controllers/dashbdsalesperf")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get('/dashboard-monthly-performance/:userID',dashboardsalesFXN)

module.exports = router