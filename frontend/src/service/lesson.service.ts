import { type Lesson } from "../types/database.types";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const lessonService = {
  getAllLessons: async (): Promise<Lesson[]> => {
    try {
      const res = await fetch(`${API_URL}/lessons`, {
        method: "GET",
        headers: getAuthHeaders(),
        body: null,
      });
      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy tất cả bài học.");
      }

      return data.data || (data as Lesson[]);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      throw error;
    }
  },

  getLessonByChapterId: async (chapterId: string): Promise<Lesson[]> => {
    try {
      if (!chapterId) {
        console.warn("LessonList: missing chapterId, skipping fetchLessons");
        return [];
      }

      // TẠM THỜI: Gọi API lấy tất cả lesson và filter client-side
      // Do backend chưa có endpoint /lessons/chapter/:chapterId
      const res = await fetch(`${API_URL}/lessons`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy danh sách bài học.");
      }

      const allLessons = data.data || (data as Lesson[]);

      // Filter lessons by chapterId
      if (Array.isArray(allLessons)) {
        return allLessons.filter(
          (lesson: Lesson) => lesson.chapterId === chapterId,
        );
      }

      return [];
    } catch (error) {
      console.error("Error fetching lessons by chapter ID:", error);
      throw error;
    }
  },

  createLesson: async (lessonData: Record<string, unknown>) => {
    try {
      const token = localStorage.getItem("token");

      console.log("--- DEBUG LESSON DATA ---");
      console.log(JSON.stringify(lessonData, null, 2));
      console.log("-----------------------");

      const res = await fetch(`${API_URL}/lessons/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(lessonData),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể thêm bài học.");
      }

      return data.data || data;
    } catch (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  },

  updateLesson: async (
    lessonId: string,
    lessonData: Record<string, unknown>,
  ) => {
    try {
      const token = localStorage.getItem("token");

      console.log("--- DEBUG UPDATE LESSON DATA ---");
      console.log(JSON.stringify(lessonData, null, 2));
      console.log("-----------------------");

      const res = await fetch(`${API_URL}/lessons/update/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(lessonData),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể cập nhật bài học.");
      }

      return data.data || data;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error;
    }
  },

  deleteLesson: async (lessonId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/lessons/delete/${lessonId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể xóa bài học.");
      }

      return data.data || data;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  },

  // Delegate to testCaseService to avoid circular dependency
  getTestCaseByLessonId: async (lessonId: string) => {
    try {
      // Dynamically import to avoid circular dependency
      const { testCaseService } = await import("./testCase.service");
      return await testCaseService.getTestCaseByLessonId(lessonId);
    } catch (error) {
      console.error("Error fetching test cases for lesson:", error);
      throw error;
    }
  },
};
