// To Generate Signature
const crypto = require("crypto");
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

const createOrderByPhonePe = async (total, phone) => {
  try {
    const payload = JSON.stringify({
      merchantId: merchentId,
      merchantTransactionId: `TRX-${Date.now()}`,
      merchantUserId: merchentUserId,
      amount: parseInt(total) * 100,
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: callBackUrl,
      mobileNumber: phone,
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

    const config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": X_Verify,
      },
    };

    const { data } = await axios.post(
      `${phonePe_API_URL}`,
      { request: base64_encoded },
      config
    );

    return data;
  } catch (err) {
    console.log("Phone Pay Fun() Error >> ", err.message);
    return err.message;
  }
};

const generateSignature = (payload) => {
  return crypto.createHash("sha256").update(payload).digest("hex");
};

module.exports = {
  generateSignature,
  createOrderByPhonePe,
};
