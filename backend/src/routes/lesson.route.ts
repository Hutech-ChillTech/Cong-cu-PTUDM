import { Router } from "express";
import Prisma from "../configs/prismaClient";
import LessonRepository from "../repositories/lesson.repository";
import LessonService from "../services/lesson.service";
import LessonController from "../controllers/lesson.controller";
import LessonProgressController from "../controllers/lessonProgress.controller";
import { validate } from "../middlewares/validate";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";
import { requireRole, requirePermission } from "../middlewares/role.middleware";
import { UserRoles, Permissions } from "../constants/roles";
import {
  readLimiter,
  createLimiter,
} from "../middlewares/rateLimiter.middleware";
import {
  createLessonSchema,
  updateLessonSchema,
} from "../validators/lesson.validate";

const lessonRepository = new LessonRepository(Prisma, "lessonId");
const lessonService = new LessonService(lessonRepository);
const lessonController = new LessonController(lessonService);
const progressController = new LessonProgressController();

const router = Router();

router.get("/", readLimiter, optionalAuth, (req, res, next) =>
  lessonController.getAllLessons(req, res, next)
);

router.get("/:lessonId", readLimiter, optionalAuth, (req, res, next) =>
  lessonController.getLessonById(req, res, next)
);

router.post(
  "/create",
  createLimiter,
  authenticate,
  requirePermission([Permissions.LESSON_CREATE]),
  validate(createLessonSchema),
  (req, res, next) => lessonController.createLesson(req, res, next)
);

router.put(
  "/update/:lessonId",
  createLimiter,
  authenticate,
  requirePermission([Permissions.LESSON_UPDATE]),
  validate(updateLessonSchema),
  (req, res, next) => lessonController.updateLesson(req, res, next)
);

router.delete(
  "/delete/:lessonId",
  createLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  requirePermission([Permissions.LESSON_DELETE]),
  (req, res, next) => lessonController.deleteLesson(req, res, next)
);

// ============================================
// LESSON PROGRESS TRACKING ROUTES
// ============================================

/**
 * @route   POST /api/lessons/:lessonId/complete
 * @desc    Đánh dấu lesson hoàn thành
 * @access  Private (Student)
 */
router.post(
  "/:lessonId/complete",
  createLimiter,
  authenticate,
  (req, res, next) => progressController.completeLesson(req, res, next)
);

/**
 * @route   POST /api/lessons/:lessonId/access
 * @desc    Cập nhật lịch sử truy cập lesson
 * @access  Private (Student)
 */
router.post(
  "/:lessonId/access",
  createLimiter,
  authenticate,
  (req, res, next) => progressController.accessLesson(req, res, next)
);

/**
 * @route   GET /api/lessons/:lessonId/progress
 * @desc    Lấy progress của 1 lesson
 * @access  Private (Student)
 */
router.get("/:lessonId/progress", readLimiter, authenticate, (req, res, next) =>
  progressController.getLessonProgress(req, res, next)
);

/**
 * @route   DELETE /api/lessons/:lessonId/progress
 * @desc    Reset progress của lesson (Admin only)
 * @access  Private (Admin)
 */
router.delete(
  "/:lessonId/progress",
  createLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  (req, res, next) => progressController.resetLessonProgress(req, res, next)
);

export default router;
