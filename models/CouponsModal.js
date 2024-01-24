const mongoose = require("mongoose");

// Define category schema
const CouponsSchema = new mongoose.Schema({
  couponNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
  },
  discount: {
    type: Number,
    required: true,
    trim: true,
  },
  applyRate: {
    type: Number,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("Coupon", CouponsSchema);
