import { PrismaClient } from "@prisma/client";
import { LearningSessionRepository } from "../repositories/learningSession.repository";

export class LearningSessionService {
  private learningSessionRepository: LearningSessionRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.learningSessionRepository = new LearningSessionRepository(prisma);
  }

  /**
   * Bắt đầu session học mới hoặc resume session cũ
   */
  async startOrResumeSession(
    userId: string,
    courseId: string,
    lessonId: string
  ) {
    const existingSession =
      await this.learningSessionRepository.findActiveSession(userId, lessonId);

    if (existingSession) {
      const updated = await this.learningSessionRepository.updateHeartbeat(
        existingSession.sessionId
      );

      await this.learningSessionRepository.createActivityLog({
        sessionId: existingSession.sessionId,
        userId,
        activityType: "interaction",
        metadata: { action: "resume_existing_session" },
      });

      return {
        session: updated,
        isNew: false,
        message: "Đã có session đang học, tiếp tục session này",
      };
    }

    const newSession = await this.learningSessionRepository.createSession({
      userId,
      courseId,
      lessonId,
    });

    await this.learningSessionRepository.createActivityLog({
      sessionId: newSession.sessionId,
      userId,
      activityType: "video_start",
      metadata: { courseId, lessonId },
    });

    return {
      session: newSession,
      isNew: true,
      message: "Đã tạo session học mới",
    };
  }

  /**
   * Pause session
   */
  async pauseSession(sessionId: string, userId: string) {
    const session = await this.learningSessionRepository.findSessionById(
      sessionId
    );

    if (!session) {
      throw new Error("Session không tồn tại");
    }

    if (session.userId !== userId) {
      throw new Error("Bạn không có quyền pause session này");
    }

    const paused = await this.learningSessionRepository.pauseSession(sessionId);

    await this.learningSessionRepository.createActivityLog({
      sessionId,
      userId,
      activityType: "video_pause",
      metadata: {
        totalActiveTime: paused.totalActiveTime,
        totalPausedTime: paused.totalPausedTime,
      },
    });

    return {
      session: paused,
      message: "Đã tạm dừng session",
    };
  }

  /**
   * Resume session
   */
  async resumeSession(sessionId: string, userId: string) {
    const session = await this.learningSessionRepository.findSessionById(
      sessionId
    );

    if (!session) {
      throw new Error("Session không tồn tại");
    }

    if (session.userId !== userId) {
      throw new Error("Bạn không có quyền resume session này");
    }

    const resumed = await this.learningSessionRepository.resumeSession(
      sessionId
    );

    await this.learningSessionRepository.createActivityLog({
      sessionId,
      userId,
      activityType: "interaction",
      metadata: { action: "resume_session" },
    });

    return {
      session: resumed,
      message: "Đã tiếp tục session",
    };
  }

  /**
   * End session
   */
  async endSession(sessionId: string, userId: string) {
    const session = await this.learningSessionRepository.findSessionById(
      sessionId
    );

    if (!session) {
      throw new Error("Session không tồn tại");
    }

    if (session.userId !== userId) {
      throw new Error("Bạn không có quyền end session này");
    }

    const ended = await this.learningSessionRepository.endSession(sessionId);

    await this.learningSessionRepository.createActivityLog({
      sessionId,
      userId,
      activityType: "video_complete",
      metadata: {
        totalActiveTime: ended.totalActiveTime,
        totalPausedTime: ended.totalPausedTime,
        duration: Math.floor(
          (ended.endTime!.getTime() - ended.startTime.getTime()) / 1000
        ),
      },
    });

    // Update learning speed
    await this.updateUserLearningSpeed(
      userId,
      session.courseId,
      ended.totalActiveTime
    );

    return {
      session: ended,
      statistics: {
        totalActiveTime: ended.totalActiveTime,
        totalPausedTime: ended.totalPausedTime,
        totalDuration: Math.floor(
          (ended.endTime!.getTime() - ended.startTime.getTime()) / 1000
        ),
        activePercentage:
          ended.totalActiveTime > 0
            ? (
                (ended.totalActiveTime /
                  (ended.totalActiveTime + ended.totalPausedTime)) *
                100
              ).toFixed(2)
            : "0.00",
      },
      message: "Đã kết thúc session",
    };
  }

  /**
   * Record activity
   */
  async recordActivity(
    sessionId: string,
    userId: string,
    activityType: string,
    metadata?: any
  ) {
    const session = await this.learningSessionRepository.findSessionById(
      sessionId
    );

    if (!session) {
      throw new Error("Session không tồn tại");
    }

    if (session.userId !== userId) {
      throw new Error("Bạn không có quyền ghi nhận activity này");
    }

    const activity = await this.learningSessionRepository.createActivityLog({
      sessionId,
      userId,
      activityType: activityType as any,
      metadata,
    });

    return {
      activity,
      message: "Đã ghi nhận hoạt động",
    };
  }

  /**
   * Get active session
   */
  async getActiveSession(userId: string, lessonId: string) {
    const session = await this.learningSessionRepository.findActiveSession(
      userId,
      lessonId
    );

    return {
      session: session || null,
      message: session
        ? "Tìm thấy session đang học"
        : "Không có session đang học",
    };
  }

  /**
   * Get session history
   */
  async getSessionHistory(
    userId: string,
    options?: {
      courseId?: string;
      lessonId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const result = await this.learningSessionRepository.getUserSessions(
      userId,
      options
    );

    return {
      sessions: result.sessions,
      total: result.total,
      limit: options?.limit || 10,
      offset: options?.offset || 0,
      message: `Tìm thấy ${result.sessions.length} session`,
    };
  }

  /**
   * Get session stats
   */
  async getSessionStats(userId: string, courseId: string) {
    const totalSeconds = await this.learningSessionRepository.getSessionStats(
      userId,
      courseId
    );

    return {
      totalActiveTime: totalSeconds,
      totalActiveHours: (totalSeconds / 3600).toFixed(2),
      totalActiveMinutes: Math.floor(totalSeconds / 60),
      message: "Đã tính toán thống kê",
    };
  }

  /**
   * Update user learning speed
   */
  private async updateUserLearningSpeed(
    userId: string,
    courseId: string,
    additionalSeconds: number
  ) {
    try {
      const learningSpeed = await this.prisma.userLearningSpeed.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      const additionalHours = additionalSeconds / 3600;

      if (learningSpeed) {
        await this.prisma.userLearningSpeed.update({
          where: { id: learningSpeed.id },
          data: {
            totalLearningTime:
              (learningSpeed.totalLearningTime || 0) + additionalHours,
            lastUpdated: new Date(),
          },
        });
      } else {
        await this.prisma.userLearningSpeed.create({
          data: {
            userId,
            courseId,
            totalLearningTime: additionalHours,
            completionRate: 0,
            lastUpdated: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error updating learning speed:", error);
    }
  }
}
