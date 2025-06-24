const {myEventDashFXN,orgMYeventsDashDetaisFXN} = require("../controllers/myEventsDash");
const express = require("express")
const router = express.Router()
const { Module } = require("module")

router.get("/orgMYevents/:userID", myEventDashFXN)
router.get("/orgMYeventdetails/:userID/:eventID", orgMYeventsDashDetaisFXN)
module.exports = router