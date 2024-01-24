const {
  createPincode,
  getAllPincodes,
  createAndUpdateHeader,
  getHeaderLine,
  createCoupon,
  getAllCoupons,
  getCouponsByCode,
  sendContactInformation,
} = require("../controllers/utilsController");

const { isAutheticatedUser } = require("../middlewares/isAuthenticated");

const { getAllOrders } = require("../controllers/orderController");
const router = require("express").Router();

router.route("/allOrder").get(/* isAutheticatedUser, */ getAllOrders);
router.route("/util/pincode/create").post(createPincode);
router.route("/util/pincodes").get(getAllPincodes);
router.route("/util/header").post(createAndUpdateHeader);
router.route("/util/header").get(getHeaderLine);
router.route("/util/coupon/create").post(createCoupon);
router.route("/util/coupons").get(getAllCoupons);
router.route("/util/coupons/:code").get(getCouponsByCode);
router.route("/util/sendMessage").post(sendContactInformation);

module.exports = router;
