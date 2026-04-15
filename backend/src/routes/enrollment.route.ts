import { Router } from "express";
import Prisma from "../configs/prismaClient";
import EnrollmentRepository from "../repositories/enrollment.repository";
import EnrollmentService from "../services/enrollment.service";
import EnrollmentController from "../controllers/enrollment.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole, requirePermission } from "../middlewares/role.middleware";
import { UserRoles, Permissions } from "../constants/roles";
import {
  readLimiter,
  createLimiter,
} from "../middlewares/rateLimiter.middleware";
import {
  createEnrollmentSchema,
  enrollMyCourseSchema,
} from "../validators/enrollment.validate";

const enrollmentRepository = new EnrollmentRepository(Prisma, "enrollmentId");
const enrollmentService = new EnrollmentService(enrollmentRepository);
const enrollmentController = new EnrollmentController(enrollmentService);

const router = Router();

router.get(
  "/",
  readLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  (req, res, next) => enrollmentController.getAllEnrollments(req, res, next)
);

router.get("/my-enrollments", readLimiter, authenticate, (req, res, next) =>
  enrollmentController.getMyEnrollments(req, res, next)
);

router.get("/my-stats", readLimiter, authenticate, (req, res, next) =>
  enrollmentController.getMyStats(req, res, next)
);

router.post(
  "/enroll",
  createLimiter,
  authenticate,
  requirePermission([Permissions.ENROLLMENT_CREATE]),
  validate(enrollMyCourseSchema),
  (req, res, next) => enrollmentController.enrollMyCourse(req, res, next)
);

router.get("/check/:courseId", readLimiter, authenticate, (req, res, next) =>
  enrollmentController.checkEnrollment(req, res, next)
);

router.get(
  "/user/:userId",
  readLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  (req, res, next) => enrollmentController.getUserEnrollments(req, res, next)
);

router.get(
  "/course/:courseId",
  readLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  (req, res, next) => enrollmentController.getCourseEnrollments(req, res, next)
);

router.get(
  "/course/:courseId/stats",
  readLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  (req, res, next) => enrollmentController.getCourseStats(req, res, next)
);

router.post(
  "/create",
  createLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  requirePermission([Permissions.ENROLLMENT_CREATE]),
  validate(createEnrollmentSchema),
  (req, res, next) => enrollmentController.createEnrollment(req, res, next)
);

router.delete(
  "/delete/:enrollmentId",
  createLimiter,
  authenticate,
  requirePermission([Permissions.ENROLLMENT_DELETE]),
  (req, res, next) => enrollmentController.deleteEnrollment(req, res, next)
);

router.get("/:enrollmentId", readLimiter, authenticate, (req, res, next) =>
  enrollmentController.getEnrollmentById(req, res, next)
);

export default router;
