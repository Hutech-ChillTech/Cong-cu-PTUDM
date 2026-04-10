import { Router } from "express";
import Prisma from "../configs/prismaClient";
import CourseRepository from "../repositories/course.repository";
import CourseService from "../services/course.service";
import CourseController from "../controllers/course.controller";
import LessonProgressController from "../controllers/lessonProgress.controller";
import { validate } from "../middlewares/validate";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";
import {
  requireRole,
  requirePermission,
  requireCourseOwnerOrAdmin,
} from "../middlewares/role.middleware";
import { UserRoles, Permissions } from "../constants/roles";
import {
  readLimiter,
  createLimiter,
  publicContentLimiter,
} from "../middlewares/rateLimiter.middleware";
import {
  createCourseSchema,
  updateCourseSchema,
  filterCourseSchema,
  searchCourseSchema,
  paginationSchema,
} from "../validators/course.validate";

const courseRepository = new CourseRepository(Prisma, "courseId");
const courseService = new CourseService(courseRepository);
const courseController = new CourseController(courseService);
const progressController = new LessonProgressController();

const router = Router();

// Lấy tất cả khóa học (có phân trang)
router.get(
  "/",
  publicContentLimiter,
  optionalAuth,
  validate(paginationSchema, "query"),
  (req, res, next) => courseController.getAllCourses(req, res, next)
);

// Tìm kiếm khóa học theo tên (contains - không phân biệt hoa thường)
router.get(
  "/search",
  publicContentLimiter,
  optionalAuth,
  validate(searchCourseSchema, "query"),
  (req, res, next) => courseController.searchCourseByName(req, res, next)
);

// Lấy khóa học phổ biến/nổi bật (sắp xếp theo số lượng người đăng ký)
router.get("/popular", publicContentLimiter, optionalAuth, (req, res, next) =>
  courseController.getPopularCourses(req, res, next)
);

// Lấy danh sách khóa học đã mua của user (enrolled courses)
router.get(
  "/enrolled",
  readLimiter,
  authenticate,
  validate(paginationSchema, "query"),
  (req, res, next) => courseController.getEnrolledCourses(req, res, next)
);

// Lọc khóa học theo nhiều tiêu chí (level, price range, searchTerm)
router.get(
  "/filter",
  publicContentLimiter,
  optionalAuth,
  validate(filterCourseSchema, "query"),
  (req, res, next) => courseController.filterCourses(req, res, next)
);

// Đếm số lượng khóa học theo bộ lọc
router.get("/count", publicContentLimiter, optionalAuth, (req, res, next) =>
  courseController.countCourses(req, res, next)
);

// Lấy khóa học theo cấp độ (Basic, Intermediate, Advanced)
router.get(
  "/level/:level",
  publicContentLimiter,
  optionalAuth,
  validate(paginationSchema, "query"),
  (req, res, next) => courseController.getCoursesByLevel(req, res, next)
);

// Lấy thông tin cơ bản của khóa học theo ID
router.get("/:courseId", publicContentLimiter, optionalAuth, (req, res, next) =>
  courseController.getCourseById(req, res, next)
);

// Lấy chi tiết khóa học (kèm creator, chapters, enrollments, comments)
router.get(
  "/:courseId/details",
  publicContentLimiter,
  optionalAuth,
  (req, res, next) => courseController.getCourseWithDetails(req, res, next)
);

// Lấy nội dung khóa học (chapters + lessons của từng chapter)
router.get(
  "/:courseId/content",
  publicContentLimiter,
  optionalAuth,
  (req, res, next) =>
    courseController.getCourseWithChaptersAndLessons(req, res, next)
);

// Lấy thống kê khóa học (enrollments, chapters, comments, certificates)
router.get(
  "/:courseId/stats",
  publicContentLimiter,
  optionalAuth,
  (req, res, next) => courseController.getCourseStats(req, res, next)
);

// Lấy tất cả khóa học của một creator/instructor
router.get(
  "/creator/:userId",
  readLimiter,
  authenticate,
  validate(paginationSchema, "query"),
  (req, res, next) => courseController.getCoursesByCreator(req, res, next)
);

// Tạo khóa học mới (cần quyền COURSE_CREATE)
router.post(
  "/create",
  createLimiter,
  authenticate,
  requirePermission([Permissions.COURSE_CREATE]),
  validate(createCourseSchema),
  (req, res, next) => courseController.createCourse(req, res, next)
);

// Cập nhật khóa học (chỉ creator hoặc admin)
router.put(
  "/update/:courseId",
  createLimiter,
  authenticate,
  requireCourseOwnerOrAdmin(),
  requirePermission([Permissions.COURSE_UPDATE]),
  validate(updateCourseSchema),
  (req, res, next) => courseController.updateCourse(req, res, next)
);

// Xóa khóa học (chỉ admin)
router.delete(
  "/delete/:courseId",
  createLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  requirePermission([Permissions.COURSE_DELETE]),
  (req, res, next) => courseController.deleteCourse(req, res, next)
);

// ============================================
// COURSE PROGRESS TRACKING ROUTES
// ============================================

/**
 * @route   GET /api/courses/:courseId/progress
 * @desc    Lấy tiến độ học của user trong khóa học
 * @access  Private (Student)
 */
router.get("/:courseId/progress", readLimiter, authenticate, (req, res, next) =>
  progressController.getCourseProgress(req, res, next)
);

/**
 * @route   GET /api/courses/:courseId/incomplete-lessons
 * @desc    Lấy danh sách lessons chưa hoàn thành
 * @access  Private (Student)
 */
router.get(
  "/:courseId/incomplete-lessons",
  readLimiter,
  authenticate,
  (req, res, next) => progressController.getIncompleteLessons(req, res, next)
);

export default router;
