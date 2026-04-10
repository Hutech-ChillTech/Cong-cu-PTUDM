import {
  Prisma,
  PrismaClient as PrismaClientType,
  Level,
} from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class LevelRequirementRepository extends BaseRepository<
  "levelRequirement",
  PrismaClientType["levelRequirement"],
  any,
  any
> {
  constructor(prisma: PrismaClientType, primaryKey: string) {
    super(prisma, "levelRequirement", primaryKey);
  }

  /**
   * Lấy tất cả level requirements
   */
  async getAllLevelRequirements() {
    return await this.prisma.levelRequirement.findMany({
      orderBy: { minXP: "asc" },
    });
  }

  /**
   * Lấy level requirement theo level
   */
  async getLevelRequirement(level: Level) {
    return await this.prisma.levelRequirement.findUnique({
      where: { level },
    });
  }

  /**
   * Tính level dựa trên XP
   */
  async calculateLevelFromXP(xp: number) {
    const levelRequirements = await this.getAllLevelRequirements();

    // Tìm level phù hợp
    for (let i = levelRequirements.length - 1; i >= 0; i--) {
      const req = levelRequirements[i];
      if (xp >= req.minXP) {
        const nextLevel = levelRequirements[i + 1];
        return {
          currentLevel: req.level,
          currentLevelMinXP: req.minXP,
          currentLevelMaxXP: req.maxXP,
          nextLevel: nextLevel?.level || null,
          nextLevelMinXP: nextLevel?.minXP || null,
          currentLevelXP: nextLevel ? xp - req.minXP : xp - req.minXP,
          nextLevelXP: nextLevel ? nextLevel.minXP - req.minXP : 0,
          progress: nextLevel
            ? ((xp - req.minXP) / (nextLevel.minXP - req.minXP)) * 100
            : 100,
          title: req.title,
          perks: req.perks,
        };
      }
    }

    // Nếu XP < minXP của level đầu tiên, trả về Basic
    const firstLevel = levelRequirements[0];
    return {
      currentLevel: firstLevel.level,
      currentLevelMinXP: firstLevel.minXP,
      currentLevelMaxXP: firstLevel.maxXP,
      nextLevel: levelRequirements[1]?.level || null,
      nextLevelMinXP: levelRequirements[1]?.minXP || null,
      currentLevelXP: xp,
      nextLevelXP: levelRequirements[1]?.minXP || 0,
      progress: levelRequirements[1]
        ? (xp / levelRequirements[1].minXP) * 100
        : 0,
      title: firstLevel.title,
      perks: firstLevel.perks,
    };
  }

  /**
   * Seed level requirements mặc định
   */
  async seedDefaultLevels() {
    const defaultLevels = [
      {
        level: "Basic" as Level,
        minXP: 0,
        maxXP: 1000,
        title: "Beginner",
        perks: { discount: 0, badge: "/icon/begin.png", description: "Người mới bắt đầu" },
      },
      {
        level: "Intermediate" as Level,
        minXP: 1000,
        maxXP: 5000,
        title: "Intermediate",
        perks: { discount: 5, badge: "/icon/mid.png", description: "Học viên trung cấp - Giảm giá 5%" },
      },
      {
        level: "Advanced" as Level,
        minXP: 5000,
        maxXP: null,
        title: "Expert",
        perks: { discount: 10, badge: "/icon/high.png", description: "Chuyên gia - Giảm giá 10%" },
      },
    ];

    for (const levelData of defaultLevels) {
      await this.prisma.levelRequirement.upsert({
        where: { level: levelData.level },
        update: levelData,
        create: levelData,
      });
    }

    return defaultLevels;
  }
}

export default LevelRequirementRepository;
