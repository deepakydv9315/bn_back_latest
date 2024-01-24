const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

var merchentId,
  merchentSaltIndex,
  merchentSaltKey,
  phonePe_API_URL,
  merchentUserId,
  callBackUrl,
  redirectUrl,
  origin,
  checkStatusUrl;

if (process.env.STAGE == "PROD") {
  merchentId = process.env.PHONE_PAY_MERCHANT_ID;
  merchentSaltIndex = process.env.PHONE_PAY_MERCHANT_SALT_INDEX;
  merchentSaltKey = process.env.PHONE_PAY_MERCHANT_SALT_KEY;
  merchentUserId = "HIGHFLYER INC";
  phonePe_API_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
  redirectUrl = `${process.env.FRONTEND_URL}/api/v1/redirect`;
  callBackUrl = `${process.env.FRONTEND_URL}/api/v1/callback`;
  checkStatusUrl = `https://api.phonepe.com/apis/hermes/pg/v1/status`;
} else {
  merchentId = "PGTESTPAYUAT101";
  merchentSaltIndex = 1;
  merchentSaltKey = "4c1eba6b-c8a8-44d3-9f8b-fe6402f037f3";
  merchentUserId = "HIGHFLYER INC";
  phonePe_API_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
  // redirectUrl = `http://localhost:3000`;
  redirectUrl = `http://localhost:4000/api/v1/redirect`;
  callBackUrl = `http://localhost:4000/api/v1/callback`;
  checkStatusUrl = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status`;
}

if (process.env.NODE_ENV == "PROD") {
  origin = ["https://burlynutrition.com", "https://www.burlynutrition.com"];
} else {
  origin = ["http://localhost:3000"];
}

module.exports = {
  merchentId,
  merchentSaltIndex,
  merchentSaltKey,
  merchentUserId,
  phonePe_API_URL,
  callBackUrl,
  redirectUrl,
  checkStatusUrl,
  origin,
};
