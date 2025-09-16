// const BankDetails = require('../model/BankDetails');
const Withdrawal = require('../model/Withdrawal');
const {allUserModel,indiOrgModel} = require('../model/organizerDB')
const mongoose =require("mongoose")
const jwt=require("jsonwebtoken")
const sendAdminEmail = require("../services/SendAdminMail");
const axios = require('axios');

// Create or Update bank details
// exports.saveOrUpdateBankDetails = async (req, res) => {
//   const userId = req.user.id;
//   const {accountHolderName, accountNumber, bankSortCode, bankName } = req.body;

//   try {
//     // Basic validation
//     if (! accountHolderName || !accountNumber || !bankSortCode || !bankName) {
//       return res.status(400).json({ message: 'All bank details are required.' });
//     }

//     // Find existing bank detail by userId
//     let bankDetail = await BankDetails.findOne({ userId });

//     if (bankDetail) {
//       // Update existing bank details
//       bankDetail.accountHolderName = accountHolderName;
//       bankDetail.accountNumber = accountNumber;
//       bankDetail.bankSortCode = bankSortCode;
//       bankDetail.bankName = bankName;

//       await bankDetail.save();

//       return res.status(200).json({
//         message: 'Bank details updated successfully',
//         bankDetail
//       });
//     } else {
//       // Create new bank detail
//       bankDetail = await BankDetails.create({
//         userId,
//         accountHolderName,
//         accountNumber,
//         bankSortCode,
//         bankName
        
//       });

      
//       return res.status(201).json({
//         message: 'Bank details saved successfully',
//         bankDetail
//       });
//     }
//   } catch (err) {
//     console.error('Bank detail error:', err);
//     return res.status(500).json({
//       message: 'An error occurred while saving bank details',
//       error: err.message
//     });
//   }
// };


// Request withdrawl

// User initiates withdrawal request
exports.initiateWithdrawal = async (req, res) => {
  const { amount, reason } = req.body;
  // const userId = req.params;
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.refresTk);
  console.log("decoded", decoded);
  const user = await allUserModel.findOne({ email: decoded.email });
  const userId = user.userID;
  // const userId = decoded.userId;
// console.log("userId", userId);
// console.log("user", user);

  try {
    const indiUser = await indiOrgModel.findOne({ email: decoded.email});
    if (!indiUser) {
      return res.status(404).json({ message: "Organizer not found" });
    }
    const bankInfo = indiUser.bankDetails;
    if (!bankInfo) {
      return res.status(404).json({ message: "Bank details not found" });
    }

    // 2. Fetch user's earning
    // const user = await allUserModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // Generate unique withdrawalID
    const generateUniqueWithdrawalID = async () => {
  let unique = false;
  let withdrawalID = '';

  while (!unique) {
    const timestamp = Date.now();
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    withdrawalID = `WD-${timestamp}-${randomPart}`;

    const exists = await Withdrawal.findOne({ withdrawalID });
    if (!exists) unique = true;
  }

  return withdrawalID;
};

const withdrawalID = await generateUniqueWithdrawalID();

    if (amount > indiUser.totalEarning) {

       await Withdrawal.create({
        withdrawalID,
        user: indiUser._id,
        amount,
        reason,
        status: 'failed',
        failureReason: 'Withdrawal exceeds earnings'
       });
      return res.status(400).json({ message: "Withdrawal exceeds earnings" });
    }

    // Optional: Ensure user leaves minimum balance (e.g. ₦1500)
     const minimumBalance = 1500;
    // Check if amount exceeds totalEarning
    if (indiUser.totalEarning - amount < minimumBalance) {
      await Withdrawal.create({
        withdrawalID,
        user: indiUser._id,
        amount,
        reason,
        status: 'failed',
        failureReason: 'Amount exceeds available earnings'
      });

      return res.status(400).json({
        message: `You must leave at least ₦${minimumBalance} in your account. Maximum withdrawable amount is ₦${user.totalEarning - minimumBalance}.`
      });
    }

    // Check if it violates minimum balance rule
    if (indiUser.totalEarning - amount < minimumBalance) {
      await Withdrawal.create({
        user: indiUser._id,
        amount,
        reason,
        status: 'failed',
        failureReason: `Insufficient balance after enforcing minimum ₦${minimumBalance}`
      });

      return res.status(400).json({
        message: `You must leave at least ₦${minimumBalance} in your account. Maximum withdrawable amount is ₦${user.totalEarning - minimumBalance}.`
      });
    }

    

    const withdrawal = await Withdrawal.create({
      withdrawalID,
      user: indiUser._id,
      name: req.user.name,
      email: req.user.email,
      amount,
      reason,
      status: 'pending',
    });

     // Send admin confirmation email about the withdrawal request
    try {
      await sendAdminEmail({
        name: req.user.name || 'N/A',
        email: req.user.email || 'N/A',
        amount: withdrawal.amount,
       reason: withdrawal.reason,
        withdrawalID: withdrawal.withdrawalID,
      }); 
      console.log('Withdrawal request notification email sent to admin');  // Log email sent confirmation
    } catch (mailError) {
      console.error('Error sending confirmation email:', mailError);  // Log mail sending error
      return res.status(500).json({ message: "Error sending email. Please try again later." });
       // skip returning 500 here if email failure shouldn't block the response
    }
    return res.status(200).json({
      message: "Withdrawal request submitted for approval",
      withdrawal
    });
  } catch (error) {
    console.error('Initiate withdrawal error:', error.message);
    return res.status(500).json({ message: "Unable to process request", error: error.message });
  }
};



// Phase 2: Admin verifies and processes withdrawal
exports.approveWithdrawal = async (req, res) => {
  const { withdrawalID } = req.params;
  const tk = req.headers.authorization;
  // console.log("withdrawalID:", withdrawalID);
 
  try {
    if (!tk) {
      return res.status(401).json({ message: "Access Denied!" });
    }
    // console.log("Token:", tk);
    const token = tk.split(" ")[1];
    const decoded = jwt.verify(token, process.env.refresTk);
    // console.log("Decoded token:", decoded);

    if (!decoded || !decoded.email) {
      return res.status(401).json({ message: "Invalid login details" });
    }

    const user = await allUserModel.findOne({ email: decoded.email });
    // console.log("Admin user:", user);

    if (!user) {
      return res.status(404).json({ message: "User account not found!" });
    }
    if (user.role !== 'adminz') {
      return res.status(403).json({ message: "Only admins can approve withdrawals" });
    }
  // 1. Find the withdrawal by custom withdrawalID and populate the user
    const withdrawal = await Withdrawal.findOne({ withdrawalID })/*.populate('user');*/
    // console.log("Withdrawal found:", withdrawal);
    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(404).json({ message: "Pending withdrawal not found" });
    }

    // 2. Get user ID properly
    const withdrawalUserId = withdrawal.user._id.toString();
    // console.log("Withdrawal User ID:", withdrawalUserId);

    // 3. Fetch bank info
    const indiUser = await indiOrgModel.findOne({ userID: withdrawalUserId });
    const bankInfo = indiUser.bankDetails;
    // console.log("Bank Info:", bankInfo);
    if (!bankInfo) {
      return res.status(404).json({ message: "Bank details not found" });
    }

    // // 5. Create Paystack recipient
    // const recipientRes = await axios.post(
    //   'https://api.paystack.co/transferrecipient',
    //   {
    //     type: 'nuban',
    //     name: bankInfo.accountHolderName || 'User',
    //     account_number: bankInfo.accountNumber,
    //     bank_code: bankInfo.bankSortCode,
    //     currency: 'NGN'
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    const https = require('https')

    const params = JSON.stringify({
      "type": "nuban",
      "name": `${bankInfo.accountHolderName}`,
      "account_number": `${bankInfo.accountNumber}`,
      "bank_code": `${bankInfo.bankSortCode}`,
      "currency": "NGN"
    })

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transferrecipient',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }

    const req = https.request(options, res => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      });

      res.on('end', () => {
        console.log(JSON.parse(data))
      })
    }).on('error', error => {
      console.error(error)
    })

    req.write(params)
    req.end()
    console.log(JSON.stringify(recipientRes.data, null, 2));
    const recipientCode = recipientRes.data.data.recipient_code;


    // 6. Initiate transfer
    const transferRes = await axios.post(
      'https://api.paystack.co/transfer',
      {
        source: 'balance',
        amount: withdrawal.amount * 100,
        recipient: recipientCode,
        reason: withdrawal.reason
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
//  7. If transfer is successful
    if (transferRes.data.status && transferRes.data.data.status === 'success') {
      // Update withdrawal record
      withdrawal.status = 'successful';
      withdrawal.transferCode = transferRes.data.data.transfer_code;
      await withdrawal.save();

    // Comment this section if Paystack is uncommented
    // Simulate successful withdrawal
    // withdrawal.status = 'successful';
    // withdrawal.transferCode = 'TEST_CODE_123'; // Dummy code
    // await withdrawal.save();


      // Deduct from user's total earning
      const user = await indiOrgModel.findById({ userID: withdrawalUserId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }


      user.totalEarning -= withdrawal.amount;
      await user.save();

      return res.status(200).json({
        message: "Withdrawal approved and completed",
        withdrawal,
        newBalance: user.totalEarning
      });

    } else {
      withdrawal.status = 'failed';
      await withdrawal.save();
      return res.status(500).json({ message: "Transfer via Paystack failed", withdrawal });
    }

  } catch (error) {
    console.error('Approve withdrawal error:', error.message);
    return res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

// // To top up Tootal earning Manually for demo account

// exports.updateTotalEarnings = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assuming user is attached to req by your auth middleware
//     const { amount } = req.body;

//     // Validate input
//     if (amount === undefined || typeof amount !== 'number' || amount < 0) {
//       return res.status(400).json({ message: 'A valid amount is required.' });
//     }

//     // Find the user by ID
//     const user = await allUserModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Update the totalEarning field
//     user.totalEarning += amount;
//     await user.save();

//     return res.status(200).json({
//       message: 'Total earning updated successfully.',
//       totalEarning: user.totalEarning
//     });

//   } catch (error) {
//     console.error('Error updating earnings:', error);
//     return res.status(500).json({ message: 'Server error. Please try again later.' });
//   }
// };

//Withdrawal history
exports.getWithdrawals = async (req, res) => {
  try {
    const userId = req.params;
    let { page = 1, limit = 10 } = req.query;

    // Parse pagination values to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: 'Invalid pagination values' });
    }

    // Find all withdrawals for this user, no status filtering
    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments({ user: userId });

    res.status(200).json({
      withdrawals, // Each will have its status field (if your schema includes it)
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

