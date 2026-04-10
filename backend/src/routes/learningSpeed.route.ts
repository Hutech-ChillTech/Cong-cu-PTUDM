import { Router } from "express";
import LearningSpeedController from "../controllers/learningSpeed.controller";
import {
  learningSpeedLimiter,
  readLimiter,
} from "../middlewares/rateLimiter.middleware";

const router = Router();

/**
 * POST /api/learning-speed/calculate
 * Tính toán learning speed sau khi hoàn thành khóa học
 * Body: { userId, courseId }
 */
router.post(
  "/calculate",
  learningSpeedLimiter,
  LearningSpeedController.calculateSpeed
);

/**
 * GET /api/learning-speed/recommendations/:userId/:courseId
 * Lấy gợi ý khóa học dựa trên learning speed
 */
router.get(
  "/recommendations/:userId/:courseId",
  readLimiter,
  LearningSpeedController.getRecommendations
);

/**
 * GET /api/learning-speed/history/:userId
 * Lấy lịch sử learning speed của user
 */
router.get("/history/:userId", readLimiter, LearningSpeedController.getHistory);

/**
 * POST /api/learning-speed/on-course-completed
 * Tự động tính learning speed và gợi ý khóa học khi hoàn thành
 * Body: { userId, courseId }
 */
router.post(
  "/on-course-completed",
  learningSpeedLimiter,
  LearningSpeedController.onCourseCompleted
);

/**
 * POST /api/learning-speed/manual
 * Tính toán learning speed thủ công (để test)
 * Body: { userId, courseId, totalScore, estimatedDuration, totalLearningTime }
 */
router.post(
  "/manual",
  learningSpeedLimiter,
  LearningSpeedController.calculateManual
);

export default router;
