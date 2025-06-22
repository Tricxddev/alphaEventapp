const organizersEventsFXN=require("../controllers/organizersEvents")
const express = require("express");
const router = express.Router();

router.get("/getOrganizerEvents/:userID",organizersEventsFXN);
module.exports = router;