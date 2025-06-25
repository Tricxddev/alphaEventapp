const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
  supportID: { type: String, unique: true }, // This remains unique
  userName: { type: String, required: true },
  userEmail: {
  type: String,
  required: false,
  unique: false, // ← Make sure this is NOT true
  lowercase: true,
  trim: true
},

  phone: { type: String },
  ticketID: { type: String },
  issueCategory: {
    type: String,
    enum: ["Failed Payment", "Didn't Receive a Ticket", "Debited Twice", "Others"],
    required: true
  },
  assignedTo: { type: String }, // This can be used to assign a support staff
  message: { type: String },
  supportStatus: {
    type: String,
    enum: ["Open", "Resolved", "Escalated"],
    default: "Open"
  },
 
    img: { type: String }, // Cloudinary Image URL
      
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const SupportModel = new mongoose.model("SupportModel", supportSchema);


module.exports = SupportModel;

