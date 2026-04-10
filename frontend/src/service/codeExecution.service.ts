// Service for running code using Judge0 or backend API
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Interface for code submission request
export interface CodeSubmissionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  testCaseId?: string;
}

// Interface for code submission response
export interface CodeSubmissionResponse {
  submissionId?: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
  token?: string;
}

export const codeExecutionService = {
  /**
   * Submit code for execution
   * @param payload Code submission data
   * @returns Execution result
   */
  runCode: async (
    payload: CodeSubmissionRequest,
  ): Promise<CodeSubmissionResponse> => {
    try {
      const res = await fetch(`${API_URL}/testcode/run`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized - Vui lòng đăng nhập");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể chạy code.");
      }

      return data.data || data;
    } catch (error) {
      console.error("Error running code:", error);
      throw error;
    }
  },

  /**
   * Get submission status (for async execution)
   * @param token Submission token
   * @returns Submission status and result
   */
  getSubmissionStatus: async (
    token: string,
  ): Promise<CodeSubmissionResponse> => {
    try {
      const res = await fetch(`${API_URL}/testcode/status/${token}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(
          data?.message || "Không thể lấy trạng thái submission.",
        );
      }

      return data.data || data;
    } catch (error) {
      console.error("Error getting submission status:", error);
      throw error;
    }
  },
};

// Language IDs for Judge0
export const LANGUAGE_IDS = {
  JAVASCRIPT: 63,
  PYTHON: 71,
  JAVA: 62,
  CPP: 54,
  C: 50,
  CSHARP: 51,
  PHP: 68,
  RUBY: 72,
  GO: 60,
  RUST: 73,
  TYPESCRIPT: 74,
  KOTLIN: 78,
  SWIFT: 83,
} as const;

// Helper to get language name from ID
export const getLanguageName = (languageId: number): string => {
  const entry = Object.entries(LANGUAGE_IDS).find(
    ([, id]) => id === languageId,
  );
  return entry ? entry[0] : "Unknown";
};
