import { Router } from 'express';
import CourseRecommendationController from '../controllers/courseRecommendation.controller';
import { readLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

/**
 * POST /api/recommendations/simple
 * Gợi ý khóa học đơn giản sau khi hoàn thành
 * Body: { userId, completedCourseId }
 * Không cần Certificate, không cần Learning Speed
 */
router.post(
  '/simple',
  readLimiter,
  CourseRecommendationController.getSimpleRecommendations
);

export default router;
