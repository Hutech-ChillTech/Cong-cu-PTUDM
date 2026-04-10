import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Prisma from "../configs/prismaClient";

/**
 * Extended Request interface để thêm user data
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header Authorization
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Lấy token từ header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    // 2. Extract token (bỏ "Bearer " prefix)
    const token = authHeader.substring(7);

    // 3. Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 4. Lấy thông tin user từ database (bao gồm roles)
    const user = await Prisma.user.findUnique({
      where: { userId: decoded.userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                roleClaims: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    // 5. Extract roles và permissions
    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = user.roles.flatMap((ur) =>
      ur.role.roleClaims.map((rc) => rc.permission)
    );

    // 6. Gắn user info vào request object
    req.user = {
      userId: user.userId,
      email: user.email,
      roles,
      permissions,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Optional authentication
 * Không bắt buộc phải có token, nhưng nếu có thì sẽ verify
 * Nếu token không hợp lệ, vẫn cho qua (chỉ cảnh báo)
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // Nếu không có token, cho qua luôn
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    // Nếu có token, thử verify
    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Lấy thông tin user
    const user = await Prisma.user.findUnique({
      where: { userId: decoded.userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                roleClaims: true,
              },
            },
          },
        },
      },
    });

    // Nếu user tồn tại, gắn vào request
    if (user) {
      const roles = user.roles.map((ur) => ur.role.name);
      const permissions = user.roles.flatMap((ur) =>
        ur.role.roleClaims.map((rc) => rc.permission)
      );

      req.user = {
        userId: user.userId,
        email: user.email,
        roles,
        permissions,
      };
    }

    // Dù token có hợp lệ hay không, vẫn cho qua
    next();
  } catch (error) {
    // Với optional auth, nếu có lỗi (token không hợp lệ, expired), vẫn cho qua
    // Chỉ log để debug
    console.log(
      "Optional auth warning:",
      error instanceof Error ? error.message : "Unknown error"
    );
    next();
  }
};
