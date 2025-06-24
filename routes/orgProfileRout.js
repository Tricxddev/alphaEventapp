const {orgProfileFXN,orgProfileUpdateFXN}= require("../controllers/orgProfile")
const express = require("express")
const router = express.Router()
const { Module } = require("module")

router.get("/orgProfile/:userID", orgProfileFXN);
router.patch("/orgProfileUpdate/:userID", orgProfileUpdateFXN);

module.exports = router;