const OrderModel = require("../models/OrderModel");

const { success, error } = require("../utils/responseWrapper");

const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({}).populate("user", "name");
    res.send(success(200, orders));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

exports.getAllOrders = getAllOrders;
