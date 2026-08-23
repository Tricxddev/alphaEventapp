const {purchaseListFXN} = require("../controllers/purchaseList");
// const {authFxn} = require('../middleware/auth'); 
const express = require("express")
const router = express.Router()
//GET ALL LINE ITEMS FOR A SPECIFIC ORGANIZER
router.get("/purchaseItems/:userID", purchaseListFXN);

module.exports = router;