// src/types/customRequest.ts
import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    roleId: string;
    roleName: string;
  };
}

export interface ICodeSubmissionRequest {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
  userId: string;
  testCaseId: string;
}

export interface ICodeSubmissionResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  token: string | null;
  status: {
    id: number;
    description: string;
  } | null;
}

// Sử dụng cho frontend
export interface ICodeSubmissionResult {
  submissionId: string;
  exerciseId?: string;
  userId?: string;

  sourceCode: string;
  languageId: number;

  judge0: ICodeSubmissionResponse;
  createdAt: string;
}
