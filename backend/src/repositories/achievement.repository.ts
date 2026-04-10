import { Prisma, PrismaClient as PrismaClientType } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class AchievementRepository extends BaseRepository<
  "achievement",
  PrismaClientType["achievement"],
  any,
  any
> {
  constructor(prisma: PrismaClientType, primaryKey: string) {
    super(prisma, "achievement", primaryKey);
  }

  /**
   * Lấy tất cả achievements đang active
   */
  async getAllActiveAchievements() {
    return await this.prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ rarity: "desc" }, { xpReward: "desc" }],
    });
  }

  /**
   * Lấy achievements theo category
   */
  async getAchievementsByCategory(category: string) {
    return await this.prisma.achievement.findMany({
      where: { category, isActive: true },
      orderBy: { xpReward: "desc" },
    });
  }

  /**
   * Unlock achievement cho user
   */
  async unlockAchievement(userId: string, achievementId: string) {
    return await this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        progress: 100,
      },
      include: {
        achievement: true,
      },
    });
  }

  /**
   * Kiểm tra user đã unlock achievement chưa
   */
  async hasUnlockedAchievement(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    const count = await this.prisma.userAchievement.count({
      where: { userId, achievementId },
    });
    return count > 0;
  }

  /**
   * Lấy tất cả achievements của user
   */
  async getUserAchievements(userId: string) {
    return await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: "desc" },
    });
  }

  /**
   * Lấy achievement progress của user
   */
  async getAchievementProgress(userId: string, achievementId: string) {
    return await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId },
      },
      include: {
        achievement: true,
      },
    });
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ) {
    return await this.prisma.userAchievement.upsert({
      where: {
        userId_achievementId: { userId, achievementId },
      },
      update: { progress },
      create: {
        userId,
        achievementId,
        progress,
      },
      include: {
        achievement: true,
      },
    });
  }

  /**
   * Đếm số achievements đã unlock
   */
  async countUnlockedAchievements(userId: string): Promise<number> {
    return await this.prisma.userAchievement.count({
      where: { userId, progress: 100 },
    });
  }

  /**
   * Lấy achievements theo rarity
   */
  async getAchievementsByRarity(rarity: string) {
    return await this.prisma.achievement.findMany({
      where: { rarity, isActive: true },
      orderBy: { xpReward: "desc" },
    });
  }
}

export default AchievementRepository;
