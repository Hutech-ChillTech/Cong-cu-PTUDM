import { Router } from "express";
import Prisma from "../configs/prismaClient";
import UserRepository from "../repositories/user.repository";
import UserService from "../services/user.service";
import UserController from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import {
  authLimiter,
  readLimiter,
  createLimiter,
} from "../middlewares/rateLimiter.middleware";
import {
  requireRole,
  requireOwnerOrAdmin,
} from "../middlewares/role.middleware";
import { UserRoles } from "../constants/roles";
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  searchUserSchema,
  getUserByNameSchema,
  getUserByEmailSchema,
  paginationSchema,
} from "../validators/user.validate";

const userRepository = new UserRepository(Prisma, "userId");
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

// ============================================
// AUTHENTICATION ROUTES (JWT - Traditional)
// ============================================
router.post("/login", authLimiter, validate(loginSchema), (req, res, next) =>
  userController.login(req, res, next)
);

router.post(
  "/register",
  authLimiter,
  validate(createUserSchema),
  (req, res, next) => userController.createUser(req, res, next)
);

// ============================================
// FIREBASE AUTHENTICATION ROUTES
// ============================================
router.post(
  "/firebase/login",
  authLimiter,
  validate(loginSchema),
  (req, res, next) => userController.loginWithFirebase(req, res, next)
);

router.post(
  "/firebase/register",
  authLimiter,
  validate(createUserSchema),
  (req, res, next) => userController.registerWithFirebase(req, res, next)
);

router.post("/firebase/verify", authLimiter, (req, res, next) =>
  userController.verifyFirebaseTokenController(req, res, next)
);

// ============================================
// GOOGLE AUTHENTICATION (OAuth 2.0)
// ============================================
router.post("/google-login", authLimiter, (req, res, next) =>
  userController.googleLogin(req, res, next)
);

router.get(
  "/search",
  readLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  validate(searchUserSchema, "query"),
  (req, res, next) => userController.searchUserByName(req, res, next)
);

router.get(
  "/search/name",
  readLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  validate(getUserByNameSchema, "query"),
  (req, res, next) => userController.getUserByName(req, res, next)
);

router.get(
  "/search/email",
  readLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  validate(getUserByEmailSchema, "query"),
  (req, res, next) => userController.getUserByEmail(req, res, next)
);

router.get(
  "/",
  readLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  validate(paginationSchema, "query"),
  (req, res, next) => userController.getAllUser(req, res, next)
);

router.get("/:userId", readLimiter, authenticate, (req, res, next) =>
  userController.getUserById(req, res, next)
);

router.get(
  "/:userId/details",
  readLimiter,
  authenticate,
  requireOwnerOrAdmin((req) => req.params.userId),
  (req, res, next) => userController.getUserWithRelations(req, res, next)
);

router.get(
  "/:userId/courses",
  readLimiter,
  authenticate,
  requireOwnerOrAdmin((req) => req.params.userId),
  (req, res, next) => userController.getUserEnrolledCourses(req, res, next)
);

router.get(
  "/:userId/enrollment/:courseId",
  readLimiter,
  authenticate,
  requireOwnerOrAdmin((req) => req.params.userId),
  (req, res, next) => userController.checkEnrollment(req, res, next)
);

router.put(
  "/:userId",
  createLimiter,
  authenticate,
  requireOwnerOrAdmin((req) => req.params.userId),
  validate(updateUserSchema),
  (req, res, next) => userController.updateUser(req, res, next)
);

router.delete(
  "/:userId",
  createLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  (req, res, next) => userController.deleteUser(req, res, next)
);

router.patch(
  "/:userId/change-password",
  authLimiter,
  authenticate,
  requireOwnerOrAdmin((req) => req.params.userId),
  validate(changePasswordSchema),
  (req, res, next) => userController.changePasswordUser(req, res, next)
);

export default router;
