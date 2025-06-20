const mongoose = require("mongoose");

const eventPromotionSchema = new mongoose.Schema({
    ReferenceID: { type: String, required: true, unique: true },
    eventID: { type: String, required: true, unique: true },
  eventName: { type: String},
  feature_duration: {
    type: String,
    enum: [
      "Weekend Boost (2 days)",
      "3-Day Boost (3 days)",
      "1 Week Boost (7 days)",
      "1 Month Boost (30 days)"
    ],
  },
  feature_cost: { type: Number, default: 0},
  boost_budget: { type: Number, default: 0 },
  estimated_reach: { type: Number, default: 0 },
  cost_per_audience: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  payment_status: {
    type:String,
    enum: [
        "Pending",
        "Paid",
        "Success"
    ],
    default: "Pending"
}
}, { timestamps: true });

const eventPromotModel = mongoose.model("EventPromotion", eventPromotionSchema);

module.exports = eventPromotModel;
