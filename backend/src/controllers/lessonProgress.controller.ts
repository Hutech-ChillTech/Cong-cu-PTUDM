import { Request, Response, NextFunction } from "express";
import LessonProgressService from "../services/lessonProgress.service";
import LessonProgressRepository from "../repositories/lessonProgress.repository";
import XPService from "../services/xp.service";
import XPRepository from "../repositories/xp.repository";
import AchievementRepository from "../repositories/achievement.repository";
import LevelRequirementRepository from "../repositories/levelRequirement.repository";
import UserRepository from "../repositories/user.repository";
import prisma from "../configs/prismaClient";
import { sendSuccess, sendNotFound } from "../utils/responseHelper";
import { AuthRequest } from "../types/customRequest";

class LessonProgressController {
  private progressService: LessonProgressService;

  constructor() {
    const progressRepository = new LessonProgressRepository(prisma, "id");

    // Initialize XPService with its dependencies
    const xpRepository = new XPRepository(prisma, "transactionId");
    const achievementRepository = new AchievementRepository(
      prisma,
      "achievementId"
    );
    const levelRequirementRepository = new LevelRequirementRepository(
      prisma,
      "id"
    );
    const userRepository = new UserRepository(prisma, "userId");
    const xpService = new XPService(
      xpRepository,
      achievementRepository,
      levelRequirementRepository,
      userRepository
    );

    this.progressService = new LessonProgressService(
      progressRepository,
      xpService
    );
  }

  /**
   * Đánh dấu lesson hoàn thành
   * POST /api/lessons/:lessonId/complete
   */
  completeLesson = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await this.progressService.completeLesson(
        userId,
        lessonId
      );

      return sendSuccess(res, result, "Đã đánh dấu hoàn thành bài học", 201);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Cập nhật lastAccessAt khi xem lesson
   * POST /api/lessons/:lessonId/access
   */
  accessLesson = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await this.progressService.accessLesson(userId, lessonId);

      return sendSuccess(res, result, "Đã cập nhật lịch sử truy cập");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy progress của user trong 1 khóa học
   * GET /api/courses/:courseId/progress
   */
  getCourseProgress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const progress = await this.progressService.getCourseProgress(
        userId,
        courseId
      );

      return sendSuccess(res, progress, "Lấy tiến độ học thành công");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy tất cả progress của user
   * GET /api/progress/my-progress
   */
  getAllMyProgress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const progressList = await this.progressService.getAllUserProgress(
        userId
      );

      return sendSuccess(
        res,
        progressList,
        "Lấy danh sách tiến độ học thành công"
      );
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy progress của 1 lesson cụ thể
   * GET /api/lessons/:lessonId/progress
   */
  getLessonProgress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const progress = await this.progressService.getLessonProgress(
        userId,
        lessonId
      );

      return sendSuccess(res, progress, "Lấy thông tin progress thành công");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy danh sách lessons chưa hoàn thành
   * GET /api/courses/:courseId/incomplete-lessons
   */
  getIncompleteLessons = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const lessons = await this.progressService.getIncompleteLessons(
        userId,
        courseId
      );

      return sendSuccess(res, lessons, "Lấy danh sách bài học chưa hoàn thành");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Reset progress của 1 lesson (Admin/Owner)
   * DELETE /api/lessons/:lessonId/progress
   */
  resetLessonProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { lessonId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId là bắt buộc",
        });
      }

      const result = await this.progressService.resetLessonProgress(
        userId,
        lessonId
      );

      return sendSuccess(res, result, "Đã reset progress thành công");
    } catch (error) {
      return next(error);
    }
  };
}

export default LessonProgressController;
