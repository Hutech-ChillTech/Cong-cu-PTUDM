import { Request, Response, NextFunction } from "express";
import { CertificateService } from "../services/certificate.service";
import { sendSuccess, sendError } from "../utils/responseHelper";
import path from "path";
import fs from "fs";

export class CertificateController {
  private certificateService: CertificateService;

  constructor() {
    this.certificateService = new CertificateService();
  }

  /**
   * Yêu cầu cấp certificate
   * POST /api/certificates/issue/:courseId
   */
  issueCertificate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.userId; // Từ middleware auth
      const { courseId } = req.params;

      if (!userId) {
        return sendError(res, "Unauthorized - User not authenticated", 401);
      }

      const result = await this.certificateService.checkAndIssueCertificate(
        userId,
        courseId
      );

      return sendSuccess(res, result, result.message, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy tất cả certificates của user
   * GET /api/certificates/my-certificates
   */
  getMyCertificates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.userId; // Từ middleware auth

      if (!userId) {
        return sendError(res, "Unauthorized - User not authenticated", 401);
      }

      const certificates = await this.certificateService.getUserCertificates(
        userId
      );

      return sendSuccess(
        res,
        certificates,
        "Lấy danh sách certificates thành công"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy certificate theo ID
   * GET /api/certificates/:certificateId
   */
  getCertificateById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { certificateId } = req.params;

      // Validate UUID format (tránh crash khi nhận certificateURL thay vì certificateId)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(certificateId)) {
        return sendError(
          res,
          "Invalid certificateId format. Expected UUID.",
          400
        );
      }

      const certificate = await this.certificateService.getCertificateById(
        certificateId
      );

      return sendSuccess(res, certificate, "Lấy certificate thành công");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy certificate của user trong một course
   * GET /api/certificates/course/:courseId
   */
  getCertificateInCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.userId; // Từ middleware auth
      const { courseId } = req.params;

      if (!userId) {
        return sendError(res, "Unauthorized - User not authenticated", 401);
      }

      const certificate =
        await this.certificateService.getUserCertificateInCourse(
          userId,
          courseId
        );

      return sendSuccess(res, certificate, "Lấy certificate thành công");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cập nhật URL certificate (sau khi generate PDF)
   * PATCH /api/certificates/:certificateId/url
   */
  updateCertificateURL = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { certificateId } = req.params;
      const { certificateURL } = req.body;

      if (!certificateURL) {
        return sendError(res, "Thiếu certificateURL", 400);
      }

      const certificate = await this.certificateService.updateCertificateURL(
        certificateId,
        certificateURL
      );

      return sendSuccess(res, certificate, "Cập nhật URL thành công");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách certificates của course (Admin/Creator)
   * GET /api/certificates/course/:courseId/all
   */
  getCourseCertificates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;

      const certificates = await this.certificateService.getCourseCertificates(
        courseId
      );

      return sendSuccess(
        res,
        certificates,
        "Lấy danh sách certificates của course thành công"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa certificate (Admin only)
   * DELETE /api/certificates/:certificateId
   */
  deleteCertificate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { certificateId } = req.params;

      const result = await this.certificateService.deleteCertificate(
        certificateId
      );

      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Thống kê certificates của user
   * GET /api/certificates/stats
   */
  getCertificateStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.userId; // Từ middleware auth

      if (!userId) {
        return sendError(res, "Unauthorized - User not authenticated", 401);
      }

      const stats = await this.certificateService.getCertificateStats(userId);

      return sendSuccess(res, stats, "Lấy thống kê thành công");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xem/Tải PDF certificate
   * GET /api/certificates/view/:filename
   * Public route - không cần authentication
   */
  viewCertificatePDF = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { filename } = req.params;

      // Validate filename (security: prevent path traversal)
      if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return sendError(res, "Invalid filename", 400);
      }

      // Check if file exists
      const filePath = path.join(__dirname, "../../public/certificates", filename);
      
      if (!fs.existsSync(filePath)) {
        return sendError(res, "Certificate file not found", 404);
      }

      // Set headers for PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  };
}
