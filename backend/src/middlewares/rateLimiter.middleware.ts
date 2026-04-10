import rateLimit from "express-rate-limit";

/**
 * Rate limiter chung cho toàn bộ API
 * 5000 requests / 15 phút / IP - Tăng cao vì mỗi route đã có limiter riêng
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5000, // Giới hạn 5000 requests (tăng từ 100)
  message: {
    success: false,
    message: "Quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Rate limiter nghiêm ngặt cho authentication endpoints
 * 5 requests / 15 phút / IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 requests
  message: {
    success: false,
    message: "Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Không đếm requests thành công
});

/**
 * Rate limiter cho các thao tác tạo mới (POST)
 * Development: 100 requests / 5 phút / IP
 * Production: 20 requests / 5 phút / IP
 */
export const createLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: process.env.NODE_ENV === "production" ? 20 : 100, // Development: 100, Production: 20
  message: {
    success: false,
    message: "Quá nhiều requests tạo mới, vui lòng thử lại sau 5 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter cho Learning Speed calculations
 * 30 requests / 10 phút / IP
 */
export const learningSpeedLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 30, // Giới hạn 30 requests
  message: {
    success: false,
    message:
      "Quá nhiều requests tính toán learning speed, vui lòng thử lại sau 10 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter lỏng cho các thao tác đọc (GET)
 * 500 requests / 15 phút / IP (tăng cho statistics & admin dashboard)
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 500, // Giới hạn 500 requests (tăng từ 200)
  message: {
    success: false,
    message: "Quá nhiều requests đọc dữ liệu, vui lòng thử lại sau 15 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter riêng cho statistics endpoints (admin dashboard)
 * 1000 requests / 15 phút / IP - cho phép refresh dashboard thường xuyên
 */
export const statisticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Giới hạn 1000 requests
  message: {
    success: false,
    message: "Quá nhiều requests thống kê, vui lòng thử lại sau",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter rất lỏng cho public content (courses, popular pages)
 * 2000 requests / 15 phút / IP - cho phép user browse thoải mái
 */
export const publicContentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 2000, // Giới hạn 2000 requests
  message: {
    success: false,
    message: "Quá nhiều requests, vui lòng thử lại sau",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
