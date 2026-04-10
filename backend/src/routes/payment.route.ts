import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { UserRoles } from "../constants/roles";
import { validate } from "../middlewares/validate";
import { createPaymentSchema } from "../validators/payment.validate";
import {
  readLimiter,
  createLimiter,
  statisticsLimiter,
} from "../middlewares/rateLimiter.middleware";

const router = Router();
const paymentController = new PaymentController();

// Tạo thanh toán mới
router.post(
  "/create",
  createLimiter,
  authenticate,
  validate(createPaymentSchema),
  paymentController.createPayment
);

// Callback từ MoMo
router.get("/momo/callback", paymentController.momoCallback);
router.post("/momo/callback", paymentController.momoCallback);

// IPN từ MoMo
router.post("/momo/ipn", paymentController.momoIPN);

// Callback từ VNPay
router.get("/vnpay/callback", paymentController.vnpayCallback);

// ==================== STATISTICS ROUTES (ADMIN ONLY) ====================

// Thống kê tổng quan (Dashboard)
router.get(
  "/statistics/overview",
  statisticsLimiter, // Sử dụng limiter cao hơn cho dashboard
  authenticate,
  requireRole([UserRoles.ADMIN]),
  paymentController.getStatisticsOverview
);

// Thống kê doanh thu theo thời gian
router.get(
  "/statistics/revenue",
  statisticsLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  paymentController.getRevenueByPeriod
);

// Top khóa học bán chạy
router.get(
  "/statistics/top-courses",
  statisticsLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  paymentController.getTopSellingCourses
);

// Top học viên chi tiêu nhiều nhất
router.get(
  "/statistics/top-spenders",
  statisticsLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  paymentController.getTopSpendingStudents
);

// Thống kê doanh thu theo khóa học (Admin or course owner)
router.get(
  "/statistics/course/:courseId",
  statisticsLimiter,
  authenticate,
  paymentController.getRevenueByCourse
);

// Thống kê doanh thu theo instructor (Admin or instructor owner)
router.get(
  "/statistics/instructor/:userId",
  statisticsLimiter,
  authenticate,
  paymentController.getRevenueByInstructor
);

// Danh sách tất cả giao dịch (Admin)
router.get(
  "/admin/all",
  statisticsLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  paymentController.getAllPayments
);

// Admin manually confirm payment
router.post(
  "/admin/confirm/:paymentId",
  createLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  paymentController.confirmPayment
);

// Admin manually reject payment
router.post(
  "/admin/reject/:paymentId",
  createLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  paymentController.rejectPayment
);

// ==================== USER ROUTES ====================

// User verify payment status
router.get(
  "/verify/:paymentId",
  readLimiter,
  authenticate,
  paymentController.verifyPaymentStatus
);

// Lấy lịch sử thanh toán
router.get(
  "/history",
  readLimiter,
  authenticate,
  paymentController.getPaymentHistory
);

// Lấy chi tiết thanh toán
router.get(
  "/:paymentId",
  readLimiter,
  authenticate,
  paymentController.getPaymentDetail
);

export default router;
