import { Router } from "express";
import Prisma from "../configs/prismaClient";
import ChapterRepository from "../repositories/chapter.repository";
import ChapterService from "../services/chapter.service";
import ChapterController from "../controllers/chapter.controller";
import { validate } from "../middlewares/validate";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";
import { requireRole, requirePermission } from "../middlewares/role.middleware";
import { UserRoles, Permissions } from "../constants/roles";
import {
  readLimiter,
  createLimiter,
} from "../middlewares/rateLimiter.middleware";
import {
  createChapterSchema,
  updateChapterSchema,
} from "../validators/chapter.validate";

const chapterRepository = new ChapterRepository(Prisma, "chapterId");
const chapterService = new ChapterService(chapterRepository);
const chapterController = new ChapterController(chapterService);

const router = Router();

router.get("/", readLimiter, optionalAuth, (req, res, next) =>
  chapterController.getAllChapter(req, res, next)
);

router.get("/:chapterId", readLimiter, optionalAuth, (req, res, next) =>
  chapterController.getChapterById(req, res, next)
);

router.post(
  "/",
  createLimiter,
  authenticate,
  requirePermission([Permissions.CHAPTER_CREATE]),
  validate(createChapterSchema),
  (req, res, next) => chapterController.createChapter(req, res, next)
);

router.put(
  "/:chapterId",
  createLimiter,
  authenticate,
  requirePermission([Permissions.CHAPTER_UPDATE]),
  validate(updateChapterSchema),
  (req, res, next) => chapterController.updateChapter(req, res, next)
);

router.delete(
  "/:chapterId",
  createLimiter,
  authenticate,
  requireRole([UserRoles.ADMIN]),
  requirePermission([Permissions.CHAPTER_DELETE]),
  (req, res, next) => chapterController.deleteChapter(req, res, next)
);

export default router;
