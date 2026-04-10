import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { sendForbidden } from "../utils/responseHelper";

/**
 * Middleware kiểm tra role của user
 * Sử dụng cho cả JWT và Firebase authentication
 *
 * @param allowedRoles - Danh sách các roles được phép truy cập
 * @returns Express middleware function
 */
export const verifyRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Kiểm tra xem user có tồn tại không (đã qua authenticate/verifyFirebaseToken)
    if (!req.user) {
      return sendForbidden(res, "Bạn chưa đăng nhập");
    }

    // Kiểm tra xem user có role nào trong allowedRoles không
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return sendForbidden(
        res,
        `Bạn không có quyền truy cập. Yêu cầu role: ${allowedRoles.join(", ")}`
      );
    }

    // User có role phù hợp, cho qua
    next();
  };
};

/**
 * Middleware kiểm tra user có ít nhất một permission
 *
 * @param requiredPermissions - Danh sách permissions cần kiểm tra
 * @returns Express middleware function
 */
export const verifyPermission = (requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendForbidden(res, "Bạn chưa đăng nhập");
    }

    // Kiểm tra xem user có ít nhất một permission
    const hasPermission = req.user.permissions.some((permission) =>
      requiredPermissions.includes(permission)
    );

    if (!hasPermission) {
      return sendForbidden(
        res,
        `Bạn không có quyền thực hiện hành động này. Yêu cầu: ${requiredPermissions.join(
          ", "
        )}`
      );
    }

    next();
  };
};
