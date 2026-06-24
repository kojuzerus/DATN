const Order = require("../models/orderModel");
const { buildPaymentUrl, verifyReturn } = require("../config/vnpay");
const { createMomoPaymentUrl } = require("../config/momo");

exports.createVnpayPayment = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, userId: req.userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    if (order.paymentMethod !== "vnpay") {
      return res.status(400).json({ success: false, message: "Phương thức thanh toán không phải VNPay" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã được thanh toán" });
    }

    const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    const paymentUrl = buildPaymentUrl({
      amount: order.tongThanhToan,
      orderId: order._id.toString(),
      orderInfo: `Thanh toan don hang #${order._id.toString().slice(-8).toUpperCase()}`,
      ipAddr,
      locale: "vn",
    });

    // Log payment URL and signed params for debugging
    console.log('VNPay payment URL generated for order:', order._id.toString());
    console.log(paymentUrl);

    res.json({ success: true, paymentUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

exports.createMomoPayment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, userId: req.userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    if (order.paymentMethod !== "momo") {
      return res.status(400).json({ success: false, message: "Phương thức thanh toán không phải MoMo" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã được thanh toán" });
    }

    const paymentResult = await createMomoPaymentUrl({
      amount: order.tongThanhToan,
      orderId: order._id.toString(),
      orderInfo: `Thanh toan don hang #${order._id.toString().slice(-8).toUpperCase()}`,
      extraData: `orderId=${order._id.toString()}`,
    });

    console.log('MoMo payment payload for order:', order._id.toString(), paymentResult.raw);
    res.json({ success: true, paymentUrl: paymentResult.payUrl });
  } catch (err) {
    console.error('MoMo payment error:', err.response?.data || err.message || err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

exports.momoReturn = async (req, res) => {
  try {
    const params = { ...req.query };
    console.log('MoMo return params:', params);

    const orderId = params.orderId || params.orderId;
    const resultCode = params.resultCode || params.resultCode;
    const transactionNo = params.transId || "";
    const responseMessage = params.message || "";

    const order = await Order.findById(orderId);
    if (order) {
      if (resultCode === "0") {
        order.paymentStatus = "paid";
        order.paymentInfo = {
          transactionNo,
          bankCode: params.payType || "MoMo",
          payDate: new Date().toISOString(),
          responseCode: resultCode,
        };
      } else {
        order.paymentStatus = "failed";
        order.paymentInfo = {
          transactionNo,
          bankCode: params.payType || "MoMo",
          payDate: new Date().toISOString(),
          responseCode: resultCode,
        };
      }
      await order.save();
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/momo-return?success=${resultCode === "0"}&orderId=${orderId}&transactionNo=${transactionNo}&message=${encodeURIComponent(responseMessage)}`
    );
  } catch (err) {
    console.error(err);
    res.redirect(
      `${process.env.FRONTEND_URL}/momo-return?success=false&message=Loi server`
    );
  }
};

exports.momoNotify = async (req, res) => {
  try {
    const params = { ...req.body };
    console.log('MoMo notify params:', params);
    const orderId = params.orderId;
    const resultCode = params.resultCode?.toString();
    const transactionNo = params.transId || "";

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({ status: 'fail', message: 'Order not found' });
    }

    if (resultCode === "0") {
      order.paymentStatus = "paid";
    } else {
      order.paymentStatus = "failed";
    }

    order.paymentInfo = {
      transactionNo,
      bankCode: params.payType || "MoMo",
      payDate: new Date().toISOString(),
      responseCode: resultCode || "",
    };
    await order.save();
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const params = { ...req.query };
    console.log('VNPay return params:', params);

    const isValid = verifyReturn(params);
    const orderId = params.vnp_TxnRef;
    const responseCode = params.vnp_ResponseCode;
    const transactionNo = params.vnp_TransactionNo;
    const bankCode = params.vnp_BankCode;
    const payDate = params.vnp_PayDate;

    if (!isValid) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/vnpay-return?success=false&message=Chu ky khong hop le&orderId=${orderId}`
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/vnpay-return?success=false&message=Khong tim thay don hang&orderId=${orderId}`
      );
    }

    if (responseCode === "00") {
      order.paymentStatus = "paid";
      order.paymentInfo = {
        transactionNo,
        bankCode,
        payDate,
        responseCode,
      };
      await order.save();
    } else {
      order.paymentStatus = "failed";
      order.paymentInfo = {
        transactionNo,
        bankCode,
        payDate,
        responseCode,
      };
      await order.save();
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/vnpay-return?success=${responseCode === "00"}&orderId=${orderId}&transactionNo=${transactionNo || ""}`
    );
  } catch (err) {
    console.error(err);
    res.redirect(
      `${process.env.FRONTEND_URL}/vnpay-return?success=false&message=Loi server`
    );
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const params = { ...req.query };
    console.log('VNPay IPN params:', params);

    const isValid = verifyReturn(params);
    const orderId = params.vnp_TxnRef;
    const responseCode = params.vnp_ResponseCode;
    const transactionNo = params.vnp_TransactionNo;
    const bankCode = params.vnp_BankCode;
    const payDate = params.vnp_PayDate;

    if (!isValid) {
      return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
    }

    if (responseCode === "00") {
      order.paymentStatus = "paid";
      order.paymentInfo = {
        transactionNo,
        bankCode,
        payDate,
        responseCode,
      };
      await order.save();
      return res.status(200).json({ RspCode: "00", Message: "Confirm success" });
    } else {
      order.paymentStatus = "failed";
      order.paymentInfo = {
        transactionNo,
        bankCode,
        payDate,
        responseCode,
      };
      await order.save();
      return res.status(200).json({ RspCode: "00", Message: "Confirm failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      success: true,
      paymentStatus: order.paymentStatus || "unpaid",
      paymentInfo: order.paymentInfo || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
