import { Request, Response, NextFunction } from "express";
import UserService from "../services/user.service";
import LessonService from "../services/lesson.service";
import {
  uploadImageToFirebase,
  uploadVideoToCloudinary,
} from "../services/upload.service";
import { sendSuccess, sendNotFound } from "../utils/responseHelper";
import createHttpError from "http-errors";
import cloudinary from "../configs/cloudinary";
import YouTubeService from "../services/youtube.service";

class MediaController {
  private readonly userService: UserService;
  private readonly lessonService: LessonService;
  constructor(userService: UserService, lessonService: LessonService) {
    this.userService = userService;
    this.lessonService = lessonService;
  }

  async uploadUserAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const userId = req.params.userId;
      if (!file) {
        throw createHttpError(404, "Hình ảnh chưa được tải lên");
      }

      const avatarUrl = await uploadImageToFirebase(userId, file, "avatars");

      const payload = {
        avatarURL: avatarUrl,
      };

      await this.userService.updateUser(payload, userId);

      return sendSuccess(res, { avatarUrl }, "Tải ảnh đại diện lên thành công");
    } catch (error) {
      console.error("Error uploading user avatar:", error);
      return next(error);
    }
  }

  /**
   * Generate Cloudinary signature for client-side upload
   * POST /api/uploads/signature
   *
   * Body: { folder?: string, upload_preset?: string }
   * Returns: signature, timestamp, cloudName, apiKey để FE upload trực tiếp lên Cloudinary
   */
  async getCloudinarySignature(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Nhận params từ body hoặc query (linh hoạt cho FE)
      const folder = req.body?.folder || req.query?.folder || "videos";
      const upload_preset = req.body?.upload_preset || req.query?.upload_preset;

      const timestamp = Math.round(new Date().getTime() / 1000);

      // Tạo params để sign
      const params: any = {
        timestamp,
        folder,
      };

      if (upload_preset) {
        params.upload_preset = upload_preset;
      }

      // Generate signature bằng Cloudinary API Secret
      const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_CLOUD_SECRET as string,
      );

      return sendSuccess(
        res,
        {
          signature,
          timestamp,
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.CLOUDINARY_CLOUD_KEY,
          folder,
        },
        "Lấy chữ ký upload thành công",
      );
    } catch (error) {
      console.error("Error generating Cloudinary signature:", error);
      return next(error);
    }
  }

  /**
   * Admin upload video trực tiếp lên YouTube (Resumable Upload)
   * POST /api/uploads/video-youtube
   */
  async uploadVideoToYouTube(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("--- DEBUG UPLOAD ---");
      console.log("File:", req.file);
      console.log("Body:", req.body);
      console.log("Headers:", req.headers["content-type"]);

      const file = req.file;
      const { title, description } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          message:
            "Không tìm thấy file video để upload. Kiểm tra field name (phải là 'video').",
          debug: {
            hasBody: !!req.body,
            contentType: req.headers["content-type"],
          },
        });
      }

      // Đảm bảo title luôn hợp lệ với YouTube (không rỗng, không có ký tự đặc biệt)
      const safeTitle =
        (title && title.trim()) ||
        (file.originalname
          ? file.originalname.replace(/\.[^/.]+$/, "").trim()
          : "") ||
        `Video bài học - ${new Date().toLocaleDateString("vi-VN")}`;

      // file.path tồn tại vì chúng ta dùng diskStorage trong middleware cho video
      const result = await YouTubeService.uploadVideo(
        safeTitle,
        description || "Video được upload từ hệ thống LMS",
        file.path,
      );

      return sendSuccess(
        res,
        result,
        "Đã upload video lên YouTube thành công (Chế độ Không công khai)",
      );
    } catch (error) {
      console.error("Error uploading to YouTube:", error);
      return next(error);
    }
  }
}

export default MediaController;
