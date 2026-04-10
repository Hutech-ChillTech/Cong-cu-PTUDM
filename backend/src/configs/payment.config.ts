import dotenv from "dotenv";

dotenv.config();

export const PaymentConfig = {
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || "",
    accessKey: process.env.MOMO_ACCESS_KEY || "",
    secretKey: process.env.MOMO_SECRET_KEY || "",
    endpoint:
      process.env.MOMO_ENDPOINT ||
      "https://test-payment.momo.vn/v2/gateway/api/create",
    redirectUrl:
      process.env.MOMO_REDIRECT_URL ||
      `${process.env.BASE_URL || "http://localhost:3000"}/api/payment/momo/callback`,
    ipnUrl:
      process.env.MOMO_IPN_URL ||
      `${process.env.BASE_URL || "http://localhost:3000"}/api/payment/momo/ipn`,
  },
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE || "",
    hashSecret: process.env.VNPAY_HASH_SECRET || "",
    url:
      process.env.VNPAY_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl:
      process.env.VNPAY_RETURN_URL ||
      `${process.env.BASE_URL || "http://localhost:3000"}/api/payment/vnpay/callback`,
    apiUrl:
      process.env.VNPAY_API_URL ||
      "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  },
};
