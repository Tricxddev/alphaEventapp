const express = require('express');
const router = express.Router();
const {authFxn} = require('../middleware/auth');
const { initiateWithdrawal, updateTotalEarnings, approveWithdrawal, getWithdrawals } = require('../controllers/finance');

// Bank details
// router.post('/bank-details', authFxn, saveOrUpdateBankDetails); // POST /api/bank-details
// Request withdrawal
router.post('/request-withdrawal/:userId', authFxn, initiateWithdrawal); // POST /api/request-withdrawal

// Get withdrawal history
router.get('/withdrawal-history/:userId', authFxn, getWithdrawals); // POST /api/request-withdrawal

// Update total earning
// router.put('/update/earnings', authFxn, updateTotalEarnings);

// Approve a withdrawal request
router.post("/approveWithdrawal/:withdrawalID", approveWithdrawal);

module.exports = router;
