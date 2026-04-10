import { Request, Response, NextFunction } from "express";
import CodeSubmissionService from "../services/codeSubmission.service";
import { sendEmpty, sendSuccess } from "../utils/responseHelper";

class CodeSubmissionController {
  private readonly codeSubmissionService: CodeSubmissionService;
  constructor(codeSubmissionService: CodeSubmissionService) {
    this.codeSubmissionService = codeSubmissionService;
  }

  async getAllCodeSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const codeSubmissons =
        await this.codeSubmissionService.getAllCodeSubmission();

      if (!codeSubmissons) {
        sendEmpty(res, "Chưa có submission nào");
        return;
      }

      return sendSuccess(res, codeSubmissons, "Lấy tất cả các submission");
    } catch (error) {
      return next(error);
    }
  }
}

export default CodeSubmissionController;
