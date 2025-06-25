const {totRevnTikFXN} = require("../controllers/totalRevnTikbyOrg")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.get('/orGTotRev/:userID', totRevnTikFXN);


module.exports = router;