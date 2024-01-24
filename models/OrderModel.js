const mongoose = require("mongoose");

// Define category schema
const orderSchema = new mongoose.Schema(
  {
    // User who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcommerceUser",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
    },

    // Order Items
    orderItems: [Object],

    // Product will Be Shipped to
    shippingInfo: Object,
    shipRocket: Object,

    notes: {
      type: String,
      required: false,
      default: "",
    },
    coupon: {
      type: String,
      required: false,
      default: "",
    },

    // Total Items Price
    itemsPrice: {
      type: String,
      required: true,
      default: "0.0",
    },

    // remove tax for now

    // taxPrice: {
    //     type: Number,
    //     required: true,
    //     default: 0.0,
    // },

    // Remove Shipping Price for now

    // shippingPrice: {
    //     type: Number,
    //     required: true,
    //     default: 0.0,
    // },

    // Price At Checkout
    totalPrice: {
      type: String,
      required: true,
      default: "0.0",
    },

    // Payment Info
    paymentInfo: {
      id: {
        type: String,
      },

      status: {
        type: String,
      },
    },

    // Order Status
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Completed", "Cancelled", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
