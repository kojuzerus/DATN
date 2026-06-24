const crypto = require("crypto");
const axios = require("axios");

const {
  MOMO_PARTNER_CODE = "",
  MOMO_ACCESS_KEY = "",
  MOMO_SECRET_KEY = "",
  MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create",
  MOMO_REQUEST_TYPE = "captureMoMoWallet",
  MOMO_RETURN_URL = "http://localhost:5000/api/payment/momo-return",
  MOMO_NOTIFY_URL = "http://localhost:5000/api/payment/momo-notify",
} = process.env;

function buildSignature(params) {
  const raw = [
    `accessKey=${params.accessKey}`,
    `amount=${params.amount}`,
    `extraData=${params.extraData}`,
    `ipnUrl=${params.ipnUrl}`,
    `orderId=${params.orderId}`,
    `orderInfo=${params.orderInfo}`,
    `partnerCode=${params.partnerCode}`,
    `redirectUrl=${params.redirectUrl}`,
    `requestId=${params.requestId}`,
    `requestType=${params.requestType}`,
  ].join("&");

  return crypto.createHmac("sha256", MOMO_SECRET_KEY).update(raw, "utf8").digest("hex");
}

async function createMomoPaymentUrl({ amount, orderId, orderInfo, extraData }) {
  if (!MOMO_PARTNER_CODE || !MOMO_ACCESS_KEY || !MOMO_SECRET_KEY) {
    throw new Error("MoMo config is not fully configured");
  }

  const requestId = `${orderId}-${Date.now()}`;
  const redirectUrl = MOMO_RETURN_URL;
  const ipnUrl = MOMO_NOTIFY_URL;

  const payload = {
    partnerCode: MOMO_PARTNER_CODE,
    accessKey: MOMO_ACCESS_KEY,
    requestId,
    amount: amount.toString(),
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData: extraData || "",
    requestType: MOMO_REQUEST_TYPE,
    lang: "vi",
  };

  payload.signature = buildSignature({
    accessKey: payload.accessKey,
    amount: payload.amount,
    extraData: payload.extraData,
    ipnUrl: payload.ipnUrl,
    orderId: payload.orderId,
    orderInfo: payload.orderInfo,
    partnerCode: payload.partnerCode,
    redirectUrl: payload.redirectUrl,
    requestId: payload.requestId,
    requestType: payload.requestType,
  });

  const response = await axios.post(MOMO_ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  if (!response.data || response.data.errorCode !== 0) {
    const error = response.data ? JSON.stringify(response.data) : "Empty MoMo response";
    throw new Error(`MoMo API error: ${error}`);
  }

  return {
    payUrl: response.data.payUrl,
    raw: response.data,
  };
}

module.exports = { createMomoPaymentUrl };
