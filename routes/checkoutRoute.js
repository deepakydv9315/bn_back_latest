const router = require("express").Router();

const { isAutheticatedUser } = require("../middlewares/isAuthenticated");
const { checkDelevery } = require("../middlewares/delivery.middleware");

// Controller
const {
  checkout,
  placeOrder,
  redirect,
  getOrberById,
} = require("../controllers/checkoutController");

// To Create An Inovice

// Validate Coupon and Validate Product First
router.route("/placeOrder").post(isAutheticatedUser, checkDelevery, placeOrder);

// For Order
router.route("/order/:id").get(isAutheticatedUser, getOrberById);

// Validate Price First
router.route("/checkOut").post(checkout);
router.route("/redirect").post(redirect);
module.exports = router;
