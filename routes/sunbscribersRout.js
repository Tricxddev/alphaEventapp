const {SUBSCRIBERFXN,UNSUBSCRIBERFXN,GETALLSUBSCRIBERFXN}=require("../controllers/subscribers")
const express = require("express")
const router = express.Router()
const { Module } = require("module")

// SUBSCRIBERS
router.post("/userSubscribe", SUBSCRIBERFXN);
// UNSUBSCRIBERS
router.post("/userUNSubscribe", UNSUBSCRIBERFXN);
// GET ALL SUBSCRIBERS
router.get("/getAllSubscribers", GETALLSUBSCRIBERFXN);
module.exports = router;