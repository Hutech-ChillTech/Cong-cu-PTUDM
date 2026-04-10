import { Request, Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";
import EnrollmentService from "../services/enrollment.service";
import { sendEmpty, sendNotFound, sendSuccess } from "../utils/responseHelper";
import { AuthRequest } from "../middlewares/auth.middleware";

class EnrollmentController {
  private readonly enrollmentService: EnrollmentService;

  constructor(enrollmentService: EnrollmentService) {
    this.enrollmentService = enrollmentService;
  }

  async getAllEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;
      const params = {
        skip: skip ? parseInt(skip as string) : undefined,
        take: take ? parseInt(take as string) : undefined,
      };

      const enrollments = await this.enrollmentService.getAllEnrollments(
        params
      );

      if (!enrollments || enrollments.length === 0) {
        sendEmpty(res, "Dữ liệu enrollment đang rỗng");
        return;
      }
      return sendSuccess(res, enrollments, "Lấy tất cả enrollment thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getEnrollmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;
      if (!isUUID(enrollmentId)) {
        return res.status(400).json({ message: "Invalid enrollment ID" });
      }

      const enrollment = await this.enrollmentService.getEnrollmentById(
        enrollmentId
      );
      if (!enrollment) {
        sendNotFound(res, "Không tìm thấy enrollment cần tìm");
        return;
      }
      return sendSuccess(res, enrollment, "Lấy dữ liệu enrollment thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const enrollments = await this.enrollmentService.getEnrollmentsByUser(
        userId
      );

      if (!enrollments || enrollments.length === 0) {
        sendEmpty(res, "Bạn chưa đăng ký khóa học nào");
        return;
      }
      return sendSuccess(
        res,
        enrollments,
        "Lấy danh sách khóa học đã đăng ký thành công."
      );
    } catch (error) {
      return next(error);
    }
  }

  async getUserEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!isUUID(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const enrollments = await this.enrollmentService.getEnrollmentsByUser(
        userId
      );

      if (!enrollments || enrollments.length === 0) {
        sendEmpty(res, "User chưa đăng ký khóa học nào");
        return;
      }
      return sendSuccess(
        res,
        enrollments,
        "Lấy danh sách khóa học của user thành công."
      );
    } catch (error) {
      return next(error);
    }
  }

  async getCourseEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      if (!isUUID(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const enrollments = await this.enrollmentService.getEnrollmentsByCourse(
        courseId
      );

      if (!enrollments || enrollments.length === 0) {
        sendEmpty(res, "Khóa học chưa có học viên nào đăng ký");
        return;
      }
      return sendSuccess(
        res,
        enrollments,
        "Lấy danh sách học viên của khóa học thành công."
      );
    } catch (error) {
      return next(error);
    }
  }

  async checkEnrollment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!isUUID(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const result = await this.enrollmentService.checkEnrollment(
        userId,
        courseId
      );
      return sendSuccess(res, result, "Kiểm tra enrollment thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async createEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const enrollment = await this.enrollmentService.createEnrollment(data);
      return sendSuccess(res, enrollment, "Đăng ký khóa học thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async enrollMyCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const enrollment = await this.enrollmentService.createEnrollment({
        user: { connect: { userId } },
        course: { connect: { courseId } },
      });

      return sendSuccess(res, enrollment, "Đăng ký khóa học thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async deleteEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      if (!isUUID(enrollmentId)) {
        return res.status(400).json({ message: "Invalid enrollment ID" });
      }

      const enrollment = await this.enrollmentService.deleteEnrollment(
        enrollmentId
      );

      if (!enrollment) {
        sendNotFound(res, "Không tìm thấy enrollment cần xóa");
        return;
      }
      return sendSuccess(res, enrollment, "Hủy đăng ký khóa học thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getCourseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      if (!isUUID(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const stats = await this.enrollmentService.getEnrollmentStats(courseId);
      return sendSuccess(res, stats, "Lấy thống kê enrollment thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getMyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const stats = await this.enrollmentService.getUserEnrollmentStats(userId);
      return sendSuccess(
        res,
        stats,
        "Lấy thống kê enrollment của user thành công."
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default EnrollmentController;
