import { Request, Response, NextFunction } from "express";
import { sendToJudge0 } from "../services/judge0.service";
import {
  ICodeSubmissionRequest,
  ICodeSubmissionResponse,
} from "../types/customRequest";
import { sendSuccess } from "../utils/responseHelper";

class TestCodeController {
  async runCode(req: Request, res: Response, next: NextFunction) {
    try {
      const data: ICodeSubmissionRequest = req.body;

      const result = await sendToJudge0(data);

      return sendSuccess(res, result, "Code submitted successfully");
    } catch (error) {
      console.log("Lỗi khi submit code: ", error);
      return next(error);
    }
  }
}

export default TestCodeController;
