import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface CourseTrackingInfo {
  enrollmentId: string;
  courseId: string;
  courseName: string;
  firstAccessAt: string | null;
  lastAccessAt: string | null;
  completedAt: string | null;
  totalCompletionTime: number;
  totalHours: number;
  totalDays: number;
  isCompleted: boolean;
  isCurrentlyActive: boolean;
}

export interface AllCoursesTrackingInfo extends CourseTrackingInfo {
  courseAvatar: string;
  estimatedDuration: number;
  enrolledAt: string;
}

export interface StartTrackingResponse {
  enrollmentId: string;
  courseId: string;
  courseName: string;
  firstAccessAt: string;
  lastAccessAt: string;
  totalCompletionTime: number;
  isCurrentlyActive: boolean;
}

export interface HeartbeatResponse {
  enrollmentId: string;
  totalCompletionTime: number;
  lastAccessAt: string;
  isCurrentlyActive: boolean;
}

export interface PauseTrackingResponse {
  enrollmentId: string;
  totalCompletionTime: number;
  lastAccessAt: string;
  isCurrentlyActive: boolean;
}

class CourseTrackingService {
  private getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Bắt đầu tracking course
   * Call khi user vào course page lần đầu hoặc quay lại
   */
  async startTracking(courseId: string): Promise<StartTrackingResponse> {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/start-tracking`,
      {},
      {
        headers: this.getAuthHeader(),
      }
    );
    return response.data.data;
  }

  /**
   * Gửi heartbeat để update thời gian học
   * Call mỗi 15 phút (900000ms)
   */
  async sendHeartbeat(courseId: string): Promise<HeartbeatResponse> {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/heartbeat`,
      {},
      {
        headers: this.getAuthHeader(),
      }
    );
    return response.data.data;
  }

  /**
   * Pause tracking khi user tắt tab hoặc inactive
   * Call khi user chuyển tab > 2 phút hoặc unmount component
   */
  async pauseTracking(courseId: string): Promise<PauseTrackingResponse> {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/pause-tracking`,
      {},
      {
        headers: this.getAuthHeader(),
      }
    );
    return response.data.data;
  }

  /**
   * Lấy thông tin completion time của 1 course
   */
  async getCompletionTime(courseId: string): Promise<CourseTrackingInfo> {
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/completion-time`,
      {
        headers: this.getAuthHeader(),
      }
    );
    return response.data.data;
  }

  /**
   * Lấy thông tin completion time của tất cả courses
   */
  async getAllCompletionTimes(): Promise<AllCoursesTrackingInfo[]> {
    const response = await axios.get(`${API_URL}/courses/completion-times`, {
      headers: this.getAuthHeader(),
    });
    return response.data.data;
  }
}

export const courseTrackingService = new CourseTrackingService();
