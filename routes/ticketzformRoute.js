const {ticketzform} = require('../controllers/ticketzform');
const express = require('express');
const router = express.Router();

router.get('/ticketzform/:reference', ticketzform);
module.exports = router;