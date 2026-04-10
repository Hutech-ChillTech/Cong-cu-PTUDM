import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircleOutlined,
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  DollarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Spin, message } from "antd";
import styles from "../../styles/PaymentResult.module.css";
import { courseService } from "../../service/course.service";
import { userService } from "../../service/user.service";
import {
  paymentService,
  type PaymentVerification,
} from "../../service/payment.service";
import type { Course, User } from "../../types/database.types";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy các tham số từ URL (Backend đã redirect về với đầy đủ thông tin)
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId"); // Backend trả về paymentId
  const partnerCode = searchParams.get("partnerCode");
  const amount = searchParams.get("amount");
  const responseTime = searchParams.get("responseTime");
  const orderInfo = searchParams.get("orderInfo");

  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [paymentDetails, setPaymentDetails] =
    useState<PaymentVerification | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug: Log tất cả query params (DISABLED)
  // useEffect(() => {
  //   console.log("=== PAYMENT SUCCESS PAGE DEBUG ===");
  //   console.log("Current URL:", window.location.href);
  //   console.log("All Query Params:");
  //   searchParams.forEach((value, key) => {
  //     console.log(`  ${key}: ${value}`);
  //   });
  //   console.log("Extracted values:");
  //   console.log("  orderId:", orderId);
  //   console.log("  paymentId:", paymentId);
  //   console.log("  partnerCode:", partnerCode);
  //   console.log("  amount:", amount);
  //   console.log("  responseTime:", responseTime);
  //   console.log("  orderInfo:", orderInfo);
  //   console.log("=================================");
  // }, [searchParams]);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // 1. Lấy thông tin User
        const storedUser = localStorage.getItem("user");
        const uid = localStorage.getItem("uid");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (uid) {
          const userData = await userService.getUserByUid(uid);
          setUser(userData);
        }

        // 2. Lấy dữ liệu từ sessionStorage (được set từ backend callback)
        const paymentDataStr = sessionStorage.getItem("paymentData");
        let currentPaymentId = paymentId; // Lấy từ URL trước

        if (paymentDataStr) {
          // Backend MỚI: Có sessionStorage
          const sessionData = JSON.parse(paymentDataStr);

          // Lưu thông tin cơ bản từ sessionStorage
          currentPaymentId = sessionData.paymentId;

          // Xóa sessionStorage sau khi đã lấy (tránh hiển thị lại khi refresh)
          sessionStorage.removeItem("paymentData");

          message.success(sessionData.message || "Thanh toán thành công!");
        } else if (currentPaymentId) {
          // Backend CŨ: Có paymentId trong URL nhưng không có sessionStorage
          // LƯU: Sẽ clean URL SAU KHI đã load xong data
          // window.history.replaceState({}, document.title, "/payment/success");
        } else {
          // Không có cả sessionStorage lẫn URL params

          // Fallback: Thử lấy từ pendingPaymentId trong localStorage
          const pendingId = localStorage.getItem("pendingPaymentId");
          if (pendingId) {
            currentPaymentId = pendingId;
          } else {
            message.warning("Không tìm thấy thông tin thanh toán.");
            setLoading(false);
            return;
          }
        }

        // 3. Gọi API verify để LẤY THÔNG TIN CHI TIẾT (Backend đã xử lý hết rồi)
        if (!currentPaymentId) {
          message.error("Không tìm thấy mã thanh toán.");
          setLoading(false);
          return;
        }

        const paymentData =
          await paymentService.verifyPaymentStatus(currentPaymentId);

        setPaymentDetails(paymentData);

        // 4. Kiểm tra enrollment (Backend đã tạo trong callback)
        if (paymentData.enrollment) {
          if (!paymentDataStr) {
            // Chỉ hiện message nếu chưa hiện từ sessionStorage
            message.success(
              "Thanh toán thành công! Bạn đã được ghi danh vào khóa học.",
            );
          }
        } else {
          message.warning(
            "Thanh toán thành công nhưng chưa tìm thấy thông tin ghi danh. Vui lòng liên hệ hỗ trợ.",
          );
        }

        // 5. Lấy thông tin khóa học
        if (paymentData.course?.courseId) {
          const courseData = await courseService.getCourseById(
            paymentData.course.courseId,
          );
          setCourse(courseData);
        }

        // 6. Xóa pendingPaymentId (nếu có)
        localStorage.removeItem("pendingPaymentId");

        // 7. Clean URL nếu có params (sau khi đã load xong data)
        if (orderId || paymentId) {
          window.history.replaceState({}, document.title, "/payment/success");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (errorMessage === "Unauthorized") {
          message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          setTimeout(() => navigate("/login"), 2000);
        } else if (errorMessage === "Forbidden") {
          message.error("Bạn không có quyền truy cập thanh toán này.");
        } else {
          message.error(
            "Có lỗi xảy ra khi tải thông tin thanh toán. Vui lòng liên hệ hỗ trợ.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId, orderId, navigate]);

  const formatCurrency = (value: string | number | null) => {
    if (!value) return "0đ";
    return Number(value).toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return new Date().toLocaleString("vi-VN");
    return new Date(Number(timestamp)).toLocaleString("vi-VN");
  };

  const getPaymentMethodName = (code: string | null) => {
    if (code === "MOMO") return "Ví MoMo";
    if (code === "VNPAY") return "VNPay";
    return code || "Không xác định";
  };

  // Tạo nội dung hiển thị thông minh hơn
  const displayContent = () => {
    const baseContent = decodeURIComponent(orderInfo || "Thanh toán khóa học");
    if (course?.courseName && !baseContent.includes(course.courseName)) {
      return `${baseContent} "${course.courseName}"`;
    }
    return baseContent;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconSuccess}>
          <CheckCircleOutlined />
        </div>

        <h1 className={styles.title}>Thanh toán thành công!</h1>
        <p className={styles.message}>
          {paymentDetails?.enrollment
            ? "Cảm ơn bạn đã đăng ký. Khóa học đã được kích hoạt và bạn có thể bắt đầu học ngay."
            : loading
              ? "Đang tải thông tin thanh toán..."
              : "Thanh toán đã được xác nhận."}
        </p>

        {loading ? (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <Spin />
          </div>
        ) : (
          <div className={styles.orderInfoContainer}>
            <div className={styles.detailCard}>
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <FileTextOutlined /> Mã đơn hàng:
                </span>
                <span className={styles.value}>
                  {paymentDetails?.transactionId ||
                    orderId ||
                    "Đang cập nhật..."}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <CreditCardOutlined /> Phương thức:
                </span>
                <span className={styles.value}>
                  {getPaymentMethodName(
                    paymentDetails?.paymentMethod || partnerCode,
                  )}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <DollarOutlined /> Số tiền:
                </span>
                <span className={styles.valueHighlight}>
                  {formatCurrency(paymentDetails?.amount || amount)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <InfoCircleOutlined /> Nội dung:
                </span>
                <span className={styles.value}>
                  {paymentDetails?.orderInfo || displayContent()}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <BookOutlined /> Khóa học:
                </span>
                <span className={styles.value}>
                  {course?.courseName || "Đang cập nhật..."}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <UserOutlined /> Người thanh toán:
                </span>
                <span className={styles.value}>
                  {user?.fullName || user?.email || "Khách"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>🕒 Thời gian:</span>
                <span className={styles.value}>
                  {paymentDetails?.paidAt
                    ? new Date(paymentDetails.paidAt).toLocaleString("vi-VN")
                    : formatDate(responseTime)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            className={styles.primaryButton}
            onClick={() => {
              if (course?.courseId) {
                navigate(`/practice/${course.courseId}`);
              } else if (paymentDetails?.course?.courseId) {
                navigate(`/practice/${paymentDetails.course.courseId}`);
              } else {
                navigate("/user/profile");
              }
            }}
            disabled={!paymentDetails?.enrollment || loading}
          >
            <BookOutlined /> Vào học ngay
          </button>

          <button
            className={styles.secondaryButton}
            onClick={() => navigate("/")}
          >
            <HomeOutlined /> Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
