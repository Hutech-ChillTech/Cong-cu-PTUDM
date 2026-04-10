import { Request, Response, NextFunction } from "express";
import { SubmissionService } from "../services/submission.service";
import { sendSuccess, sendError } from "../utils/responseHelper";

export class SubmissionController {
  private submissionService: SubmissionService;

  constructor() {
    this.submissionService = new SubmissionService();
  }

  /**
   * Nộp bài quiz
   * POST /api/submissions/submit
   */
  submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId; // Từ middleware auth
      const { chapterQuizId, answers } = req.body;

      if (!chapterQuizId || !answers) {
        return sendError(
          res,
          "Thiếu thông tin chapterQuizId hoặc answers",
          400
        );
      }

      const result = await this.submissionService.submitQuiz({
        userId,
        chapterQuizId,
        answers,
      });

      return sendSuccess(res, result, result.message, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy kết quả submission của user cho một quiz
   * GET /api/submissions/:chapterQuizId/result
   */
  getSubmissionResult = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.body.userId; // Từ middleware auth
      const { chapterQuizId } = req.params;

      const result = await this.submissionService.getSubmissionResult(
        userId,
        chapterQuizId
      );

      return sendSuccess(res, result, "Lấy kết quả submission thành công");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy tất cả submissions của user trong một course
   * GET /api/submissions/course/:courseId
   */
  getUserSubmissionsInCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.body.userId; // Từ middleware auth
      const { courseId } = req.params;

      const submissions =
        await this.submissionService.getUserSubmissionsInCourse(
          userId,
          courseId
        );

      return sendSuccess(
        res,
        submissions,
        "Lấy danh sách submissions thành công"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy tất cả submissions của user
   * GET /api/submissions/my-submissions
   */
  getAllUserSubmissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.body.userId; // Từ middleware auth

      const submissions = await this.submissionService.getAllUserSubmissions(
        userId
      );

      return sendSuccess(res, submissions, "Lấy tất cả submissions thành công");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Kiểm tra tiến độ hoàn thành course
   * GET /api/submissions/course/:courseId/completion
   */
  checkCourseCompletion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.body.userId; // Từ middleware auth
      const { courseId } = req.params;

      const completion = await this.submissionService.checkCourseCompletion(
        userId,
        courseId
      );

      return sendSuccess(res, completion, "Kiểm tra tiến độ thành công");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa submission (Admin only)
   * DELETE /api/submissions/:submissionId
   */
  deleteSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { submissionId } = req.params;

      const result = await this.submissionService.deleteSubmission(
        submissionId
      );

      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  };
}
