import chalk from "chalk";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/responseHelper";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = error.status || error.statusCode || 500;
  const message = error.message || "Lỗi hệ thống";

  console.log(
    chalk.red(`[Error] ${req.method} ${req.originalUrl}`),
    chalk.gray(`Status: ${status}`),
    error.stack || error,
  );

  // Kiểm tra xem response đã được gửi chưa
  // Nếu đã gửi rồi thì KHÔNG gửi lại — tránh lỗi ERR_HTTP_HEADERS_SENT
  if (res.headersSent) {
    return next(error);
  }

  sendError(
    res,
    message,
    status,
    process.env.NODE_ENV === "development" ? error.stack : undefined,
  );
};
