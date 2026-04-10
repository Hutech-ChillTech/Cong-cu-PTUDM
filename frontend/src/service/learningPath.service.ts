const API_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const learningPathService = {
    // Lấy tất cả Learning Paths
    getAllLearningPaths: async (filters?: {
        level?: string;
        isPublished?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters?.level) queryParams.append("level", filters.level);
            if (filters?.isPublished !== undefined)
                queryParams.append("isPublished", String(filters.isPublished));
            if (filters?.search) queryParams.append("search", filters.search);
            if (filters?.page) queryParams.append("page", String(filters.page));
            if (filters?.limit) queryParams.append("limit", String(filters.limit));

            const res = await fetch(
                `${API_URL}/learning-paths?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy danh sách Learning Paths.");
            }
            return data.data;
        } catch (error) {
            console.error("Error fetching learning paths:", error);
            throw error;
        }
    },

    // Lấy chi tiết Learning Path theo ID
    getLearningPathById: async (learningPathId: string) => {
        try {
            const res = await fetch(`${API_URL}/learning-paths/${learningPathId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy chi tiết Learning Path.");
            }
            return data.data;
        } catch (error) {
            console.error("Error fetching learning path by ID:", error);
            throw error;
        }
    },

    // Lấy các khóa học trong Learning Path
    getCoursesInPath: async (learningPathId: string) => {
        try {
            const res = await fetch(
                `${API_URL}/learning-paths/${learningPathId}/courses`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy danh sách khóa học.");
            }
            return data.data;
        } catch (error) {
            console.error("Error fetching courses in path:", error);
            throw error;
        }
    },

    // Follow Learning Path
    followLearningPath: async (learningPathId: string) => {
        try {
            const res = await fetch(
                `${API_URL}/learning-paths/${learningPathId}/follow`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể follow Learning Path.");
            }
            return data.data;
        } catch (error) {
            console.error("Error following learning path:", error);
            throw error;
        }
    },

    // Unfollow Learning Path
    unfollowLearningPath: async (learningPathId: string) => {
        try {
            const res = await fetch(
                `${API_URL}/learning-paths/${learningPathId}/follow`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể unfollow Learning Path.");
            }
            return data.data;
        } catch (error) {
            console.error("Error unfollowing learning path:", error);
            throw error;
        }
    },

    // Lấy Learning Paths của user
    getMyLearningPaths: async () => {
        try {
            const res = await fetch(`${API_URL}/learning-paths/my/paths`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy Learning Paths của bạn.");
            }
            return data.data;
        } catch (error) {
            console.error("Error fetching my learning paths:", error);
            throw error;
        }
    },

    // Lấy Learning Paths phổ biến
    getPopularLearningPaths: async (limit: number = 10) => {
        try {
            const res = await fetch(
                `${API_URL}/learning-paths/popular?limit=${limit}`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy Learning Paths phổ biến.");
            }
            return data.data;
        } catch (error) {
            console.error("Error fetching popular learning paths:", error);
            throw error;
        }
    },

    // Gợi ý Learning Paths
    suggestLearningPaths: async (level?: string, limit: number = 5) => {
        try {
            const queryParams = new URLSearchParams();
            if (level) queryParams.append("level", level);
            queryParams.append("limit", String(limit));

            const res = await fetch(
                `${API_URL}/learning-paths/suggest?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể gợi ý Learning Paths.");
            }
            return data.data;
        } catch (error) {
            console.error("Error suggesting learning paths:", error);
            throw error;
        }
    },

    // Cập nhật progress
    updateProgress: async (
        learningPathId: string,
        completedCourseIds: string[]
    ) => {
        try {
            const res = await fetch(
                `${API_URL}/learning-paths/${learningPathId}/progress`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ completedCourseIds }),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể cập nhật progress.");
            }
            return data.data;
        } catch (error) {
            console.error("Error updating progress:", error);
            throw error;
        }
    },

    // Lấy thống kê Learning Path
    getLearningPathStats: async (learningPathId: string) => {
        try {
            const res = await fetch(
                `${API_URL}/learning-paths/${learningPathId}/stats`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy thống kê.");
            }
            return data.data;
        } catch (error) {
            console.error("Error fetching stats:", error);
            throw error;
        }
    },
};
