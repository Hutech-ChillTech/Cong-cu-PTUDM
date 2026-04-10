import { Response } from "express";

// SUCCESS RESPONSE
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Thành Công",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = <T>(res: Response, data: T, message = "Tạo thành công") => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};

export const sendEmpty = (res: Response, message = "Danh sách rỗng") => {
  return sendSuccess(res, [], message);
};

// ERROR RESPONSE
export const sendError = (
  res: Response,
  message = "Lỗi hệ thống",
  statusCode = 500,
  errorData?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorData,
  });
};

export const sendBadRequest = (res: Response, message = "Yêu cầu thất bại") => {
  return sendError(res, message, 400);
};

export const sendUnauthorized = (res: Response, message = "Người dùng chưa đăng nhập") => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message = "Bạn không có quyền truy cập") => {
  return sendError(res, message, 403);
};

export const sendNotFound = (res: Response, message = "Không tồn tại") => {
  return sendError(res, message, 404);
};
