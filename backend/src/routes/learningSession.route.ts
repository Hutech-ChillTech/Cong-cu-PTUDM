import { Router } from "express";
import {
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  recordActivity,
  getActiveSession,
  getHistory,
  getStats,
  getCourseSessions,
} from "../controllers/learningSession.controller";
import { authenticate } from "../middlewares/auth.middleware";
import {
  readLimiter,
  createLimiter,
} from "../middlewares/rateLimiter.middleware";

const router = Router();

// Authentication required
router.use(authenticate);

/**
 * @route POST /api/learning-sessions/start
 * @desc Bắt đầu session học
 */
router.post("/start", createLimiter, startSession);

/**
 * @route POST /api/learning-sessions/:sessionId/pause
 * @desc Tạm dừng session
 */
router.post("/:sessionId/pause", createLimiter, pauseSession);

/**
 * @route POST /api/learning-sessions/:sessionId/resume
 * @desc Resume session
 */
router.post("/:sessionId/resume", createLimiter, resumeSession);

/**
 * @route POST /api/learning-sessions/:sessionId/end
 * @desc Kết thúc session
 */
router.post("/:sessionId/end", createLimiter, endSession);

/**
 * @route POST /api/learning-sessions/:sessionId/activity
 * @desc Ghi nhận hoạt động
 */
router.post("/:sessionId/activity", createLimiter, recordActivity);

/**
 * @route GET /api/learning-sessions/active
 * @desc Lấy session đang active
 */
router.get("/active", readLimiter, getActiveSession);

/**
 * @route GET /api/learning-sessions/history
 * @desc Lấy lịch sử session
 */
router.get("/history", readLimiter, getHistory);

/**
 * @route GET /api/learning-sessions/stats/:courseId
 * @desc Lấy thống kê thời gian học
 */
router.get("/stats/:courseId", readLimiter, getStats);

/**
 * @route GET /api/learning-sessions/course/:courseId
 * @desc Lấy session của một khóa học
 */
router.get("/course/:courseId", readLimiter, getCourseSessions);

export default router;
