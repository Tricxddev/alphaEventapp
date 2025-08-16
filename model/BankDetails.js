
// Bank detaisl Schema to be removed completely
const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  accountHolderName:{type:String},
  accountNumber: { type: String, required: true },
  bankSortCode: { type: String, required: true },
  bankName: { type: String, required: true },
}, { timestamps: true });

const BankDetails = mongoose.model("BankDetails", bankDetailsSchema);
module.exports = BankDetails;


  