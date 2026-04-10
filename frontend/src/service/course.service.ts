import { type Course } from "../types/database.types";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy tất cả khóa học.");
      }

      return data.data || (data as Course[]);
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  getCourseById: async (courseId: string): Promise<Course> => {
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy khóa học theo ID.");
      }
      return data.data || (data as Course);
    } catch (error) {
      console.error("Error fetching course by ID:", error);
      throw error;
    }
  },

  getCourseByIdContent: async (courseId: string): Promise<Course> => {
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/content`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy nội dung khóa học.");
      }
      return data.data || (data as Course);
    } catch (error) {
      console.error("Error fetching course content:", error);
      throw error;
    }
  },

  getPopularCourses: async (limit: number): Promise<Course[]> => {
    try {
      const res = await fetch(`${API_URL}/courses/popular?limit=${limit}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy khóa học nổi bật.");
      }
      return data.data || (data as Course[]);
    } catch (error) {
      console.error("Error fetching popular courses:", error);
      throw error;
    }
  },

  createCourse: async (data: Partial<Course>): Promise<Course> => {
    try {
      const res = await fetch(`${API_URL}/lessons`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(resData?.message || "Không thể tạo khóa học.");
      }
      return resData.data || (resData as Course);
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  // Lấy danh sách khóa học đã mua (cho trang Profile)
  getEnrolledCourses: async (
    skip: number = 0,
    take: number = 100,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> => {
    try {
      const res = await fetch(
        `${API_URL}/courses/enrolled?skip=${skip}&take=${take}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error(
          data?.message || "Không thể lấy danh sách khóa học đã mua.",
        );
      }
      return data.data || [];
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      throw error;
    }
  },
};
