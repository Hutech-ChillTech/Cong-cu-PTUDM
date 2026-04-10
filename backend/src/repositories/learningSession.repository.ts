import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

interface CreateSessionData {
  userId: string;
  courseId: string;
  lessonId?: string;
}

interface ActivityLogData {
  sessionId: string;
  userId: string;
  activityType:
    | "video_start"
    | "video_pause"
    | "video_complete"
    | "interaction"
    | "idle_warning"
    | "idle_timeout";
  metadata?: any;
}

export class LearningSessionRepository extends BaseRepository<
  "learningSession",
  PrismaClient["learningSession"],
  any,
  any
> {
  private activityLog: PrismaClient["activityLog"];

  constructor(prisma: PrismaClient) {
    super(prisma, "learningSession", "sessionId");
    this.activityLog = prisma.activityLog;
  }

  /**
   * Tạo session mới
   */
  async createSession(data: CreateSessionData) {
    return this.prisma.learningSession.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        lessonId: data.lessonId,
        startTime: new Date(),
        isActive: true,
        lastActivityAt: new Date(),
        totalActiveTime: 0,
        totalPausedTime: 0,
        completedVideos: 0,
      },
    });
  }

  /**
   * Tìm session đang active của user cho lesson cụ thể
   */
  async findActiveSession(userId: string, lessonId: string) {
    return this.prisma.learningSession.findFirst({
      where: {
        userId,
        lessonId,
        isActive: true,
        endTime: null,
      },
    });
  }

  /**
   * Tìm session theo ID
   */
  async findSessionById(sessionId: string) {
    return this.prisma.learningSession.findUnique({
      where: { sessionId },
    });
  }

  /**
   * Pause session - ghi lại thời gian pause
   */
  async pauseSession(sessionId: string) {
    const session = await this.findSessionById(sessionId);
    if (!session) {
      throw new Error("Session không tồn tại");
    }

    if (!session.isActive) {
      throw new Error("Session đã được pause trước đó");
    }

    // Tính thời gian active từ lastActivityAt đến hiện tại
    const now = new Date();
    const activeSeconds = Math.floor(
      (now.getTime() - session.lastActivityAt.getTime()) / 1000
    );

    return this.prisma.learningSession.update({
      where: { sessionId },
      data: {
        isActive: false,
        lastActivityAt: now,
        totalActiveTime: session.totalActiveTime + activeSeconds,
      },
    });
  }

  /**
   * Resume session - tiếp tục đếm thời gian
   */
  async resumeSession(sessionId: string) {
    const session = await this.findSessionById(sessionId);
    if (!session) {
      throw new Error("Session không tồn tại");
    }

    if (session.isActive) {
      throw new Error("Session đang active rồi");
    }

    // Tính thời gian pause từ lastActivityAt đến hiện tại
    const now = new Date();
    const pausedSeconds = Math.floor(
      (now.getTime() - session.lastActivityAt.getTime()) / 1000
    );

    return this.prisma.learningSession.update({
      where: { sessionId },
      data: {
        isActive: true,
        lastActivityAt: now,
        totalPausedTime: session.totalPausedTime + pausedSeconds,
      },
    });
  }

  /**
   * End session - kết thúc session và tính tổng thời gian
   */
  async endSession(sessionId: string) {
    const session = await this.findSessionById(sessionId);
    if (!session) {
      throw new Error("Session không tồn tại");
    }

    const now = new Date();
    let finalActiveTime = session.totalActiveTime;

    // Nếu session đang active, cộng thêm thời gian từ lastActivityAt đến hiện tại
    if (session.isActive) {
      const additionalSeconds = Math.floor(
        (now.getTime() - session.lastActivityAt.getTime()) / 1000
      );
      finalActiveTime += additionalSeconds;
    }

    return this.prisma.learningSession.update({
      where: { sessionId },
      data: {
        isActive: false,
        endTime: now,
        lastActivityAt: now,
        totalActiveTime: finalActiveTime,
      },
    });
  }

  /**
   * Update heartbeat - client gửi ping định kỳ để cập nhật lastActivityAt
   */
  async updateHeartbeat(sessionId: string) {
    const session = await this.findSessionById(sessionId);
    if (!session) {
      throw new Error("Session không tồn tại");
    }

    if (!session.isActive) {
      throw new Error("Session không active, không thể update heartbeat");
    }

    const now = new Date();
    // Tính thời gian active từ lastActivityAt đến hiện tại
    const activeSeconds = Math.floor(
      (now.getTime() - session.lastActivityAt.getTime()) / 1000
    );

    return this.prisma.learningSession.update({
      where: { sessionId },
      data: {
        lastActivityAt: now,
        totalActiveTime: session.totalActiveTime + activeSeconds,
      },
    });
  }

  /**
   * Track video progress - lưu tiến độ xem video
   */
  async trackVideoProgress(
    sessionId: string,
    lessonId: string,
    watchedSeconds: number,
    isCompleted: boolean
  ) {
    const session = await this.findSessionById(sessionId);
    if (!session) {
      throw new Error("Session không tồn tại");
    }

    const videoProgress =
      (session.videoProgress as Record<string, number>) || {};
    videoProgress[lessonId] = watchedSeconds;

    const updateData: any = {
      videoProgress,
      lastActivityAt: new Date(),
    };

    if (isCompleted) {
      updateData.completedVideos = session.completedVideos + 1;
    }

    return this.prisma.learningSession.update({
      where: { sessionId },
      data: updateData,
    });
  }

  /**
   * Lấy lịch sử session của user
   */
  async getUserSessions(
    userId: string,
    options?: {
      courseId?: string;
      lessonId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: Prisma.LearningSessionWhereInput = { userId };
    if (options?.courseId) where.courseId = options.courseId;
    if (options?.lessonId) where.lessonId = options.lessonId;

    const [sessions, total] = await Promise.all([
      this.prisma.learningSession.findMany({
        where,
        orderBy: { startTime: "desc" },
        take: options?.limit || 10,
        skip: options?.offset || 0,
      }),
      this.prisma.learningSession.count({ where }),
    ]);

    return { sessions, total };
  }

  /**
   * Lấy thống kê session
   */
  async getSessionStats(userId: string, courseId: string) {
    const result = await this.prisma.learningSession.aggregate({
      where: { userId, courseId },
      _sum: {
        totalActiveTime: true,
      },
    });

    return result._sum?.totalActiveTime || 0; // seconds
  }

  /**
   * Log activity trong session
   */
  async createActivityLog(data: ActivityLogData) {
    return this.activityLog.create({
      data: {
        sessionId: data.sessionId,
        userId: data.userId,
        activityType: data.activityType,
        metadata: data.metadata || {},
        timestamp: new Date(),
      },
    });
  }

  /**
   * Lấy lịch sử activities của session
   */
  async getActivities(sessionId: string, limit = 50) {
    return this.activityLog.findMany({
      where: { sessionId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  /**
   * Auto-end các session đã quá lâu không hoạt động (>30 phút)
   */
  async autoEndInactiveSessions() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const inactiveSessions = await this.prisma.learningSession.findMany({
      where: {
        isActive: true,
        lastActivityAt: {
          lt: thirtyMinutesAgo,
        },
      },
    });

    const endPromises = inactiveSessions.map((session) =>
      this.endSession(session.sessionId)
    );

    return Promise.all(endPromises);
  }
}
