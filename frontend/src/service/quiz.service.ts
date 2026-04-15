const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface CreateChapterQuizPayload {
    title: string;
    chapterId: string;
    description?: string;
}

interface UpdateChapterQuizPayload {
    title?: string;
    description?: string;
}

interface CreateQuestionPayload {
    chapterQuizId: string;
    questionText: string;
    questionType: string;
    required?: boolean;
}

interface UpdateQuestionPayload {
    questionText?: string;
    required?: boolean;
}

interface CreateOptionPayload {
    quizQuestionId: string;
    optionText: string;
    isCorrect?: boolean;
}

interface UpdateOptionPayload {
    optionText?: string;
    isCorrect?: boolean;
}

export const quizService = {
    // ============ QUIZ CRUD ============

    getAllQuizzes: async () => {
        try {
            const res = await fetch(`${API_URL}/quizzes`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy danh sách quiz.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            throw error;
        }
    },

    getQuizById: async (chapterQuizId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/${chapterQuizId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy quiz.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error fetching quiz:", error);
            throw error;
        }
    },

    getQuizzesByChapter: async (chapterId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/chapter/${chapterId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (res.status === 204) {
                return [];
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy danh sách quiz.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error fetching quizzes by chapter:", error);
            throw error;
        }
    },

    createQuiz: async (payload: CreateChapterQuizPayload) => {
        try {
            const res = await fetch(`${API_URL}/quizzes`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể tạo quiz.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error creating quiz:", error);
            throw error;
        }
    },

    updateQuiz: async (chapterQuizId: string, payload: UpdateChapterQuizPayload) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/${chapterQuizId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể cập nhật quiz.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error updating quiz:", error);
            throw error;
        }
    },

    deleteQuiz: async (chapterQuizId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/${chapterQuizId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể xóa quiz.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error deleting quiz:", error);
            throw error;
        }
    },

    // ============ QUESTIONS CRUD ============

    getQuestionsByQuiz: async (chapterQuizId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/${chapterQuizId}/questions`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (res.status === 204) {
                return [];
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy danh sách câu hỏi.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error fetching questions:", error);
            throw error;
        }
    },

    getQuestionById: async (quizQuestionId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/questions/${quizQuestionId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy câu hỏi.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error fetching question:", error);
            throw error;
        }
    },

    createQuestion: async (payload: CreateQuestionPayload) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/questions`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể tạo câu hỏi.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error creating question:", error);
            throw error;
        }
    },

    updateQuestion: async (quizQuestionId: string, payload: UpdateQuestionPayload) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/questions/${quizQuestionId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể cập nhật câu hỏi.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error updating question:", error);
            throw error;
        }
    },

    deleteQuestion: async (quizQuestionId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/questions/${quizQuestionId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể xóa câu hỏi.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error deleting question:", error);
            throw error;
        }
    },

    // ============ OPTIONS CRUD ============

    getOptionsByQuestion: async (quizQuestionId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/questions/${quizQuestionId}/options`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (res.status === 204) {
                return [];
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy danh sách đáp án.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error fetching options:", error);
            throw error;
        }
    },

    getOptionById: async (quizOptionId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/options/${quizOptionId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể lấy đáp án.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error fetching option:", error);
            throw error;
        }
    },

    createOption: async (payload: CreateOptionPayload) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/options`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể tạo đáp án.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error creating option:", error);
            throw error;
        }
    },

    updateOption: async (quizOptionId: string, payload: UpdateOptionPayload) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/options/${quizOptionId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể cập nhật đáp án.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error updating option:", error);
            throw error;
        }
    },

    deleteOption: async (quizOptionId: string) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/options/${quizOptionId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể xóa đáp án.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error deleting option:", error);
            throw error;
        }
    },

    // ============ QUIZ SUBMISSION ============
    
    submitQuiz: async (chapterQuizId: string, answers: { [questionId: string]: string }) => {
        try {
            // Get userId from localStorage
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("User not authenticated");
            }
            
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.userId;

            const res = await fetch(`${API_URL}/submissions/submit`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    userId,
                    chapterQuizId,
                    answers
                }),
            });

            const data = await res.json();
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (!res.ok) {
                throw new Error(data?.message || "Không thể nộp bài quiz.");
            }

            return data.data || data;
        } catch (error) {
            console.error("Error submitting quiz:", error);
            throw error;
        }
    },
};