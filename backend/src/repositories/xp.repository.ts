import { Prisma, PrismaClient as PrismaClientType } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class XPRepository extends BaseRepository<
  "xPTransaction",
  PrismaClientType["xPTransaction"],
  any,
  any
> {
  constructor(prisma: PrismaClientType, primaryKey: string) {
    super(prisma, "xPTransaction", primaryKey);
  }

  /**
   * Thêm XP cho user
   */
  async addXP(data: {
    userId: string;
    amount: number;
    source: string;
    description?: string;
    courseId?: string;
    lessonId?: string;
    achievementId?: string;
    metadata?: any;
  }) {
    return await this.prisma.xPTransaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        source: data.source,
        description: data.description,
        courseId: data.courseId,
        lessonId: data.lessonId,
        achievementId: data.achievementId,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Lấy tổng XP của user
   */
  async getTotalXP(userId: string): Promise<number> {
    const result = await this.prisma.xPTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  /**
   * Lấy lịch sử XP của user
   */
  async getXPHistory(userId: string, limit: number = 50) {
    return await this.prisma.xPTransaction.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
      take: limit,
    });
  }

  /**
   * Lấy XP từ một nguồn cụ thể
   */
  async getXPBySource(userId: string, source: string) {
    const result = await this.prisma.xPTransaction.aggregate({
      where: { userId, source },
      _sum: { amount: true },
      _count: true,
    });
    return {
      totalXP: result._sum.amount || 0,
      count: result._count,
    };
  }

  /**
   * Kiểm tra xem user đã nhận XP từ lesson/course chưa
   */
  async hasReceivedXP(
    userId: string,
    source: string,
    referenceId: string,
    referenceType: "courseId" | "lessonId"
  ): Promise<boolean> {
    const count = await this.prisma.xPTransaction.count({
      where: {
        userId,
        source,
        [referenceType]: referenceId,
      },
    });
    return count > 0;
  }

  /**
   * Lấy XP leaderboard
   */
  async getLeaderboard(limit: number = 10) {
    const leaderboard = await this.prisma.xPTransaction.groupBy({
      by: ["userId"],
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: limit,
    });

    // Lấy thông tin user
    const userIds = leaderboard.map((item) => item.userId);
    const users = await this.prisma.user.findMany({
      where: { userId: { in: userIds } },
      select: {
        userId: true,
        userName: true,
        email: true,
        avatarURL: true,
        level: true,
        experiencePoints: true,
      },
    });

    // Merge data
    return leaderboard.map((item, index) => {
      const user = users.find((u) => u.userId === item.userId);
      return {
        rank: index + 1,
        userId: item.userId,
        userName: user?.userName || "Unknown",
        email: user?.email,
        avatarURL: user?.avatarURL,
        level: user?.level,
        totalXP: item._sum.amount || 0,
      };
    });
  }

  /**
   * Thống kê XP theo ngày
   */
  async getXPStatsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.prisma.xPTransaction.findMany({
      where: {
        userId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { created_at: "asc" },
    });
  }

  /**
   * Tổng XP toàn hệ thống
   */
  async getTotalXPAllUsers() {
    const result = await this.prisma.xPTransaction.aggregate({ _sum: { amount: true } });
    return result._sum.amount || 0;
  }

  /**
   * Thống kê XP theo thời gian (groupBy day|month|year)
   */
  async getXPStatsByPeriod(start: Date, end: Date, groupBy: string) {
    // groupBy: "day" | "month" | "year"
    let format: string;
    if (groupBy === "month") format = "%Y-%m";
    else if (groupBy === "year") format = "%Y";
    else format = "%Y-%m-%d";
    return await this.prisma.$queryRawUnsafe(
      `SELECT DATE_FORMAT(created_at, '${format}') as period, SUM(amount) as totalXP FROM xPTransaction WHERE created_at BETWEEN ? AND ? GROUP BY period ORDER BY period ASC`,
      start,
      end
    );
  }

  /**
   * Thống kê XP theo khóa học
   */
  async getXPByCourse(courseId: string) {
    const result = await this.prisma.xPTransaction.aggregate({
      where: { courseId },
      _sum: { amount: true },
      _count: true,
    });
    return { courseId, totalXP: result._sum.amount || 0, count: result._count };
  }

  /**
   * Thống kê XP theo instructor
   */
  async getXPByInstructor(userId: string) {
    // Lấy tất cả khóa học của instructor (createdBy)
    const courses = await this.prisma.course.findMany({ where: { createdBy: userId }, select: { courseId: true } });
    const courseIds = courses.map((c) => c.courseId);
    const result = await this.prisma.xPTransaction.aggregate({
      where: { courseId: { in: courseIds } },
      _sum: { amount: true },
      _count: true,
    });
    return { instructorId: userId, totalXP: result._sum.amount || 0, count: result._count };
  }
}

export default XPRepository;
