import { Response } from "express";

export function handleError(
  res: Response,
  error: unknown,
  action: string,
  status = 400,
  defaultMsg = "Đã xảy ra lỗi"
) {
  if (error instanceof Error) {
    console.error(`Lỗi khi ${action}:`, error.message);
    return res.status(status).json({ error: error.message });
  } else {
    console.error(`Lỗi không xác định khi ${action}`);
    return res.status(status).json({ error: defaultMsg });
  }
}
