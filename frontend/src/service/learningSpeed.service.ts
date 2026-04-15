const API_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface CourseRecommendation {
  courseId: string;
  courseName: string;
  level: string;
  coursePrice: number;
  avatarURL: string;
  courseDescription: string;
}

interface LearningSpeedResult {
  speedScore: number;
  learningSpeed: string;
  averageCompletionTime: number;
  recommendedLevel: string;
}

interface RecommendationResponse {
  courses?: CourseRecommendation[];
  actualHours?: number;
  estimatedHours?: number;
  learningSpeed?: string;
  reason?: string;
  speedResult?: LearningSpeedResult;
  recommendations?: {
    currentLevel: string;
    recommendedLevel: string;
    courses: CourseRecommendation[];
  };
}

export const learningSpeedService = {
  // Tính Learning Speed + Gợi ý khi hoàn thành khóa học
  onCourseCompleted: async (
    userId: string,
    courseId: string,
  ): Promise<RecommendationResponse> => {
    try {
      const res = await fetch(`${API_URL}/learning-speed/on-course-completed`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, courseId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy gợi ý khóa học");
      }

      return data.data || data;
    } catch (error) {
      console.error("Error getting course recommendations:", error);
      throw error;
    }
  },

  // Chỉ lấy gợi ý khóa học
  getRecommendations: async (userId: string, completedCourseId: string) => {
    try {
      const res = await fetch(`${API_URL}/learning-speed/recommend`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, completedCourseId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Không thể lấy gợi ý khóa học");
      }

      return data.data || data;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  },
};
