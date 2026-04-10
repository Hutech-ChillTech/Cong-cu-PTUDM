import { VNPay, ProductCode, VnpLocale } from "vnpay";
import { PaymentConfig } from "../configs/payment.config";

export interface VNPayPaymentRequest {
  amount: number;
  orderInfo: string;
  orderId: string;
  ipAddr: string;
  bankCode?: string;
  locale?: string;
}

export interface VNPayCallbackData {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_PayDate: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHashType: string;
  vnp_SecureHash: string;
}

export class VNPayService {
  private vnpay: VNPay;

  constructor() {
    this.vnpay = new VNPay({
      vnpayHost: "https://sandbox.vnpayment.vn",
      tmnCode: PaymentConfig.vnpay.tmnCode,
      secureSecret: PaymentConfig.vnpay.hashSecret,
      testMode: true,
    });
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  createPaymentUrl(request: VNPayPaymentRequest): string {
    const {
      amount,
      orderInfo,
      orderId,
      ipAddr,
      bankCode = "",
      locale = "vn",
    } = request;

    const date = new Date();

    console.log("\n=== VNPay Library Payment Debug ===");
    console.log("1. Input Amount (VND):", amount);
    console.log("2. Amount for VNPay (x100):", amount * 100);
    console.log("3. TMN Code:", PaymentConfig.vnpay.tmnCode);
    console.log("4. Hash Secret:", PaymentConfig.vnpay.hashSecret);
    console.log("5. Return URL:", PaymentConfig.vnpay.returnUrl);

    // VNPay yêu cầu amount phải nhân 100 (đơn vị là đồng x 100)
    const vnpayAmount = amount * 100;

    const paymentUrl = this.vnpay.buildPaymentUrl({
      vnp_Amount: vnpayAmount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: PaymentConfig.vnpay.returnUrl,
      vnp_Locale: locale === "vn" ? VnpLocale.VN : VnpLocale.EN,
      vnp_CreateDate: this.formatDate(date),
      vnp_ExpireDate: this.formatDate(
        new Date(date.getTime() + 15 * 60 * 1000)
      ),
      ...(bankCode && { vnp_BankCode: bankCode }),
    });

    console.log("5. Generated Payment URL:");
    console.log(paymentUrl);
    console.log("===========================\n");

    return paymentUrl;
  }

  /**
   * Xác thực callback từ VNPay (Return URL)
   */
  verifyCallback(callbackData: VNPayCallbackData): {
    isValid: boolean;
    message: string;
  } {
    try {
      const verify = this.vnpay.verifyReturnUrl(callbackData);

      if (!verify.isVerified) {
        return {
          isValid: false,
          message: "Chữ ký không hợp lệ",
        };
      }

      if (!verify.isSuccess) {
        return {
          isValid: true,
          message: this.getResponseMessage(callbackData.vnp_ResponseCode),
        };
      }

      return {
        isValid: true,
        message: "Giao dịch thành công",
      };
    } catch (error: any) {
      console.error("VNPay Verify Callback Error:", error.message);
      return {
        isValid: false,
        message: "Lỗi xác thực callback",
      };
    }
  }

  /**
   * Xác thực IPN (Instant Payment Notification)
   */
  verifyIPN(callbackData: VNPayCallbackData): {
    isValid: boolean;
    message: string;
  } {
    try {
      const verify = this.vnpay.verifyIpnCall(callbackData);

      if (!verify.isVerified) {
        return {
          isValid: false,
          message: "Chữ ký không hợp lệ",
        };
      }

      if (!verify.isSuccess) {
        return {
          isValid: true,
          message: this.getResponseMessage(callbackData.vnp_ResponseCode),
        };
      }

      return {
        isValid: true,
        message: "Giao dịch thành công",
      };
    } catch (error: any) {
      console.error("VNPay Verify IPN Error:", error.message);
      return {
        isValid: false,
        message: "Lỗi xác thực IPN",
      };
    }
  }

  /**
   * Kiểm tra trạng thái giao dịch
   */
  async checkTransactionStatus(
    orderId: string,
    transactionNo: number,
    transactionDate: number
  ): Promise<any> {
    try {
      const date = new Date();
      const createDate = this.formatDate(date);
      const result = await this.vnpay.queryDr({
        vnp_RequestId: `${orderId}_${createDate}`,
        vnp_TxnRef: orderId,
        vnp_TransactionNo: transactionNo,
        vnp_TransactionDate: transactionDate,
        vnp_CreateDate: createDate,
        vnp_IpAddr: "127.0.0.1",
        vnp_OrderInfo: `Kiem tra giao dich ${orderId}`,
      });

      return result;
    } catch (error: any) {
      console.error("VNPay Check Status Error:", error.message);
      throw new Error("Lỗi kiểm tra trạng thái giao dịch VNPay");
    }
  }

  /**
   * Hoàn tiền
   */
  async refundPayment(
    orderId: string,
    amount: number,
    transactionNo: number,
    transactionDate: number,
    transactionType: string = "02",
    ipAddr: string = "127.0.0.1"
  ): Promise<any> {
    try {
      const date = new Date();
      const createDate = this.formatDate(date);
      const result = await this.vnpay.refund({
        vnp_RequestId: `${orderId}_refund_${createDate}`,
        vnp_TxnRef: orderId,
        vnp_Amount: amount,
        vnp_TransactionNo: transactionNo,
        vnp_TransactionDate: transactionDate,
        vnp_TransactionType: transactionType,
        vnp_CreateDate: createDate,
        vnp_CreateBy: "HutechEdu",
        vnp_IpAddr: ipAddr,
        vnp_OrderInfo: `Hoan tien ${orderId}`,
      });

      return result;
    } catch (error: any) {
      console.error("VNPay Refund Error:", error.message);
      throw new Error("Lỗi hoàn tiền VNPay");
    }
  }

  /**
   * Format date theo định dạng VNPay: YYYYMMDDHHmmss (as number)
   */
  private formatDate(date: Date): number {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return Number(`${year}${month}${day}${hours}${minutes}${seconds}`);
  }

  /**
   * Parse response code message
   */
  getResponseMessage(responseCode: string): string {
    const messages: { [key: string]: string } = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      "75": "Ngân hàng thanh toán đang bảo trì",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
      "99": "Các lỗi khác",
    };

    return messages[responseCode] || "Lỗi không xác định";
  }
}
