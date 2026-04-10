import { RolePermissions } from "./../constants/roles";
import { Request, Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";
import UserService from "../services/user.service";
import jwt from "jsonwebtoken";
import { sendNotFound, sendSuccess } from "../utils/responseHelper";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const userData = await this.userService.login(email, password);

      // Tạo JWT token với userId, email và roles
      const token = jwt.sign(
        {
          userId: userData.userId,
          email: userData.email,
          roles: userData.roles,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      return sendSuccess(res, token, "Đăng nhập thành công");
    } catch (error) {
      next(error);
    }
  }
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (!isUUID(userId)) {
        return res.status(400).json({ message: "Invalid user ID 1" });
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        sendNotFound(res, "Không tìm thấy thông tin người dùng.");
        return;
      }

      sendSuccess(res, user, "Lấy người dùng theo ID thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getUserByName(req: Request, res: Response, next: NextFunction) {
    try {
      const { userName } = req.query;
      if (!userName) {
        return res.status(400).json({ message: "Thiếu tham số userName" });
      }
      const users = await this.userService.getUserByName(userName as string);
      sendSuccess(res, users, "Lấy người dùng theo tên thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async searchUserByName(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      if (!search) {
        return res.status(400).json({ message: "Thiếu tham số search" });
      }
      const users = await this.userService.searchUserByName(search as string);
      sendSuccess(res, users, "Tìm kiếm người dùng thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getUserByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: "Thiếu tham số email" });
      }
      const user = await this.userService.getUserByEmail(email as string);
      if (!user) {
        sendNotFound(res, "Không tìm thấy người dùng theo Email này.");
        return;
      }
      sendSuccess(res, user, "Lấy người dùng theo Email thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getAllUser(req: Request, res: Response, next: NextFunction) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const take = parseInt(req.query.take as string) || 0;
      const users = await this.userService.getAllUser(skip, take);
      sendSuccess(res, users, "Lấy tất cả thông tin người dùng thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const user = await this.userService.createUser(data);
      sendSuccess(res, user, "Thêm mới người dùng thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (!isUUID(userId)) {
        return res.status(400).json({ message: "Invalid user ID 2" });
      }

      const data = req.body;
      const user = await this.userService.updateUser(data, userId);
      sendSuccess(res, user, "Cập nhật thông tin người dùng thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!isUUID(userId)) {
        return res.status(400).json({ message: "Invalid user ID 3" });
      }
      const result = await this.userService.deleteUser(userId);
      sendSuccess(res, result, "Xóa thông tin người dùng thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async changePasswordUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!isUUID(userId)) {
        return res.status(400).json({ message: "Invalid user ID 4" });
      }
      const { newPassword } = req.body;
      const user = await this.userService.changePasswordUser(
        userId,
        newPassword,
      );
      sendSuccess(res, user, "Thay đổi mật khẩu thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getUserWithRelations(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!isUUID(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await this.userService.getUserWithRelations(userId);
      if (!user) {
        sendNotFound(res, "Không tìm thấy thông tin người dùng.");
        return;
      }
      sendSuccess(res, user, "Lấy thông tin chi tiết người dùng thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getUserEnrolledCourses(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { userId } = req.params;
      if (!isUUID(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const courses = await this.userService.getUserEnrolledCourses(userId);
      sendSuccess(
        res,
        courses,
        "Lấy danh sách khóa học đã đăng ký thành công.",
      );
    } catch (error) {
      return next(error);
    }
  }

  async checkEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, courseId } = req.params;
      if (!isUUID(userId) || !isUUID(courseId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const isEnrolled = await this.userService.isUserEnrolledInCourse(
        userId,
        courseId,
      );
      sendSuccess(res, { isEnrolled }, "Kiểm tra enrollment thành công.");
    } catch (error) {
      return next(error);
    }
  }

  // ============================================
  // FIREBASE AUTHENTICATION CONTROLLERS
  // ============================================

  /**
   * Đăng nhập với Firebase
   */
  async loginWithFirebase(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.userService.loginWithFirebase(email, password);
      sendSuccess(res, result, "Đăng nhập Firebase thành công");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Đăng ký với Firebase
   */
  async registerWithFirebase(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const user = await this.userService.registerWithFirebase(data);
      sendSuccess(res, user, "Đăng ký Firebase thành công");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Verify Firebase token
   */
  async verifyFirebaseTokenController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ message: "Token không được để trống" });
      }
      const user = await this.userService.verifyFirebaseToken(idToken);
      sendSuccess(res, user, "Token hợp lệ");
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Google Login - Xác thực qua Firebase token và trả về JWT
   * POST /api/users/google-login
   */
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: "idToken là bắt buộc",
        });
      }

      const result = await this.userService.googleLogin(idToken);

      // Trả về JWT token (backend token)
      sendSuccess(res, result.token, "Đăng nhập Google thành công");
    } catch (error) {
      // Chỉ dùng next(error) để chuyển cho errorHandler middleware xử lý
      // KHÔNG gửi response trước khi gọi next() — sẽ gây lỗi ERR_HTTP_HEADERS_SENT
      return next(error);
    }
  }
}

export default UserController;
