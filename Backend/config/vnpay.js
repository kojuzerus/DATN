const crypto = require("crypto");
const querystring = require("querystring");

const {
  VNP_TMN_CODE = "626FJHBP",
  VNP_HASH_SECRET = "Y3NBO564BTTHE1WFP87BQRUY2B1S2Y",
  VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  VNP_RETURN_URL = "https://wrongful-sitcom-secluding.ngrok-free.dev/api/payment/vnpay-return",
} = process.env;

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

function buildSignData(params) {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys
    .filter(k => k !== "vnp_SecureHash" && k !== "vnp_SecureHashType")
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}

function buildPaymentUrl(params) {
  const { amount, orderId, orderInfo, ipAddr, locale = "vn" } = params;

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_Amount: Math.round(amount * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Locale: locale,
    vnp_ReturnUrl: VNP_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14),
    vnp_SecureHashType: "SHA512",
  };

  const signData = buildSignData(vnpParams);
  const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
  const signed = hmac.update(signData, "utf-8").digest("hex");
  vnpParams.vnp_SecureHash = signed;

  return VNP_URL + "?" + querystring.stringify(vnpParams);
}

function verifyReturn(params) {
  const { vnp_SecureHash, vnp_SecureHashType, ...rest } = params;
  const signData = buildSignData(rest);
  const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
  const expected = hmac.update(signData, "utf-8").digest("hex");
  return expected === vnp_SecureHash;
}

module.exports = { buildPaymentUrl, verifyReturn };
