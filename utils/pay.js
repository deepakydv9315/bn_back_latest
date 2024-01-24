// To Generate Signature
const crypto = require("crypto");

const generateSignature = (payload) => {
  return crypto.createHash("sha256").update(payload).digest("hex");
};

module.exports = {
  generateSignature,
};
