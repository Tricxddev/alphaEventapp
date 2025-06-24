const {orgBnkDetFXN,orgBnkDetfetchFXN} = require("../controllers/orgBankDetail");
const express = require("express")
const router = express.Router()
const { Module } = require("module")


router.patch("/orgBankDetails/:userID", orgBnkDetFXN)
router.get("/orgBankDetailsfetch/:userID", orgBnkDetfetchFXN)
module.exports = router