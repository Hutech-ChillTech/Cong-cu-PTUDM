import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message, Spin } from "antd";
import {
  CreditCardOutlined,
  WalletOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import styles from "../../styles/PaymentPage.module.css";

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface Course {
  courseId: string;
  courseName: string;
  coursePrice: number;
  discount?: number;
  avatarURL: string;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"MOMO" | "VNPAY" | null>(
    null,
  );

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        message.error("Không tìm thấy khóa học");
        navigate("/");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // 1. Lấy thông tin khóa học
        const res = await fetch(`${API_URL}/courses/${courseId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error("Không thể tải thông tin khóa học");
        }

        setCourse(data.data);

        // 2. Kiểm tra xem user đã đăng ký khóa học này chưa (backend tự động trả về isEnrolled)
        if (data.data.isEnrolled) {
          message.warning({
            content:
              "Bạn đã đăng ký khóa học này rồi! Đang chuyển đến trang khóa học...",
            duration: 2,
          });
          setTimeout(() => navigate(`/course/${courseId}`), 1000);
          return;
        }
      } catch (error) {
        console.error("Error:", error);
        message.error("Không thể tải thông tin khóa học");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      message.warning("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!courseId) {
      message.error("Không tìm thấy khóa học");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Vui lòng đăng nhập để tiếp tục");
      navigate("/login");
      return;
    }

    setProcessing(true);

    try {
      // Debug: Log tất cả thông tin trước khi gửi
      console.log("=== PAYMENT DEBUG START ===");
      console.log("CourseId:", courseId);
      console.log("Selected Method:", selectedMethod);
      console.log("API URL:", `${API_URL}/payment/create`);
      console.log("Token exists:", !!token);

      // Chuẩn bị payment data - thử format đơn giản nhất
      const paymentData = {
        courseId: courseId,
        paymentMethod: selectedMethod, // "MOMO" hoặc "VNPAY"
      };

      console.log("Payment Data Object:", paymentData);
      console.log("Payment Data JSON:", JSON.stringify(paymentData));
      console.log("=== PAYMENT DEBUG END ===");

      const res = await fetch(`${API_URL}/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      console.log("📡 Response status:", res.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(res.headers.entries()),
      );

      const data = await res.json();
      console.log("📦 Response data (full):", data);
      console.log("📦 Response data (JSON):", JSON.stringify(data, null, 2));

      // Kiểm tra response từ backend
      if (!res.ok) {
        // HTTP error (400, 401, 500, etc.)
        console.error("❌ HTTP Error Details:");
        console.error("  - Status:", res.status);
        console.error("  - Message:", data.message);
        console.error("  - Error:", data.error);
        console.error("  - Data:", data.data);
        console.error("  - Full response:", JSON.stringify(data, null, 2));

        const errorMsg =
          data.message || data.error || `HTTP Error ${res.status}`;
        throw new Error(errorMsg);
      }

      if (data.success && data.data?.paymentUrl) {
        // Thành công, có payment URL
        console.log("✅ Payment URL:", data.data.paymentUrl);
        console.log("💰 Amount:", data.data.amount);
        console.log("🆔 Payment ID:", data.data.paymentId);

        // ⭐ LƯU PAYMENT ID VÀO LOCALSTORAGE để verify sau khi callback
        if (data.data.paymentId) {
          localStorage.setItem("pendingPaymentId", data.data.paymentId);
          console.log(
            "💾 Saved pendingPaymentId to localStorage:",
            data.data.paymentId,
          );
        }

        message.success("Đang chuyển đến cổng thanh toán...");

        // Redirect sau 500ms để user thấy message
        setTimeout(() => {
          window.location.href = data.data.paymentUrl;
        }, 500);
      } else {
        // Response OK nhưng không có paymentUrl
        const errorMsg = data.message || "Không nhận được URL thanh toán";
        console.error("❌ Invalid response:", errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: unknown) {
      const err = error as Error & { message?: string };
      console.error("❌ Payment error:", err);

      // Hiển thị error message chi tiết hơn
      let errorMessage = "Có lỗi xảy ra khi tạo thanh toán";

      if (err.message) {
        errorMessage = err.message;
      }

      // Xử lý một số lỗi phổ biến
      if (err.message?.includes("Unauthorized")) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại";
        message.error(errorMessage);
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.message?.includes("đã đăng ký")) {
        message.warning({
          content:
            "Bạn đã đăng ký khóa học này rồi. Chuyển đến trang khóa học của bạn...",
          duration: 3,
        });
        setTimeout(() => {
          navigate("/my-courses");
        }, 1500);
      } else {
        message.error(errorMessage);
      }

      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy khóa học</h2>
        <button onClick={() => navigate("/")}>Quay về trang chủ</button>
      </div>
    );
  }

  const finalPrice = course.discount
    ? course.coursePrice * (1 - course.discount / 100)
    : course.coursePrice;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.paymentContainer}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Quay lại
        </button>

        <div className={styles.courseSection}>
          <h2 className={styles.sectionTitle}>Thông tin khóa học</h2>
          <div className={styles.courseCard}>
            <img
              src={course.avatarURL || "/images/default-course.jpg"}
              alt={course.courseName}
              className={styles.courseImage}
            />
            <div className={styles.courseInfo}>
              <h3>{course.courseName}</h3>
              <div className={styles.priceInfo}>
                {course.discount ? (
                  <>
                    <span className={styles.originalPrice}>
                      {course.coursePrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className={styles.discountBadge}>
                      -{course.discount}%
                    </span>
                  </>
                ) : null}
                <span className={styles.finalPrice}>
                  {finalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.paymentSection}>
          <h2 className={styles.sectionTitle}>Chọn phương thức thanh toán</h2>

          <div className={styles.paymentMethods}>
            <div
              className={`${styles.paymentMethod} ${
                selectedMethod === "MOMO" ? styles.selected : ""
              }`}
              onClick={() => setSelectedMethod("MOMO")}
            >
              <div className={styles.methodIcon}>
                <WalletOutlined />
              </div>
              <div className={styles.methodInfo}>
                <h4>Ví MoMo</h4>
                <p>Thanh toán qua ví điện tử MoMo</p>
              </div>
              <div className={styles.methodCheck}>
                {selectedMethod === "MOMO" && <span>✓</span>}
              </div>
            </div>

            <div
              className={`${styles.paymentMethod} ${
                selectedMethod === "VNPAY" ? styles.selected : ""
              }`}
              onClick={() => setSelectedMethod("VNPAY")}
            >
              <div className={styles.methodIcon}>
                <CreditCardOutlined />
              </div>
              <div className={styles.methodInfo}>
                <h4>VNPay</h4>
                <p>Thanh toán qua cổng VNPay (ATM/Visa/MasterCard)</p>
              </div>
              <div className={styles.methodCheck}>
                {selectedMethod === "VNPAY" && <span>✓</span>}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>Tổng thanh toán</h2>
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>Giá khóa học:</span>
              <span>{course.coursePrice.toLocaleString("vi-VN")}đ</span>
            </div>
            {course.discount ? (
              <div className={styles.summaryRow}>
                <span>Giảm giá ({course.discount}%):</span>
                <span className={styles.discount}>
                  -{(course.coursePrice - finalPrice).toLocaleString("vi-VN")}đ
                </span>
              </div>
            ) : null}
            <div className={styles.summaryDivider}></div>
            <div className={styles.summaryTotal}>
              <span>Tổng cộng:</span>
              <span className={styles.totalAmount}>
                {finalPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>

        <button
          className={styles.payButton}
          onClick={handlePayment}
          disabled={!selectedMethod || processing}
        >
          {processing ? (
            <>
              <Spin size="small" /> Đang xử lý...
            </>
          ) : (
            `Thanh toán ${finalPrice.toLocaleString("vi-VN")}đ`
          )}
        </button>

        <div className={styles.securityNote}>
          <p>🔒 Giao dịch được bảo mật và mã hóa</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
