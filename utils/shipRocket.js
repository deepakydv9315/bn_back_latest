const CacheStorage = require("../utils/cacheStorage");
const axios = require("axios");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// For ShipRocket Authentication
const shipRocketAuth = async () => {
  try {
    CacheStorage.set("shipRocketToken", "");
    const loginData = {
      email: process.env.SHIP_ROCKET_EMAIL,
      password: process.env.SHIP_ROCKET_PASSWORD,
    };

    const response = await axios.post(
      `${process.env.SHIP_ROCKET_URL}/auth/login`,
      loginData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    CacheStorage.set("shipRocketToken", response.data.token);
  } catch (error) {
    console.log(error.message);
  }
};

const shipRocketPlaceAnOrder = async (order, method) => {
  const payload = JSON.stringify({
    order_id: order.orderId,
    order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    pickup_location: "Primary",
    channel_id: "", // Leave Blank
    comment: order.notes,
    billing_customer_name: order.shippingInfo.name,
    billing_last_name: "",
    billing_address: order.shippingInfo.address,
    billing_address_2: "",
    billing_city: order.shippingInfo.city,
    billing_pincode: parseInt(order.shippingInfo.postalCode),
    billing_state: order.shippingInfo.state,
    billing_country: order.shippingInfo.country,
    billing_email: order.shippingInfo.email, // ? Please Check This Again
    billing_phone: parseInt(order.shippingInfo.phoneNo),
    billing_alternate_phone: "", // ? Add This New Field
    shipping_is_billing: true,
    shipping_customer_name: "",
    shipping_last_name: "",
    shipping_address: "",
    shipping_address_2: "",
    shipping_city: "",
    shipping_pincode: "",
    shipping_country: "",
    shipping_state: "",
    shipping_email: "",
    shipping_phone: "", // Leave Blank Till Here
    order_items: order.orderItems.map((item) => {
      return {
        name: item.name,
        sku: item.sku,
        units: parseInt(item.quantity),
        selling_price: parseInt(item.price),
        discount: "", // Leave Blank
        tax: "", // Leave Blank
        hsn: "", // Leave Blank
      };
    }),
    payment_method: method === "COD" ? "COD" : "Prepaid",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0, // ! Start Doing Task From Here
    sub_total: parseInt(order.totalPrice),
    length: 10,
    breadth: 15,
    height: 20,
    weight: 2.5,
  });

  try {
    var token = CacheStorage.get().get("shipRocketToken");

    console.log("Line 92 >> ", token);
    const response = await axios.post(
      `${process.env.SHIP_ROCKET_URL}/orders/create/adhoc`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("ShipRocket Error: ", error.message); // Log the error message
  }
};

module.exports = { shipRocketAuth, shipRocketPlaceAnOrder };
