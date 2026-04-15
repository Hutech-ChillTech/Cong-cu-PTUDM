import { type TestCase } from "../types/database.types";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Interface cho payload
export interface CreateTestCasePayload {
    lessonId: string;          // Bắt buộc: Để biết test case này của bài học nào
    description?: string;      // Optional (?): Mô tả test case
    input?: string;            // Optional: Dữ liệu đầu vào
    expectedOutput?: string;   // Optional: Kết quả mong đợi
    testCodes?: string;        // Optional: Code để test
}

export const testCaseService = {

    getAllTestCases: async (): Promise<TestCase[]> => {
        try {
            const res = await fetch(`${API_URL}/test-cases`, {
                method: "GET",
                headers: getAuthHeaders(),
            });
            const data = await res.json();

            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy tất cả test case.");
            }
            return data.data || data as TestCase[];
        } catch (error) {
            console.error("Error fetching test cases:", error);
            throw error;
        }
    },

    getTestCaseById: async (testCaseId: string): Promise<TestCase> => {
        try {
            const res = await fetch(`${API_URL}/test-cases/${testCaseId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });
            const data = await res.json();

            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy test case.");
            }
            return data.data || data as TestCase;
        } catch (error) {
            console.error("Error fetching test case by ID:", error);
            throw error;
        }
    },

    getTestCaseByLessonId: async (lessonId: string): Promise<TestCase[]> => {
        try {
            const res = await fetch(`${API_URL}/test-cases/lesson/${lessonId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });
            const data = await res.json();

            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy test case theo lesson.");
            }
            return data.data || data as TestCase[];
        } catch (error) {
            console.error("Error fetching test cases by lesson ID:", error);
            throw error;
        }
    },

    createTestCase: async (payload: CreateTestCasePayload) => {
        try {
            const res = await fetch(`${API_URL}/test-cases`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể thêm testcase.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error uploading testcase:", error);
            throw error;
        }
    },

    updateTestCase: async (testCaseId: string, payload: Partial<CreateTestCasePayload>) => {
        try {
            const res = await fetch(`${API_URL}/test-cases/${testCaseId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể cập nhật testcase.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error updating testcase:", error);
            throw error;
        }
    },

    deleteTestCase: async (testCaseId: string) => {
        try {
            const res = await fetch(`${API_URL}/test-cases/${testCaseId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await res.json();

            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể xóa testcase.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error deleting testcase:", error);
            throw error;
        }
    }
}