const {
  checkStatusUrl,
  merchentId,
  merchentSaltIndex,
  merchentSaltKey,
} = require("../config/config");

const crypto = require("crypto");
const axios = require("axios");

// To Check Transaction Status
const checkTransactionStatus = async (merchantTransactionId) => {
  const concatenatedString =
    `/pg/v1/status/${merchentId}/${merchantTransactionId}` + merchentSaltKey;

  const hash = crypto
    .createHash("sha256")
    .update(concatenatedString)
    .digest("hex");

  const X_Verify = hash + "###" + merchentSaltIndex;

  const response = await axios.get(
    `${checkStatusUrl}/${merchentId}/${merchantTransactionId}`,
    {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": X_Verify,
        "X-MERCHANT-ID": merchentId,
      },
    }
  );

  return response.data;
};

module.exports = {
  checkTransactionStatus,
};
