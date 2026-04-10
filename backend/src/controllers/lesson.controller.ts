import { Request, Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";
import LessonService from "../services/lesson.service";
import { sendEmpty, sendNotFound, sendSuccess } from "../utils/responseHelper";

class LessonController {
  private readonly lessonService: LessonService;

  constructor(lessonService: LessonService) {
    this.lessonService = lessonService;
  }

  async getAllLessons(req: Request, res: Response, next: NextFunction) {
    try {
      const lessons = await this.lessonService.getAllLessons();

      if (!lessons) {
        sendEmpty(res, "Dữ liệu lesson đang rỗng");
        return;
      }
      return sendSuccess(res, lessons, "Lấy tất cả lesson thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getLessonById(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      if (!isUUID(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }
      const lesson = await this.lessonService.getLessonById(lessonId);
      if (!lesson) {
        sendNotFound(res, "Không tìm thấy lesson cần tìm");
        return;
      }
      return sendSuccess(res, lesson, "Lấy dữ liệu lesson thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async createLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonName, videoUrl, content, isPreview, chapterId } = req.body;

      // Transform to Prisma LessonCreateInput format
      const lessonData = {
        lessonName,
        videoUrl: videoUrl || null,
        content: content || null,
        isPreview: isPreview === true || isPreview === "true",
        chapter: {
          connect: { chapterId },
        },
      };

      const lesson = await this.lessonService.createLesson(lessonData);
      return sendSuccess(res, lesson, "Thêm mới lesson thành công.");
    } catch (error) {
      console.error("Error in createLesson controller:", error);
      return next(error);
    }
  }

  async updateLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      if (!isUUID(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }
      const data = req.body;

      const lesson = await this.lessonService.updateLesson(lessonId, data);

      if (!lesson) {
        sendNotFound(res, "Không tìm thấy lesson cần tìm");
        return;
      }
      return sendSuccess(res, lesson, "Cập nhật dữ liệu lesson thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async deleteLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;

      if (!isUUID(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }

      const lesson = await this.lessonService.deleteLesson(lessonId);

      if (!lesson) {
        sendNotFound(res, "Không tìm thấy lesson cần tìm");
        return;
      }
      return sendSuccess(res, lesson, "Xóa thành công lesson.");
    } catch (error) {
      return next(error);
    }
  }
}

export default LessonController;
