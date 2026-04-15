import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface LessonProgress {
  lessonId: string;
  lessonName?: string;
  isCompleted: boolean;
  lastAccessAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LastAccessedLesson {
  lessonId: string;
  lessonName: string;
  chapterName: string;
  lastAccessAt: string;
}

export interface CompletedLesson {
  lessonId: string;
  lessonName: string;
  chapterId: string;
  completedAt: string;
}

export interface CourseProgress {
  courseId: string;
  enrollmentId: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  lastAccessedLesson: LastAccessedLesson | null;
  completedLessonsList: CompletedLesson[];
}

export interface AllCourseProgress {
  courseId: string;
  courseName: string;
  courseAvatar: string;
  enrollmentId: string;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  lastAccessedLesson: LastAccessedLesson | null;
  completedLessonsList: CompletedLesson[];
}

export interface CompleteLessonResponse {
  progress: {
    lessonId: string;
    isCompleted: boolean;
    completedAt: string;
  };
  courseProgress: number;
  completedLessons: number;
  totalLessons: number;
  isLastLesson?: boolean;
  courseCompleted?: boolean;
  xpReward?: {
    xpAwarded: number;
    description?: string;
    leveledUp?: boolean;
    currentLevel?: string;
    currentXP?: number;
    nextLevelXP?: number;
    achievementUnlocked?: {
      name: string;
      icon: string;
      xpReward: number;
    };
  };
  courseCompletionInfo?: {
    completedAt: string;
    totalCompletionTime: number;
    totalHours: number;
  };
}

class ProgressService {
  // Đánh dấu lesson hoàn thành
  async completeLesson(lessonId: string): Promise<CompleteLessonResponse> {
    const token = localStorage.getItem("token");
    const { data } = await axios.post(
      `${API_URL}/lessons/${lessonId}/complete`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.data;
  }

  // Cập nhật lastAccessAt
  async accessLesson(lessonId: string) {
    const token = localStorage.getItem("token");
    const { data } = await axios.post(
      `${API_URL}/lessons/${lessonId}/access`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.data;
  }

  // Lấy progress khóa học
  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(
      `${API_URL}/courses/${courseId}/progress`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.data;
  }

  // Lấy progress của 1 lesson
  async getLessonProgress(lessonId: string): Promise<LessonProgress> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(
      `${API_URL}/lessons/${lessonId}/progress`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.data;
  }

  // Lấy tất cả progress
  async getAllMyProgress(): Promise<AllCourseProgress[]> {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${API_URL}/progress/my-progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  }

  // Lấy lessons chưa hoàn thành
  async getIncompleteLessons(courseId: string) {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(
      `${API_URL}/courses/${courseId}/incomplete-lessons`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.data;
  }

  // Reset progress (Admin only)
  async resetLessonProgress(lessonId: string, userId: string) {
    const token = localStorage.getItem("token");
    const { data } = await axios.delete(
      `${API_URL}/lessons/${lessonId}/progress`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId },
      }
    );
    return data.data;
  }
}

export const progressService = new ProgressService();
