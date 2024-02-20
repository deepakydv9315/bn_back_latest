// ? i will check for delivery
const OrderModel = require("../models/OrderModel");
const { createOrderByPhonePe } = require("../utils/pay");
const { shipRocketPlaceAnOrder } = require("../utils/shipRocket");

const checkDelevery = async (req, res, next) => {
  try {
    // ? i have store all order detail into database
    const order = await OrderModel.create({
      user: req.user._id,
      orderId: req.body.orderID,
      shippingInfo: {
        name: req.body.name,
        email: req.body.email,
        phoneNo: req.body.phone,
        address: req.body.address,
        postalCode: req.body.pincode,
        city: req.body.city,
        state: req.body.state,
        country: "India",
      },
      notes: req.body.notes,
      coupon: req.body.coupon,

      itemsPrice: req.body.total,
      totalPrice: req.body.total,
      status: "Pending",

      orderItems: req.body.products.map((order) => {
        return {
          name: order.name,
          quantity: order.productDefaultPrice.quantity,
          price: order.productDefaultPrice.price,
          sku: order.productDefaultPrice.sku,
          product: order._id,
        };
      }),
    });
    const { paymentMethod } = req.body;
    req.order = order;
    if (paymentMethod === "COD") {
      const shipRocketData = await shipRocketPlaceAnOrder(order, paymentMethod);

      if (shipRocketData.status_code == 1) {
        req.cod = shipRocketData;
      }
      return next();
    } else if (paymentMethod === "Online") {
      const resPhonePe = await createOrderByPhonePe(
        req.body.total,
        req.body.phone
      );
      req.phonePe = resPhonePe;
      return next();
    }
  } catch (err) {
    console.log("Check Delivery () >>> ", err.message);
    res.status(500).json({
      success: false,
      data: "Check Delevery Failed",
    });
  }
};

module.exports = { checkDelevery };
