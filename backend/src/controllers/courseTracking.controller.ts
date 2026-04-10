import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/customRequest";
import CourseTrackingService from "../services/courseTracking.service";
import CourseTrackingRepository from "../repositories/courseTracking.repository";
import PrismaClient from "../configs/prismaClient";
import { sendSuccess } from "../utils/responseHelper";

class CourseTrackingController {
  private trackingService: CourseTrackingService;

  constructor() {
    const trackingRepository = new CourseTrackingRepository();
    this.trackingService = new CourseTrackingService(trackingRepository);
  }

  /**
   * POST /api/courses/:courseId/start-tracking
   * Bắt đầu tracking course
   */
  startTracking = async (
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

      const result = await this.trackingService.startTracking(userId, courseId);

      sendSuccess(res, result, "Đã bắt đầu tracking khóa học");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/courses/:courseId/heartbeat
   * Heartbeat - Gửi mỗi 30 phút
   */
  updateHeartbeat = async (
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

      const result = await this.trackingService.updateHeartbeat(
        userId,
        courseId
      );

      sendSuccess(res, result, "Heartbeat updated");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/courses/:courseId/pause-tracking
   * Pause tracking
   */
  pauseTracking = async (
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

      const result = await this.trackingService.pauseTracking(userId, courseId);

      sendSuccess(res, result, "Đã tạm dừng tracking");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/courses/:courseId/completion-time
   * Lấy thời gian hoàn thành
   */
  getCompletionTime = async (
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

      const result = await this.trackingService.getCompletionTime(
        userId,
        courseId
      );

      sendSuccess(res, result, "Lấy thời gian hoàn thành thành công");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/courses/completion-times
   * Lấy tất cả completion times của user
   */
  getAllCompletionTimes = async (
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

      const result = await this.trackingService.getAllCompletionTimes(userId);

      sendSuccess(res, result, "Lấy danh sách thời gian hoàn thành thành công");
    } catch (error) {
      next(error);
    }
  };
}

export default CourseTrackingController;
