const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/create-vnpay/:id", auth, ctrl.createVnpayPayment);
router.post("/create-momo/:id", auth, ctrl.createMomoPayment);
router.get("/vnpay-return", ctrl.vnpayReturn);
router.get("/momo-return", ctrl.momoReturn);
router.post("/momo-notify", ctrl.momoNotify);
router.get("/vnpay-ipn", ctrl.vnpayIpn);
router.get("/status/:id", auth, ctrl.checkPaymentStatus);

module.exports = router;
