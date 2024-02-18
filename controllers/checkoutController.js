const OrderModel = require("../models/OrderModel");
const { success, error } = require("../utils/responseWrapper");
const crypto = require("crypto");
const dotenv = require("dotenv");
const axios = require("axios");
const { phonePe_API_URL } = require("../config/config");

dotenv.config({ path: "../config/config.env" });
const { checkTransactionStatus } = require("../utils/checkOrderStatus");
const transporter = require("../config/emailTransport");
const { shipRocketPlaceAnOrder } = require("../utils/shipRocket");

const getOrberById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findOne({ orderId: id }).populate(
      "orderItems.product",
      "name"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        data: "Order Not Found",
      });
    }

    res.send(success(200, order));
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      data: "Order Id Not Found",
    });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (paymentMethod === "Online") {
      await OrderModel.findByIdAndUpdate(req.order._id, {
        paymentInfo: {
          id: req.phonePe.data.merchantTransactionId,
          status: "Paid",
        },
      });

      res.send(
        success(200, {
          url: req.phonePe.data.instrumentResponse.redirectInfo.url,
        })
      );
    } else if (paymentMethod === "COD") {
      // Send Email To User
      const order = req.order;
      const shipRocketData = req.cod;

      await transporter.sendMail({
        from: process.env.EMAIL_ID,
        to: order.shippingInfo.email,
        subject: "Yay! Your order is confirmed!",
        text: `Thank you for trusting us! We are thrilled to confirm that your order, ${order.orderId}, has been received and is being processed. Here is Shipment Id ${shipRocketData.shipment_id} \nWe are excited to get your order to you as soon as possible and will keep you updated on the status of your shipment. If you have any questions or concerns, please don’t hesitate to contact us. \n\nWarm Regards,\nTeam Burly Nutrition`,
      });

      const adminText = `
      New Order Received
      \nName : ${order.shippingInfo.name} 
      \nOrder Id is ${order.orderId}
      \nProduct List : ${order.orderItems.map(
        (item) => `${item.quantity} x ${item.name}`
      )}
      \nPayment Mode : Postpaid
      \nAmmount : ${order.totalPrice}
      \nMobile Number : ${order.shippingInfo.phoneNo}
      \nAddress : ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${
        order.shippingInfo.state
      }, ${order.shippingInfo.postalCode}
      \nShipment Id is ${shipRocketData.shipment_id}
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_ID,
        to: "support@burlynutrition.com",
        subject: "New Order Received",
        text: adminText,
      });
      res.send(
        success(200, {
          message: "Order Place Successfully",
          orderId: req.order.orderId,
        })
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: "Checkout Failed",
    });
  }
};

const checkout = async (req, res) => {
  try {
    // send email to user
    const sendEmailData = await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: req.body.email,
      subject: "Order Placed Successfully",
      text: `Your Order Has Been Placed Successfully \nOrder Id is ORD-${Date.now()}`,
    });

    // In Development
    res.status(200).json({
      success: true,
      data: "Check Out Page",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      data: "Checkout Failed edit",
    });
  }
};

const redirect = async (req, res) => {
  try {
    // To Check Wheter Payment is Success or Not
    if (req.body.code === "PAYMENT_SUCCESS") {
      /*
       ! make shipment
       ! and send the email to the user
      */

      // Check Order Status
      const transactionStatus = await checkTransactionStatus(
        req.body.transactionId
      );

      // Update Order Status
      const order = await OrderModel.findOneAndUpdate(
        {
          "paymentInfo.id": transactionStatus.data.merchantTransactionId,
        },
        {
          $set: {
            "paymentInfo.status": "Completed",
          },
        }
      );

      // ? Now i Have To Get All Data Related To Order By Id
      const shipRocketData = await shipRocketPlaceAnOrder(order, "Online");
      if (shipRocketData.status_code == 1) {
        // Store Shiprocket Data in Order
        const order = await OrderModel.findOneAndUpdate(
          {
            "paymentInfo.id": transactionStatus.data.merchantTransactionId,
          },
          {
            $set: {
              shipRocket: {
                order_id: shipRocketData.order_id,
                shipment_id: shipRocketData.shipment_id,
              },
            },
          }
        );

        // Send Email To User
        await transporter.sendMail({
          from: process.env.EMAIL_ID,
          to: order.shippingInfo.email,
          subject: "Yay! Your order is confirmed!",
          text: `Thank you for trusting us! We are thrilled to confirm that your order, ${order.orderId}, has been received and is being processed. Here is Shipment Id ${shipRocketData.shipment_id} \nWe are excited to get your order to you as soon as possible and will keep you updated on the status of your shipment. If you have any questions or concerns, please don’t hesitate to contact us. \n\nWarm Regards,\nTeam Burly Nutrition`,
        });

        const adminText = `
        New Order Received
        \nName : ${order.shippingInfo.name} 
        \nOrder Id is ${order.orderId}
        \nProduct List : ${order.orderItems.map(
          (item) => `${item.quantity} x ${item.name}`
        )}
        \nPayment Mode : Prepaid
        \nAmmount : ${order.totalPrice}
        \nMobile Number : ${order.shippingInfo.phoneNo}
        \nAddress : ${order.shippingInfo.address}, ${
          order.shippingInfo.city
        }, ${order.shippingInfo.state}, ${order.shippingInfo.postalCode}
        \nShipment Id is ${shipRocketData.shipment_id}
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_ID,
          to: "support@burlynutrition.com",
          subject: "New Order Received",
          text: adminText,
        });

        // Redirect to Success Page
        res.redirect(
          `${process.env.FRONTEND_URL}/orderSuccess/${order.orderId}`
        );
      }
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/checkout`);
    }
  } catch (error) {
    console.log("On Redirect Page Error : ", error.message);
    res.status(500).json({
      success: false,
      data: "Checkout Failed",
    });
  }
};

module.exports = { checkout, placeOrder, redirect, getOrberById };
