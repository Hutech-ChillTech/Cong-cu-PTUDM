import { Prisma } from "@prisma/client";
import CodeSubmissionRepository from "../repositories/codeSubmission.repository";
import {
  ICodeSubmissionRequest,
  ICodeSubmissionResponse,
} from "../types/customRequest";

class CodeSubmissionService {
  private readonly codeSubmissionRepository: CodeSubmissionRepository;
  constructor(codeSubmissionRepository: CodeSubmissionRepository) {
    this.codeSubmissionRepository = codeSubmissionRepository;
  }

  async getAllCodeSubmission() {
    return await this.codeSubmissionRepository.getAll();
  }

  async createCodeSubmission(data: ICodeSubmissionRequest) {
    return await this.codeSubmissionRepository.create({
      source_code: data.source_code,
      language_id: data.language_id,
      user: { connect: { userId: data.userId } },
      testCases: { connect: { testCaseId: data.testCaseId } },
    });
  }

  async updateCodeSubmission(
    id: string,
    dataSubmission: Prisma.CodeSubmissionUpdateInput
  ) {
    const recordSubmission = await this.codeSubmissionRepository.getById(id);
    if (!recordSubmission) {
      throw new Error("Người dùng chưa nộp bài thực hành");
    }

    return await this.codeSubmissionRepository.update(id, dataSubmission);
  }
}
export default CodeSubmissionService;
