import { Router } from "express";
import LearningPathController from "../controllers/learningPath.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole, requirePermission } from "../middlewares/role.middleware";
import { UserRoles, Permissions } from "../constants/roles";
import {
  readLimiter,
  createLimiter,
} from "../middlewares/rateLimiter.middleware";
import {
  createLearningPathSchema,
  updateLearningPathSchema,
  addCourseToPathSchema,
  reorderCoursesSchema,
  updateProgressSchema,
} from "../validators/learningPath.validate";

const router = Router();

// ========================================
// PUBLIC ROUTES (Không cần auth)
// ========================================

/**
 * GET /api/learning-paths/popular
 * Lấy các Learning Paths phổ biến
 */
router.get(
  "/popular",
  readLimiter,
  LearningPathController.getPopularLearningPaths
);

/**
 * GET /api/learning-paths/suggest
 * Gợi ý Learning Paths dựa trên level
 */
router.get(
  "/suggest",
  readLimiter,
  LearningPathController.suggestLearningPaths
);

/**
 * GET /api/learning-paths
 * Lấy tất cả Learning Paths (có filter, pagination)
 * Query: ?level=Basic&isPublished=true&search=backend&page=1&limit=10
 */
router.get("/", readLimiter, LearningPathController.getAllLearningPaths);

/**
 * GET /api/learning-paths/:id
 * Lấy chi tiết Learning Path theo ID
 */
router.get("/:id", readLimiter, LearningPathController.getLearningPathById);

/**
 * GET /api/learning-paths/:id/courses
 * Lấy danh sách khóa học trong Learning Path
 */
router.get(
  "/:id/courses",
  readLimiter,
  LearningPathController.getCoursesInPath
);

/**
 * GET /api/learning-paths/:id/stats
 * Lấy thống kê Learning Path (followers, completion rate)
 */
router.get(
  "/:id/stats",
  readLimiter,
  LearningPathController.getLearningPathStats
);

// ========================================
// USER ROUTES (Cần đăng nhập)
// ========================================

/**
 * POST /api/learning-paths/:id/follow
 * User follow Learning Path
 */
router.post(
  "/:id/follow",
  createLimiter,
  authenticate,
  LearningPathController.followLearningPath
);

/**
 * DELETE /api/learning-paths/:id/follow
 * User unfollow Learning Path
 */
router.delete(
  "/:id/follow",
  authenticate,
  LearningPathController.unfollowLearningPath
);

/**
 * GET /api/learning-paths/my/paths
 * Lấy các Learning Paths mà user đang follow
 */
router.get(
  "/my/paths",
  authenticate,
  LearningPathController.getMyLearningPaths
);

/**
 * PUT /api/learning-paths/:id/progress
 * Cập nhật progress của user trong Learning Path
 * Body: { completedCourseIds: ["courseId1", "courseId2"] }
 */
router.put(
  "/:id/progress",
  authenticate,
  validate(updateProgressSchema),
  LearningPathController.updateProgress
);

// ========================================
// ADMIN/CREATOR ROUTES (Cần quyền)
// ========================================

/**
 * POST /api/learning-paths
 * Tạo Learning Path mới (Admin hoặc Creator)
 */
router.post(
  "/",
  createLimiter,
  authenticate,
  requirePermission([Permissions.COURSE_CREATE]), // Creator có thể tạo
  validate(createLearningPathSchema),
  LearningPathController.createLearningPath
);

/**
 * PUT /api/learning-paths/:id
 * Cập nhật Learning Path (Admin hoặc Creator)
 */
router.put(
  "/:id",
  authenticate,
  requirePermission([Permissions.COURSE_UPDATE]),
  validate(updateLearningPathSchema),
  LearningPathController.updateLearningPath
);

/**
 * DELETE /api/learning-paths/:id
 * Xóa Learning Path (Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  requireRole([UserRoles.ADMIN]),
  LearningPathController.deleteLearningPath
);

/**
 * POST /api/learning-paths/:id/courses
 * Thêm khóa học vào Learning Path
 * Body: { courseId: "uuid", orderIndex: 1, isRequired: true }
 */
router.post(
  "/:id/courses",
  createLimiter,
  authenticate,
  requirePermission([Permissions.COURSE_UPDATE]),
  validate(addCourseToPathSchema),
  LearningPathController.addCourseToPath
);

/**
 * DELETE /api/learning-paths/:id/courses/:courseId
 * Xóa khóa học khỏi Learning Path
 */
router.delete(
  "/:id/courses/:courseId",
  authenticate,
  requirePermission([Permissions.COURSE_DELETE]),
  LearningPathController.removeCourseFromPath
);

/**
 * PUT /api/learning-paths/:id/courses/reorder
 * Sắp xếp lại thứ tự khóa học
 * Body: { courseOrders: [{ courseId: "uuid", orderIndex: 1 }, ...] }
 */
router.put(
  "/:id/courses/reorder",
  authenticate,
  requirePermission([Permissions.COURSE_UPDATE]),
  validate(reorderCoursesSchema),
  LearningPathController.reorderCourses
);

export default router;
