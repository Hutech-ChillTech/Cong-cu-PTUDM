import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import {
  readLimiter,
  createLimiter,
} from "../middlewares/rateLimiter.middleware";

const router = Router();
const submissionController = new SubmissionController();

/**
 * Nộp bài quiz
 * POST /api/submissions/submit
 * Body: { chapterQuizId, answers: { questionId: optionId } }
 * Yêu cầu: Authenticated
 */
router.post("/submit", createLimiter, submissionController.submitQuiz);

/**
 * Lấy kết quả submission của một quiz
 * GET /api/submissions/:chapterQuizId/result
 * Yêu cầu: Authenticated
 */
router.get(
  "/:chapterQuizId/result",
  readLimiter,
  submissionController.getSubmissionResult
);

/**
 * Lấy tất cả submissions của user trong một course
 * GET /api/submissions/course/:courseId
 * Yêu cầu: Authenticated
 */
router.get(
  "/course/:courseId",
  readLimiter,
  submissionController.getUserSubmissionsInCourse
);

/**
 * Kiểm tra tiến độ hoàn thành course
 * GET /api/submissions/course/:courseId/completion
 * Yêu cầu: Authenticated
 */
router.get(
  "/course/:courseId/completion",
  readLimiter,
  submissionController.checkCourseCompletion
);

/**
 * Lấy tất cả submissions của user
 * GET /api/submissions/my-submissions
 * Yêu cầu: Authenticated
 */
router.get(
  "/my-submissions",
  readLimiter,
  submissionController.getAllUserSubmissions
);

/**
 * Xóa submission (Admin only)
 * DELETE /api/submissions/:submissionId
 * Yêu cầu: Admin permission
 */
router.delete(
  "/:submissionId",
  createLimiter,
  submissionController.deleteSubmission
);

export default router;
