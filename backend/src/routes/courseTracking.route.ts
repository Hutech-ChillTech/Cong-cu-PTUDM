import { Router } from "express";
import CourseTrackingController from "../controllers/courseTracking.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const courseTrackingController = new CourseTrackingController();

/**
 * @route   POST /api/courses/:courseId/start-tracking
 * @desc    Bắt đầu tracking khóa học
 * @access  Private (requires authentication)
 */
router.post(
  "/:courseId/start-tracking",
  authenticate,
  courseTrackingController.startTracking
);

/**
 * @route   POST /api/courses/:courseId/heartbeat
 * @desc    Heartbeat - Gửi mỗi 60 giây
 * @access  Private (requires authentication)
 */
router.post(
  "/:courseId/heartbeat",
  authenticate,
  courseTrackingController.updateHeartbeat
);

/**
 * @route   POST /api/courses/:courseId/pause-tracking
 * @desc    Tạm dừng tracking
 * @access  Private (requires authentication)
 */
router.post(
  "/:courseId/pause-tracking",
  authenticate,
  courseTrackingController.pauseTracking
);

/**
 * @route   GET /api/courses/:courseId/completion-time
 * @desc    Lấy thời gian hoàn thành khóa học
 * @access  Private (requires authentication)
 */
router.get(
  "/:courseId/completion-time",
  authenticate,
  courseTrackingController.getCompletionTime
);

/**
 * @route   GET /api/courses/completion-times
 * @desc    Lấy tất cả thời gian hoàn thành của user
 * @access  Private (requires authentication)
 * @note    Đặt route này trước /:courseId để tránh conflict
 */
router.get(
  "/completion-times",
  authenticate,
  courseTrackingController.getAllCompletionTimes
);

export default router;
