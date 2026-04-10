import { Request, Response, NextFunction } from "express";
import XPService from "../services/xp.service";
import { sendSuccess } from "../utils/responseHelper";

class XPController {
  private xpService: XPService;

  constructor(xpService: XPService) {
    this.xpService = xpService;
  }

  /**
   * Lấy stats của user (XP, level, achievements)
   */
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const stats = await this.xpService.getUserStats(userId);
      sendSuccess(res, stats, "Lấy thống kê người dùng thành công");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Lấy XP history
   */
  async getXPHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await this.xpService.getXPHistory(userId, limit);
      sendSuccess(res, history, "Lấy lịch sử XP thành công");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Lấy leaderboard
   */
  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await this.xpService.getLeaderboard(limit);
      sendSuccess(res, leaderboard, "Lấy bảng xếp hạng thành công");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Lấy tất cả achievements
   */
  async getAllAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const achievements = await this.xpService.getAllAchievements();
      sendSuccess(res, achievements, "Lấy danh sách thành tích thành công");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Lấy achievements của user
   */
  async getUserAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const achievements = await this.xpService.getUserAchievements(userId);
      sendSuccess(
        res,
        achievements,
        "Lấy thành tích của người dùng thành công"
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Lấy stats của user khác (public)
   */
  async getPublicUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const stats = await this.xpService.getUserStats(userId);

      // Chỉ trả về thông tin public
      const publicStats = {
        userId: stats.userId,
        userName: stats.userName,
        avatarURL: stats.avatarURL,
        level: stats.level,
        experiencePoints: stats.experiencePoints,
        levelProgress: stats.levelProgress,
        totalCoursesCompleted: stats.totalCoursesCompleted,
        achievements: {
          total: stats.achievements.total,
          unlocked: stats.achievements.unlocked,
        },
      };

      sendSuccess(res, publicStats, "Lấy thống kê người dùng thành công");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Thống kê tổng quan XP (Admin Dashboard)
   * GET /api/xp/statistics/overview
   */
  async getStatisticsOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await this.xpService.getStatisticsOverview();
    sendSuccess(res, stats, "Lấy thống kê tổng quan XP thành công");
  } catch (error) {
    return next(error);
  }
}

/**
 * Thống kê XP theo thời gian
 * GET /api/xp/statistics/xp-by-period?startDate=...&endDate=...&groupBy=day|month|year
 */
async getXPByPeriod(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, groupBy } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp startDate và endDate" });
    }
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const validGroupBy = ["day", "month", "year"];
    const group = groupBy && validGroupBy.includes(groupBy as string) ? (groupBy as string) : "day";
    const stats = await this.xpService.getXPByPeriod(start, end, group);
    sendSuccess(res, stats, "Lấy thống kê XP theo thời gian thành công");
  } catch (error) {
    return next(error);
  }
}

/**
 * Top user có XP cao nhất
 * GET /api/xp/statistics/top-users?limit=10
 */
async getTopUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const topUsers = await this.xpService.getTopUsers(limit);
    sendSuccess(res, topUsers, "Lấy top user XP thành công");
  } catch (error) {
    return next(error);
  }
}

/**
 * Thống kê XP theo khóa học
 * GET /api/xp/statistics/course/:courseId
 */
async getXPByCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const stats = await this.xpService.getXPByCourse(courseId);
    sendSuccess(res, stats, "Lấy thống kê XP theo khóa học thành công");
  } catch (error) {
    return next(error);
  }
}

/**
 * Thống kê XP theo instructor
 * GET /api/xp/statistics/instructor/:userId
 */
async getXPByInstructor(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const stats = await this.xpService.getXPByInstructor(userId);
    sendSuccess(res, stats, "Lấy thống kê XP theo instructor thành công");
  } catch (error) {
    return next(error);
  }
}
}

export default XPController;
