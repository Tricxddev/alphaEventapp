const express = require('express');
const router = express.Router();
// const {authFxn} = require('../middleware/auth');
const { initiateWithdrawal, updateTotalEarnings, approveWithdrawal, getWithdrawals,getPENDINGWithdrawalsADMINview,withdrawalDetails } = require('../controllers/finance');

// Bank details
// router.post('/bank-details', authFxn, saveOrUpdateBankDetails); // POST /api/bank-details
// Request withdrawal
router.post('/request-withdrawal/:userId', initiateWithdrawal); // POST /api/request-withdrawal

// Get withdrawal history
router.get('/withdrawal-history/:userId', getWithdrawals); // POST /api/request-withdrawal

// Get pending withdrawals (admin view)
router.get('/pendingWithdrawal', getPENDINGWithdrawalsADMINview);

// Get withdrawal details
router.get('/withdrawalDetails/:withdrawalID', withdrawalDetails);

// Update total earning
// router.put('/update/earnings', authFxn, updateTotalEarnings);

// Approve a withdrawal request
router.post("/approveWithdrawal/:withdrawalID", approveWithdrawal);

module.exports = router;
