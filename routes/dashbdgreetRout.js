const {getDashboardFXN} = require("../controllers/dashbdgreetings")
// const {authFxn} = require('../middleware/auth');
// const {logActivity}= require('../middleware/sessionChecker')
const express = require("express")
const router = express.Router()

router.get('/dashboard-greeting/:userID',getDashboardFXN)

module.exports = router