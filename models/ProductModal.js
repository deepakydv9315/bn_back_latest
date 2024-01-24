const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Product Name"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Please Enter Product Description"],
    },
    longDescription: {
      type: String,
      required: [true, "Please Enter Product Description"],
    },
    productCategory: {
      type: String,
      required: [true, "Please Enter Product Category"],
    },
    productDetails: Object,
    productFlavour: {
      type: String,
      required: [true, "Please Enter Product Flavour"],
    },
    sellingCategory: {
      type: String,
      required: [true, "Please Enter Product Selling Category"],
    },

    /*   images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ], */
    /*   numOfReviews: {
    type: Number,
    default: 0,
  }, */
    // reviews: [
    //   {
    //     user: {
    //       type: mongoose.Schema.ObjectId,
    //       ref: "EcommerceUser",
    //       required: true,
    //     },
    //     name: {
    //       type: String,
    //       required: true,
    //     },
    //     rating: {
    //       type: Number,
    //       required: true,
    //     },
    //     comment: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],
    // user: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "EcommerceUser",
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
