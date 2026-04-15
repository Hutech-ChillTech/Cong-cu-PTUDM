import { Request, Response } from "express";
import { LearningPathService } from "../services/learningPath.service";
import { sendSuccess, sendError } from "../utils/responseHelper";

export class LearningPathController {
  private learningPathService: LearningPathService;

  constructor() {
    this.learningPathService = new LearningPathService();
  }

  /**
   * GET /api/learning-paths
   * Lấy tất cả Learning Paths (có filter)
   */
  getAllLearningPaths = async (req: Request, res: Response) => {
    try {
      const { level, isPublished, search, page, limit } = req.query;

      const filters = {
        level: level as string,
        isPublished:
          isPublished === "true"
            ? true
            : isPublished === "false"
            ? false
            : undefined,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      };

      const result = await this.learningPathService.getAllLearningPaths(
        filters
      );

      return sendSuccess(
        res,
        result,
        "Lấy danh sách Learning Paths thành công"
      );
    } catch (error: any) {
      console.error("Error in getAllLearningPaths:", error);
      return sendError(
        res,
        error.message || "Lỗi khi lấy danh sách Learning Paths",
        500
      );
    }
  };

  /**
   * GET /api/learning-paths/:id
   * Lấy chi tiết Learning Path
   */
  getLearningPathById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const path = await this.learningPathService.getLearningPathById(id);

      return sendSuccess(res, path, "Lấy chi tiết Learning Path thành công");
    } catch (error: any) {
      console.error("Error in getLearningPathById:", error);
      return sendError(
        res,
        error.message || "Lỗi khi lấy chi tiết Learning Path",
        404
      );
    }
  };

  /**
   * POST /api/learning-paths
   * Tạo Learning Path mới (Admin/Creator)
   */
  createLearningPath = async (req: Request, res: Response) => {
    try {
      const { title, description, level, estimatedHours, isPublished } =
        req.body;
      const createdBy = (req as any).user?.userId; // From auth middleware

      const newPath = await this.learningPathService.createLearningPath({
        title,
        description,
        level,
        estimatedHours,
        isPublished,
        createdBy,
      });

      return sendSuccess(res, newPath, "Tạo Learning Path thành công", 201);
    } catch (error: any) {
      console.error("Error in createLearningPath:", error);
      return sendError(res, error.message || "Lỗi khi tạo Learning Path", 400);
    }
  };

  /**
   * PUT /api/learning-paths/:id
   * Cập nhật Learning Path (Admin/Creator)
   */
  updateLearningPath = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, level, estimatedHours, isPublished } =
        req.body;

      const updatedPath = await this.learningPathService.updateLearningPath(
        id,
        {
          title,
          description,
          level,
          estimatedHours,
          isPublished,
        }
      );

      return sendSuccess(res, updatedPath, "Cập nhật Learning Path thành công");
    } catch (error: any) {
      console.error("Error in updateLearningPath:", error);
      return sendError(
        res,
        error.message || "Lỗi khi cập nhật Learning Path",
        400
      );
    }
  };

  /**
   * DELETE /api/learning-paths/:id
   * Xóa Learning Path (Admin)
   */
  deleteLearningPath = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.learningPathService.deleteLearningPath(id);

      return sendSuccess(res, null, "Xóa Learning Path thành công");
    } catch (error: any) {
      console.error("Error in deleteLearningPath:", error);
      return sendError(res, error.message || "Lỗi khi xóa Learning Path", 404);
    }
  };

  /**
   * POST /api/learning-paths/:id/courses
   * Thêm khóa học vào Learning Path (Admin/Creator)
   */
  addCourseToPath = async (req: Request, res: Response) => {
    try {
      const { id: learningPathId } = req.params;
      const { courseId, orderIndex, isRequired } = req.body;

      const result = await this.learningPathService.addCourseToPath({
        learningPathId,
        courseId,
        orderIndex,
        isRequired,
      });

      return sendSuccess(
        res,
        result,
        "Thêm khóa học vào Learning Path thành công",
        201
      );
    } catch (error: any) {
      console.error("Error in addCourseToPath:", error);
      return sendError(
        res,
        error.message || "Lỗi khi thêm khóa học vào Learning Path",
        400
      );
    }
  };

  /**
   * DELETE /api/learning-paths/:id/courses/:courseId
   * Xóa khóa học khỏi Learning Path (Admin/Creator)
   */
  removeCourseFromPath = async (req: Request, res: Response) => {
    try {
      const { id: learningPathId, courseId } = req.params;

      await this.learningPathService.removeCourseFromPath(
        learningPathId,
        courseId
      );

      return sendSuccess(
        res,
        null,
        "Xóa khóa học khỏi Learning Path thành công"
      );
    } catch (error: any) {
      console.error("Error in removeCourseFromPath:", error);
      return sendError(
        res,
        error.message || "Lỗi khi xóa khóa học khỏi Learning Path",
        404
      );
    }
  };

  /**
   * PUT /api/learning-paths/:id/courses/reorder
   * Sắp xếp lại thứ tự khóa học (Admin/Creator)
   */
  reorderCourses = async (req: Request, res: Response) => {
    try {
      const { id: learningPathId } = req.params;
      const { courseOrders } = req.body; // [{ courseId, orderIndex }]

      await this.learningPathService.reorderCourses(
        learningPathId,
        courseOrders
      );

      return sendSuccess(res, null, "Sắp xếp lại thứ tự khóa học thành công");
    } catch (error: any) {
      console.error("Error in reorderCourses:", error);
      return sendError(
        res,
        error.message || "Lỗi khi sắp xếp lại thứ tự khóa học",
        400
      );
    }
  };

  /**
   * GET /api/learning-paths/:id/courses
   * Lấy danh sách khóa học trong Learning Path
   */
  getCoursesInPath = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const courses = await this.learningPathService.getCoursesInPath(id);

      return sendSuccess(res, courses, "Lấy danh sách khóa học thành công");
    } catch (error: any) {
      console.error("Error in getCoursesInPath:", error);
      return sendError(
        res,
        error.message || "Lỗi khi lấy danh sách khóa học",
        404
      );
    }
  };

  /**
   * POST /api/learning-paths/:id/follow
   * User follow Learning Path
   */
  followLearningPath = async (req: Request, res: Response) => {
    try {
      const { id: learningPathId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return sendError(
          res,
          "Vui lòng đăng nhập để follow Learning Path",
          401
        );
      }

      const result = await this.learningPathService.followLearningPath(
        userId,
        learningPathId
      );

      return sendSuccess(res, result, "Follow Learning Path thành công", 201);
    } catch (error: any) {
      console.error("Error in followLearningPath:", error);
      return sendError(
        res,
        error.message || "Lỗi khi follow Learning Path",
        400
      );
    }
  };

  /**
   * DELETE /api/learning-paths/:id/follow
   * User unfollow Learning Path
   */
  unfollowLearningPath = async (req: Request, res: Response) => {
    try {
      const { id: learningPathId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return sendError(res, "Vui lòng đăng nhập", 401);
      }

      await this.learningPathService.unfollowLearningPath(
        userId,
        learningPathId
      );

      return sendSuccess(res, null, "Unfollow Learning Path thành công");
    } catch (error: any) {
      console.error("Error in unfollowLearningPath:", error);
      return sendError(
        res,
        error.message || "Lỗi khi unfollow Learning Path",
        404
      );
    }
  };

  /**
   * GET /api/learning-paths/my/paths
   * Lấy các Learning Paths mà user đang follow
   */
  getMyLearningPaths = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return sendError(res, "Vui lòng đăng nhập", 401);
      }

      const paths = await this.learningPathService.getUserLearningPaths(userId);

      return sendSuccess(
        res,
        paths,
        "Lấy danh sách Learning Paths đang follow thành công"
      );
    } catch (error: any) {
      console.error("Error in getMyLearningPaths:", error);
      return sendError(
        res,
        error.message || "Lỗi khi lấy danh sách Learning Paths",
        500
      );
    }
  };

  /**
   * PUT /api/learning-paths/:id/progress
   * Cập nhật progress của user trong Learning Path
   */
  updateProgress = async (req: Request, res: Response) => {
    try {
      const { id: learningPathId } = req.params;
      const { completedCourseIds } = req.body; // Array of courseIds
      const userId = (req as any).user?.userId;

      if (!userId) {
        return sendError(res, "Vui lòng đăng nhập", 401);
      }

      await this.learningPathService.updateUserProgress(
        userId,
        learningPathId,
        completedCourseIds
      );

      return sendSuccess(res, null, "Cập nhật progress thành công");
    } catch (error: any) {
      console.error("Error in updateProgress:", error);
      return sendError(res, error.message || "Lỗi khi cập nhật progress", 400);
    }
  };

  /**
   * GET /api/learning-paths/:id/stats
   * Lấy thống kê Learning Path
   */
  getLearningPathStats = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const stats = await this.learningPathService.getLearningPathStats(id);

      return sendSuccess(res, stats, "Lấy thống kê Learning Path thành công");
    } catch (error: any) {
      console.error("Error in getLearningPathStats:", error);
      return sendError(
        res,
        error.message || "Lỗi khi lấy thống kê Learning Path",
        404
      );
    }
  };

  /**
   * GET /api/learning-paths/popular
   * Lấy các Learning Paths phổ biến
   */
  getPopularLearningPaths = async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;

      const result = await this.learningPathService.getPopularLearningPaths(
        limit ? parseInt(limit as string) : 10
      );

      return sendSuccess(
        res,
        result,
        "Lấy danh sách Learning Paths phổ biến thành công"
      );
    } catch (error: any) {
      console.error("Error in getPopularLearningPaths:", error);
      return sendError(
        res,
        error.message || "Lỗi khi lấy danh sách Learning Paths phổ biến",
        500
      );
    }
  };

  /**
   * GET /api/learning-paths/suggest
   * Gợi ý Learning Paths dựa trên level của user
   */
  suggestLearningPaths = async (req: Request, res: Response) => {
    try {
      const { level, limit } = req.query;

      const result = await this.learningPathService.suggestLearningPaths(
        level as string,
        limit ? parseInt(limit as string) : 5
      );

      return sendSuccess(res, result, "Gợi ý Learning Paths thành công");
    } catch (error: any) {
      console.error("Error in suggestLearningPaths:", error);
      return sendError(
        res,
        error.message || "Lỗi khi gợi ý Learning Paths",
        500
      );
    }
  };
}

export default new LearningPathController();
