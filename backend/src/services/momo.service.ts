import crypto from "crypto";
import axios from "axios";
import { PaymentConfig } from "../configs/payment.config";

export interface MoMoPaymentRequest {
  amount: number;
  orderInfo: string;
  orderId: string;
  extraData?: string;
  requestId?: string;
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
}

export class MoMoService {
  private partnerCode: string;
  private accessKey: string;
  private secretKey: string;
  private endpoint: string;
  private redirectUrl: string;
  private ipnUrl: string;

  constructor() {
    this.partnerCode = PaymentConfig.momo.partnerCode;
    this.accessKey = PaymentConfig.momo.accessKey;
    this.secretKey = PaymentConfig.momo.secretKey;
    this.endpoint = PaymentConfig.momo.endpoint;
    this.redirectUrl = PaymentConfig.momo.redirectUrl;
    this.ipnUrl = PaymentConfig.momo.ipnUrl;
  }

  /**
   * Tạo chữ ký HMAC SHA256
   */
  private createSignature(rawData: string): string {
    return crypto
      .createHmac("sha256", this.secretKey)
      .update(rawData)
      .digest("hex");
  }

  /**
   * Tạo yêu cầu thanh toán MoMo
   */
  async createPayment(
    request: MoMoPaymentRequest
  ): Promise<MoMoPaymentResponse> {
    const { amount, orderInfo, orderId, extraData = "", requestId } = request;

    const finalRequestId = requestId || `${orderId}_${Date.now()}`;
    const requestType = "payWithMethod";
    const orderGroupId = "";
    const autoCapture = true;
    const lang = "vi";

    // Tạo raw signature theo thứ tự alphabet
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${finalRequestId}&requestType=${requestType}`;

    const signature = this.createSignature(rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: "Hutech-Edu",
      storeId: "HutechEduStore",
      requestId: finalRequestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      orderGroupId,
      signature,
    };

    try {
      const response = await axios.post<MoMoPaymentResponse>(
        this.endpoint,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "MoMo Payment Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Lỗi kết nối MoMo Payment Gateway"
      );
    }
  }

  /**
   * Xác thực callback từ MoMo
   */
  verifyCallback(callbackData: any): boolean {
    console.log("\n=== MoMo Signature Verification ===");
    console.log("Raw callback data:", callbackData);

    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = callbackData;

    console.log("Received signature:", signature);
    console.log("Partner Code:", partnerCode);
    console.log("Order ID:", orderId);
    console.log("Result Code:", resultCode);
    console.log("Amount:", amount);
    console.log("Extra Data:", extraData || "");
    console.log("Message:", message);
    console.log("Order Info:", orderInfo);

    // Handle empty extraData - MoMo gửi "" nếu không có
    const safeExtraData = extraData || "";

    // Tạo raw signature theo thứ tự alphabet
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${safeExtraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    console.log("Raw signature string:");
    console.log(rawSignature);

    const computedSignature = this.createSignature(rawSignature);
    console.log("Computed signature:", computedSignature);
    console.log("Received signature:", signature);
    console.log("Match:", computedSignature === signature);
    console.log("==================================\n");

    return computedSignature === signature;
  }

  /**
   * Xác thực IPN (Instant Payment Notification)
   */
  verifyIPN(ipnData: any): boolean {
    return this.verifyCallback(ipnData);
  }

  /**
   * Kiểm tra trạng thái giao dịch
   */
  async checkTransactionStatus(
    orderId: string,
    requestId: string
  ): Promise<any> {
    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}`;
    const signature = this.createSignature(rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      requestId,
      orderId,
      signature,
      lang: "vi",
    };

    try {
      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/query",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "MoMo Check Status Error:",
        error.response?.data || error.message
      );
      throw new Error("Lỗi kiểm tra trạng thái giao dịch MoMo");
    }
  }

  /**
   * Hoàn tiền
   */
  async refundPayment(
    orderId: string,
    amount: number,
    transId: string
  ): Promise<any> {
    const requestId = `${orderId}_refund_${Date.now()}`;
    const description = `Hoàn tiền cho đơn hàng ${orderId}`;

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}&transId=${transId}`;
    const signature = this.createSignature(rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      orderId,
      requestId,
      amount,
      transId,
      lang: "vi",
      description,
      signature,
    };

    try {
      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/refund",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "MoMo Refund Error:",
        error.response?.data || error.message
      );
      throw new Error("Lỗi hoàn tiền MoMo");
    }
  }
}
