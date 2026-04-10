import { Request, Response, NextFunction } from 'express';
import CourseRecommendationService from '../services/courseRecommendation.service';
import { sendSuccess, sendError } from '../utils/responseHelper';

class CourseRecommendationController {
  /**
   * POST /api/recommendations/simple
   * Gợi ý khóa học đơn giản (không cần Certificate)
   */
  async getSimpleRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, completedCourseId } = req.body;

      if (!userId || !completedCourseId) {
        return sendError(res, 'userId và completedCourseId là bắt buộc', 400);
      }

      const recommendations = await CourseRecommendationService.getSimpleRecommendations(
        userId,
        completedCourseId
      );

      return sendSuccess(res, recommendations, 'Lấy gợi ý khóa học thành công');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}

export default new CourseRecommendationController();
