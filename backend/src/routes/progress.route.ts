import { Router } from "express";
import LessonProgressController from "../controllers/lessonProgress.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { readLimiter } from "../middlewares/rateLimiter.middleware";

const progressController = new LessonProgressController();
const router = Router();

/**
 * @route   GET /api/progress/my-progress
 * @desc    Lấy tất cả tiến độ học của user
 * @access  Private (Student)
 */
router.get("/my-progress", readLimiter, authenticate, (req, res, next) =>
  progressController.getAllMyProgress(req, res, next)
);

export default router;
