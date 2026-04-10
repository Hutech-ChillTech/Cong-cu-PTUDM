import CourseTrackingRepository from "../repositories/courseTracking.repository";
import createHttpError from "http-errors";

class CourseTrackingService {
  private readonly trackingRepository: CourseTrackingRepository;

  constructor(trackingRepository: CourseTrackingRepository) {
    this.trackingRepository = trackingRepository;
  }

  /**
   * Bắt đầu tracking course
   * - Nếu firstAccessAt = NULL → Set firstAccessAt = NOW()
   * - Nếu firstAccessAt != NULL → Chỉ update isCurrentlyActive = true
   */
  async startTracking(userId: string, courseId: string) {
    try {
      const result = await this.trackingRepository.startTracking(
        userId,
        courseId
      );

      if (!result) {
        throw createHttpError(
          404,
          "Không tìm thấy enrollment cho khóa học này"
        );
      }

      return {
        enrollmentId: result.enrollmentId,
        courseId: result.courseId,
        courseName: result.course.courseName,
        firstAccessAt: result.firstAccessAt,
        lastAccessAt: result.lastAccessAt,
        totalCompletionTime: result.totalCompletionTime,
        isCurrentlyActive: result.isCurrentlyActive,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Heartbeat - Gửi mỗi 30 phút
   * - Tính thời gian từ lastAccessAt đến NOW()
   * - Cộng vào totalCompletionTime nếu isCurrentlyActive = true
   * - Update lastAccessAt = NOW()
   */
  async updateHeartbeat(userId: string, courseId: string) {
    try {
      const result = await this.trackingRepository.updateHeartbeat(
        userId,
        courseId
      );

      if (!result) {
        throw createHttpError(
          400,
          "Không thể update heartbeat. User có thể chưa active hoặc chưa đăng ký khóa học."
        );
      }

      return {
        enrollmentId: result.enrollmentId,
        totalCompletionTime: result.totalCompletionTime,
        lastAccessAt: result.lastAccessAt,
        isCurrentlyActive: result.isCurrentlyActive,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Pause tracking
   * - Tính thời gian từ lastAccessAt đến NOW() → cộng vào totalCompletionTime
   * - Set isCurrentlyActive = false
   */
  async pauseTracking(userId: string, courseId: string) {
    try {
      const result = await this.trackingRepository.pauseTracking(
        userId,
        courseId
      );

      if (!result) {
        throw createHttpError(
          404,
          "Không tìm thấy enrollment cho khóa học này"
        );
      }

      return {
        enrollmentId: result.enrollmentId,
        totalCompletionTime: result.totalCompletionTime,
        lastAccessAt: result.lastAccessAt,
        isCurrentlyActive: result.isCurrentlyActive,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thời gian hoàn thành
   */
  async getCompletionTime(userId: string, courseId: string) {
    try {
      const result = await this.trackingRepository.getCompletionTime(
        userId,
        courseId
      );

      if (!result) {
        throw createHttpError(
          404,
          "Không tìm thấy enrollment cho khóa học này"
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy tất cả completion times của user
   */
  async getAllCompletionTimes(userId: string) {
    try {
      return await this.trackingRepository.getAllCompletionTimes(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Auto-complete course khi progress = 100%
   * (Được gọi từ LessonProgressService)
   */
  async autoCompleteCourse(userId: string, courseId: string) {
    try {
      const result = await this.trackingRepository.completeCourse(
        userId,
        courseId
      );

      if (!result) {
        return null; // Đã hoàn thành rồi hoặc không tìm thấy
      }

      return {
        enrollmentId: result.enrollmentId,
        completedAt: result.completedAt,
        totalCompletionTime: result.totalCompletionTime,
        firstAccessAt: result.firstAccessAt,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default CourseTrackingService;
