const {myEventDashFXN,orgMYeventsDashDetaisFXN,DashupcomingFXN,ticketSoldOverviewDashDetaisFXN} = require("../controllers/myEventsDash");
const express = require("express")
const router = express.Router()
const { Module } = require("module")

router.get("/dashbdUpcomingEvent/:userID", DashupcomingFXN)
router.get("/dashboardTicketsoldView/:userID", ticketSoldOverviewDashDetaisFXN)
router.get("/orgMYevents/:userID", myEventDashFXN)
router.get("/orgMYeventdetails/:userID/:eventID", orgMYeventsDashDetaisFXN)
module.exports = router