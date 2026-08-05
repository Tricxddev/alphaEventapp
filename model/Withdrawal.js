// Withdrawal Model
const mongoose = require("mongoose");
const withdrawalSchema = new mongoose.Schema({
  withdrawalID: {type: String, unique: true},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "indiOrgModel",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 500
  },
  reason: {
    type: String,
    trim: true,
    default: "N/A"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "failed","paid","successful"],
    default: "pending"
  },
  newBalance: { type: String, default: null },
  failureReason: { type: String, default: null },
  transferCode: {
    type: String,
    default: null
  },
}, { timestamps: true });

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
module.exports = Withdrawal;