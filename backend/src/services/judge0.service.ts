import axios from "axios";
import prisma from "../configs/prismaClient";
import {
  ICodeSubmissionRequest,
  ICodeSubmissionResponse,
} from "../types/customRequest";
import CodeSubmissionRepository from "../repositories/codeSubmission.repository";
import CodeSubmissionService from "./codeSubmission.service";

const codeSubmissionRepository = new CodeSubmissionRepository(
  prisma,
  "submissionId"
);
const codeSubmissionService = new CodeSubmissionService(
  codeSubmissionRepository
);

const API_HEADERS = {
  "content-type": "application/json",
  "X-RapidAPI-Key": process.env.RAPID_API_KEY,
  "X-RapidAPI-Host": process.env.RAPID_API_HOST,
};

/**
 * Gửi code đến Judge0 và lấy kết quả
 * @param source_code - Mã nguồn (người dùng gửi)
 * @param language_id - ID ngôn ngữ (ví dụ: JavaScript là 63, Python là 71)
 * @param stdin - Input cho test case
 * @param expected_output - Kết quả mong đợi
 */

export const sendToJudge0 = async (data: ICodeSubmissionRequest) => {
  try {
    const created = await codeSubmissionService.createCodeSubmission(data);

    const submission = await axios.post(
      `${process.env.JUDGE0_API_URL}?base64_encoded=false&wait=true`,
      {
        source_code: data.source_code,
        language_id: data.language_id,
        expectedOuput: data.expected_output,
      },
      { headers: API_HEADERS }
    );

    if (!created.submissionId) {
      throw new Error("Submission chưa có id, không thể update");
    }

    await codeSubmissionService.updateCodeSubmission(
      created.submissionId,
      submission.data
    );

    return submission.data;
  } catch (error: any) {
    console.error("Lỗi gửi Judge0:", error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(
        `Không thể gửi lên Judge0: ${JSON.stringify(error.response.data)}`
      );
    }
    throw new Error(`Không thể gửi lên Judge0: ${error.message}`);
  }
};
