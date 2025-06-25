const {supportFXN}= require("../controllers/supportCall")
const express = require("express")
//const { Module } = require("module")
const router = express.Router()

router.post("/create-support", supportFXN) // Create a new support ticket
//router.patch("/revSupport/:supportID", updateSupportStatus) // Update support status by supportID

module.exports = router;