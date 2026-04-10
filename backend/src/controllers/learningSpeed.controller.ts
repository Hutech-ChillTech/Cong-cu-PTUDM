import { Request, Response, NextFunction } from "express";
import LearningSpeedService from "../services/learningSpeed.service";
import { sendSuccess, sendError } from "../utils/responseHelper";

class LearningSpeedController {
  /**
   * POST /api/learning-speed/calculate
   * Tính toán learning speed sau khi hoàn thành khóa học
   */
  async calculateSpeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, courseId } = req.body;

      if (!userId || !courseId) {
        return sendError(res, "userId và courseId là bắt buộc", 400);
      }

      // Trigger calculation khi user hoàn thành khóa học
      const result = await LearningSpeedService.onCourseCompleted(
        userId,
        courseId
      );

      return sendSuccess(
        res,
        {
          currentCourse: result.currentCourse,
          recommendedLevel: result.recommendedLevel,
          reason: result.reason,
          courses: result.courses,
        },
        "Lấy gợi ý khóa học thành công"
      );
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  /**
   * GET /api/learning-speed/recommendations/:userId/:courseId
   * Lấy gợi ý khóa học dựa trên learning speed
   */
  async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, courseId } = req.params;

      if (!userId || !courseId) {
        return sendError(res, "userId và courseId là bắt buộc", 400);
      }

      const recommendations = await LearningSpeedService.recommendNextCourses(
        userId,
        courseId
      );

      return sendSuccess(res, recommendations, "Lấy gợi ý khóa học thành công");
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  /**
   * GET /api/learning-speed/history/:userId
   * Lấy lịch sử learning speed của user
   */
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendError(res, "userId là bắt buộc", 400);
      }

      const history = await LearningSpeedService.getUserLearningSpeedHistory(
        userId
      );

      return sendSuccess(res, history, "Lấy lịch sử learning speed thành công");
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  /**
   * POST /api/learning-speed/manual
   * Tính toán learning speed thủ công (để test)
   */
  async calculateManual(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        userId,
        courseId,
        totalScore,
        estimatedDuration,
        totalLearningTime, // Optional - sẽ tự động lấy từ Enrollment nếu không cung cấp
      } = req.body;

      if (!userId || !courseId || !totalScore || !estimatedDuration) {
        return sendError(
          res,
          "Thiếu thông tin: userId, courseId, totalScore, estimatedDuration",
          400
        );
      }

      // Tính learning speed
      const speedResult = await LearningSpeedService.calculateLearningSpeed({
        userId,
        courseId,
        totalScore,
        estimatedDuration,
        totalLearningTime,
      });

      // Lấy gợi ý khóa học dựa trên learning speed
      const recommendations = await LearningSpeedService.recommendNextCourses(
        userId,
        courseId
      );

      return sendSuccess(
        res,
        {
          speedCalculation: {
            speedScore: speedResult.speedScore,
            learningSpeed: speedResult.learningSpeed,
            formula: `(${totalScore}/100 × ${estimatedDuration}) / ${totalLearningTime} = ${speedResult.speedScore.toFixed(
              2
            )}`,
          },
          currentLevel: {
            level: recommendations.currentLevel.level,
            subLevel: recommendations.currentLevel.subLevel,
            display: `${recommendations.currentLevel.level}-${recommendations.currentLevel.subLevel}`,
          },
          recommendedLevel: {
            level: recommendations.recommendedLevel.level,
            subLevel: recommendations.recommendedLevel.subLevel,
            display: `${recommendations.recommendedLevel.level}-${recommendations.recommendedLevel.subLevel}`,
          },
          recommendation: {
            message: recommendations.reason,
            suggestion: `Từ ${recommendations.currentLevel.level}-${recommendations.currentLevel.subLevel} → Gợi ý ${recommendations.recommendedLevel.level}-${recommendations.recommendedLevel.subLevel}`,
          },
          recommendedCourses: recommendations.courses,
        },
        "Tính toán learning speed và gợi ý khóa học thành công"
      );
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
  /**
   * POST /api/learning-speed/on-course-completed
   * Alias của calculateSpeed - tự động tính learning speed khi hoàn thành khóa học
   */
  onCourseCompleted = this.calculateSpeed;
}

export default new LearningSpeedController();
