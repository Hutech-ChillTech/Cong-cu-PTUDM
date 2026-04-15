import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import {
  paymentService,
  type PaymentVerification as PaymentVerificationType,
} from "../../service/payment.service";
import styles from "../../styles/PaymentVerification.module.css";

interface PaymentVerificationProps {
  paymentId: string;
  onStatusChange?: (status: string) => void;
}

const PaymentVerification: React.FC<PaymentVerificationProps> = ({
  paymentId,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentVerificationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!paymentId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await paymentService.verifyPaymentStatus(paymentId);
      setStatus(data);

      if (onStatusChange) {
        onStatusChange(data.paymentStatus);
      }

      // Nếu thanh toán thành công và có enrollment, chuyển đến khóa học
      if (data.paymentStatus === "COMPLETED" && data.enrollment) {
        setTimeout(() => {
          navigate(`/course/${data.course.courseId}`);
        }, 3000);
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể kiểm tra trạng thái thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Polling every 5 seconds if status is PENDING
    const interval = setInterval(() => {
      if (status?.paymentStatus === "PENDING") {
        checkStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId, status?.paymentStatus]);

  if (loading && !status) {
    return (
      <div className={styles.verificationContainer}>
        <Spin size="large" />
        <p className={styles.loadingText}>
          Đang kiểm tra trạng thái thanh toán...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.verificationContainer}>
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>⚠️</span>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={checkStatus}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.statusCard}>
        {/* Header with status icon */}
        <div className={styles.statusHeader}>
          {status.paymentStatus === "COMPLETED" && (
            <>
              <span className={styles.successIcon}>✓</span>
              <h2 className={styles.successTitle}>Thanh toán thành công!</h2>
            </>
          )}
          {status.paymentStatus === "PENDING" && (
            <>
              <Spin size="large" />
              <h2 className={styles.pendingTitle}>Đang xử lý thanh toán...</h2>
            </>
          )}
          {status.paymentStatus === "FAILED" && (
            <>
              <span className={styles.failedIcon}>✗</span>
              <h2 className={styles.failedTitle}>Thanh toán thất bại</h2>
            </>
          )}
        </div>

        {/* Payment details */}
        <div className={styles.paymentDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Mã giao dịch:</span>
            <span className={styles.detailValue}>{status.transactionId}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Khóa học:</span>
            <span className={styles.detailValue}>
              {status.course.courseName}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Số tiền:</span>
            <span className={styles.detailValue}>
              {status.amount.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Phương thức:</span>
            <span className={styles.detailValue}>{status.paymentMethod}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Trạng thái:</span>
            <span
              className={`${styles.detailValue} ${
                styles[`status${status.paymentStatus}`]
              }`}
            >
              {status.paymentStatus === "COMPLETED" && "Đã thanh toán"}
              {status.paymentStatus === "PENDING" && "Đang chờ xử lý"}
              {status.paymentStatus === "FAILED" && "Thất bại"}
            </span>
          </div>
          {status.paidAt && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Thời gian:</span>
              <span className={styles.detailValue}>
                {new Date(status.paidAt).toLocaleString("vi-VN")}
              </span>
            </div>
          )}
        </div>

        {/* Action messages */}
        <div className={styles.actionSection}>
          {status.paymentStatus === "COMPLETED" && status.enrollment && (
            <div className={styles.successMessage}>
              <p>✅ Bạn đã đăng ký khóa học thành công!</p>
              <p className={styles.redirectMessage}>
                Đang chuyển đến khóa học trong 3 giây...
              </p>
              <button
                className={styles.primaryButton}
                onClick={() => navigate(`/course/${status.course.courseId}`)}
              >
                Bắt đầu học ngay
              </button>
            </div>
          )}

          {status.paymentStatus === "PENDING" && (
            <div className={styles.pendingMessage}>
              <p>⏳ Đang xử lý thanh toán của bạn...</p>
              <p className={styles.subMessage}>
                Vui lòng đợi trong giây lát. Hệ thống sẽ tự động cập nhật trạng
                thái.
              </p>
              <button className={styles.secondaryButton} onClick={checkStatus}>
                Kiểm tra lại
              </button>
            </div>
          )}

          {status.paymentStatus === "FAILED" && (
            <div className={styles.failedMessage}>
              <p>❌ Thanh toán không thành công</p>
              <p className={styles.subMessage}>
                Vui lòng thử lại hoặc liên hệ hỗ trợ nếu bạn đã thanh toán.
              </p>
              <button
                className={styles.primaryButton}
                onClick={() =>
                  navigate(`/payment?courseId=${status.course.courseId}`)
                }
              >
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* Back button */}
        <button className={styles.backButton} onClick={() => navigate("/")}>
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

export default PaymentVerification;
