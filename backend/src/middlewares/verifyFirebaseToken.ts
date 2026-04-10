import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import Prisma from "../configs/prismaClient";
import admin from "../configs/firebaseAdminConfig";
import { sendNotFound, sendUnauthorized } from "../utils/responseHelper";

/**
 * Middleware xác thực Firebase Token
 * Verify token từ Firebase và lấy thông tin user từ database
 */
export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      sendUnauthorized(res, "Token không hợp lệ hoặc không được cung cấp");
      return;
    }

    const idToken = authHeader.split("Bearer ")[1].trim();

    // Verify token với Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken || !decodedToken.uid) {
      sendUnauthorized(res, "ID Token không hợp lệ");
      return;
    }

    // Tìm user trong database theo firebaseUid
    const user = await Prisma.user.findFirst({
      where: { firebaseUid: decodedToken.uid },
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
      sendNotFound(res, "Người dùng chưa đăng ký tài khoản");
      return;
    }

    // Extract roles và permissions
    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = user.roles.flatMap((ur) =>
      ur.role.roleClaims.map((rc) => rc.permission)
    );

    // Gắn user info vào request
    req.user = {
      userId: user.userId,
      email: user.email,
      roles,
      permissions,
    };

    console.log("✅ Firebase Token verified for user:", user.email);
    return next();
  } catch (error: any) {
    console.error("❌ VerifyFirebaseToken error:", error.message);
    sendUnauthorized(res, "Token không hợp lệ hoặc hết hạn");
    return;
  }
};

/**
 * Optional Firebase authentication
 * Không bắt buộc phải có token, nhưng nếu có thì sẽ verify
 */
export const optionalFirebaseAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // Nếu không có token, cho qua luôn
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  // Nếu có token, verify như bình thường
  return verifyFirebaseToken(req, res, next);
};
