import { Router } from "express";
import Prisma from "../configs/prismaClient";
import XPRepository from "../repositories/xp.repository";
import AchievementRepository from "../repositories/achievement.repository";
import LevelRequirementRepository from "../repositories/levelRequirement.repository";
import UserRepository from "../repositories/user.repository";
import XPService from "../services/xp.service";
import XPController from "../controllers/xp.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { readLimiter } from "../middlewares/rateLimiter.middleware";

const xpRepository = new XPRepository(Prisma, "transactionId");
const achievementRepository = new AchievementRepository(
  Prisma,
  "achievementId"
);
const levelRequirementRepository = new LevelRequirementRepository(Prisma, "id");
const userRepository = new UserRepository(Prisma, "userId");

const xpService = new XPService(
  xpRepository,
  achievementRepository,
  levelRequirementRepository,
  userRepository
);
const xpController = new XPController(xpService);

const router = Router();

// ============================================
// XP & GAMIFICATION ROUTES
// ============================================

/**
 * @route   GET /api/xp/stats
 * @desc    Lấy stats của user hiện tại (XP, level, achievements)
 * @access  Private
 */
router.get(
  "/stats",
  readLimiter,
  authenticate,
  xpController.getUserStats.bind(xpController)
);

/**
 * @route   GET /api/xp/history
 * @desc    Lấy lịch sử XP
 * @access  Private
 */
router.get(
  "/history",
  readLimiter,
  authenticate,
  xpController.getXPHistory.bind(xpController)
);

/**
 * @route   GET /api/xp/leaderboard
 * @desc    Lấy bảng xếp hạng
 * @access  Public
 */
router.get(
  "/leaderboard",
  readLimiter,
  xpController.getLeaderboard.bind(xpController)
);

/**
 * @route   GET /api/xp/achievements
 * @desc    Lấy tất cả achievements
 * @access  Public
 */
router.get(
  "/achievements",
  readLimiter,
  xpController.getAllAchievements.bind(xpController)
);

/**
 * @route   GET /api/xp/my-achievements
 * @desc    Lấy achievements của user hiện tại
 * @access  Private
 */
router.get(
  "/my-achievements",
  readLimiter,
  authenticate,
  xpController.getUserAchievements.bind(xpController)
);

/**
 * @route   GET /api/xp/users/:userId/stats
 * @desc    Lấy stats public của user khác
 * @access  Public
 */
router.get(
  "/users/:userId/stats",
  readLimiter,
  xpController.getPublicUserStats.bind(xpController)
);

export default router;
