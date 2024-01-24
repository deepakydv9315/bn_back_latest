const OrderModel = require("../models/OrderModel");
const { success, error } = require("../utils/responseWrapper");
const crypto = require("crypto");
const dotenv = require("dotenv");
const axios = require("axios");
const {
  merchentId,
  merchentSaltIndex,
  merchentSaltKey,
  merchentUserId,
  phonePe_API_URL,
  callBackUrl,
  redirectUrl,
} = require("../config/config");

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

    console.log(order);

    const payload = JSON.stringify({
      merchantId: merchentId,
      merchantTransactionId: `TRX-${Date.now()}`,
      merchantUserId: merchentUserId,
      amount: parseInt(req.body.total) * 100,
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: callBackUrl,
      mobileNumber: req.body.phone,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    });

    const base64_encoded = Buffer.from(payload).toString("base64");

    const concatenatedString = base64_encoded + "/pg/v1/pay" + merchentSaltKey;

    const hash = crypto
      .createHash("sha256")
      .update(concatenatedString)
      .digest("hex");

    const X_Verify = hash + "###" + merchentSaltIndex;

    axios
      .post(
        phonePe_API_URL,
        { request: base64_encoded },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": X_Verify,
          },
        }
      )
      .then(async (response) => {
        await OrderModel.findByIdAndUpdate(order._id, {
          paymentInfo: {
            id: response.data.data.merchantTransactionId,
            status: "Paid",
          },
        });
        res.status(200).json(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
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
      const shipRocketData = await shipRocketPlaceAnOrder(order);
      console.log(shipRocketData.status_code);
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
        const eMailData = await transporter.sendMail({
          from: process.env.EMAIL_ID,
          to: order.shippingInfo.email,
          subject: "Order Placed Successfully",
          text: `Your Order Has Been Placed Successfully \nOrder Id is ${order.orderId} \nShipment Id is ${shipRocketData.shipment_id}`,
        });

        // Redirect to Success Page
        res.redirect(
          `${process.env.FRONTEND_URL}/orderSuccess/${order.orderId}`
        );
      }

      // Send Email To User
      // await sendEmail({
      //   email: req.user.email,
      //   subject: "Order Placed Successfully",
      //   message: "Your Order Has Been Placed Successfully",
      // });

      // Place order to Shiprocket

      // Redirect to Success Page
      // window.location.href = `${process.env.FRONTEND_URL}/orderSuccess/${req.body.transactionId}`;
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
