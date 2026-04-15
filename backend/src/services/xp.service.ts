import { PrismaClient } from "@prisma/client";
import XPRepository from "../repositories/xp.repository";
import AchievementRepository from "../repositories/achievement.repository";
import LevelRequirementRepository from "../repositories/levelRequirement.repository";
import UserRepository from "../repositories/user.repository";
import createHttpError from "http-errors";

const Prisma = new PrismaClient();

// XP Rewards Configuration
export const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  COURSE_COMPLETE: 100,
  QUIZ_PASS: 20,
  QUIZ_PERFECT: 50, // 100% điểm
  FIRST_LESSON: 25,
  FIRST_COURSE: 150,
  DAILY_LOGIN: 5,
  STREAK_3_DAYS: 15,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
  COMMENT_COURSE: 5,
  ACHIEVEMENT_UNLOCK: 0, // Sẽ lấy từ achievement.xpReward
};

// Achievement Requirements
export const ACHIEVEMENT_REQUIREMENTS = {
  FIRST_STEPS: { type: "complete_lessons", count: 1 },
  BEGINNER: { type: "complete_lessons", count: 5 },
  LESSON_MASTER: { type: "complete_lessons", count: 50 },
  COURSE_STARTER: { type: "complete_courses", count: 1 },
  COURSE_ENTHUSIAST: { type: "complete_courses", count: 5 },
  COURSE_MASTER: { type: "complete_courses", count: 10 },
  QUIZ_CHAMPION: { type: "pass_quizzes", count: 10 },
  PERFECT_SCORE: { type: "perfect_quizzes", count: 5 },
  SPEED_LEARNER: { type: "complete_course_fast", days: 7 },
};

class XPService {
  private xpRepository: XPRepository;
  private achievementRepository: AchievementRepository;
  private levelRequirementRepository: LevelRequirementRepository;
  private userRepository: UserRepository;

  constructor(
    xpRepository: XPRepository,
    achievementRepository: AchievementRepository,
    levelRequirementRepository: LevelRequirementRepository,
    userRepository: UserRepository
  ) {
    this.xpRepository = xpRepository;
    this.achievementRepository = achievementRepository;
    this.levelRequirementRepository = levelRequirementRepository;
    this.userRepository = userRepository;
  }

  /**
   * Thêm XP cho user và tự động nâng cấp level
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
    // Kiểm tra user tồn tại
    const user = await Prisma.user.findUnique({
      where: { userId: data.userId },
    });
    if (!user) {
      throw createHttpError(404, "Không tìm thấy người dùng");
    }

    // Tạo XP transaction
    const transaction = await this.xpRepository.addXP(data);

    // Tính tổng XP mới
    const totalXP = await this.xpRepository.getTotalXP(data.userId);

    // Tính level mới dựa trên XP
    const levelInfo =
      await this.levelRequirementRepository.calculateLevelFromXP(totalXP);

    // Update user level và XP
    await Prisma.user.update({
      where: { userId: data.userId },
      data: {
        experiencePoints: totalXP,
        level: levelInfo.currentLevel,
        currentLevelXP: levelInfo.currentLevelXP,
        nextLevelXP: levelInfo.nextLevelXP,
      },
    });

    // Kiểm tra và unlock achievements
    await this.checkAndUnlockAchievements(data.userId);

    return {
      transaction,
      totalXP,
      levelInfo,
      leveledUp: user.level !== levelInfo.currentLevel,
      previousLevel: user.level,
      currentLevel: levelInfo.currentLevel,
    };
  }

  /**
   * Thưởng XP khi hoàn thành lesson
   */
  async rewardLessonCompletion(userId: string, lessonId: string) {
    // Kiểm tra đã nhận XP chưa
    const hasReceived = await this.xpRepository.hasReceivedXP(
      userId,
      "lesson_complete",
      lessonId,
      "lessonId"
    );

    if (hasReceived) {
      return { message: "Đã nhận XP cho bài học này rồi", xpAwarded: 0 };
    }

    // Check xem có phải lesson đầu tiên không
    const lessonCount = await Prisma.userLessonProgress.count({
      where: { userId, isCompleted: true },
    });

    const isFirstLesson = lessonCount === 1;
    const xpAmount = isFirstLesson
      ? XP_REWARDS.FIRST_LESSON
      : XP_REWARDS.LESSON_COMPLETE;

    const result = await this.addXP({
      userId,
      amount: xpAmount,
      source: isFirstLesson ? "first_lesson" : "lesson_complete",
      description: isFirstLesson
        ? "Hoàn thành bài học đầu tiên! 🎉"
        : "Hoàn thành bài học",
      lessonId,
    });

    return {
      ...result,
      xpAwarded: xpAmount,
      isFirstLesson,
    };
  }

  /**
   * Thưởng XP khi hoàn thành course
   */
  async rewardCourseCompletion(userId: string, courseId: string) {
    // Kiểm tra đã nhận XP chưa
    const hasReceived = await this.xpRepository.hasReceivedXP(
      userId,
      "course_complete",
      courseId,
      "courseId"
    );

    if (hasReceived) {
      return { message: "Đã nhận XP cho khóa học này rồi", xpAwarded: 0 };
    }

    // Check xem có phải course đầu tiên không
    const user = await Prisma.user.findUnique({
      where: { userId },
    });
    if (!user) {
      throw createHttpError(404, "Không tìm thấy người dùng");
    }

    const isFirstCourse = user.totalCoursesCompleted === 1;
    const xpAmount = isFirstCourse
      ? XP_REWARDS.FIRST_COURSE
      : XP_REWARDS.COURSE_COMPLETE;

    const result = await this.addXP({
      userId,
      amount: xpAmount,
      source: isFirstCourse ? "first_course" : "course_complete",
      description: isFirstCourse
        ? "Hoàn thành khóa học đầu tiên! 🏆"
        : "Hoàn thành khóa học",
      courseId,
    });

    // Update totalCoursesCompleted
    await Prisma.user.update({
      where: { userId },
      data: {
        totalCoursesCompleted: { increment: 1 },
      },
    });

    return {
      ...result,
      xpAwarded: xpAmount,
      isFirstCourse,
    };
  }

  /**
   * Thưởng XP khi pass quiz
   */
  async rewardQuizCompletion(
    userId: string,
    quizId: string,
    score: number,
    maxScore: number
  ) {
    const percentage = (score / maxScore) * 100;
    const isPerfect = percentage === 100;

    const xpAmount = isPerfect ? XP_REWARDS.QUIZ_PERFECT : XP_REWARDS.QUIZ_PASS;

    const result = await this.addXP({
      userId,
      amount: xpAmount,
      source: isPerfect ? "quiz_perfect" : "quiz_pass",
      description: isPerfect
        ? "Đạt điểm tuyệt đối quiz! 💯"
        : "Hoàn thành quiz",
      metadata: { quizId, score, maxScore, percentage },
    });

    return {
      ...result,
      xpAwarded: xpAmount,
      isPerfect,
      percentage,
    };
  }

  /**
   * Kiểm tra và unlock achievements
   */
  private async checkAndUnlockAchievements(userId: string) {
    const unlockedAchievements: any[] = [];

    // Lấy tất cả achievements
    const allAchievements =
      await this.achievementRepository.getAllActiveAchievements();

    for (const achievement of allAchievements) {
      // Kiểm tra đã unlock chưa
      const hasUnlocked =
        await this.achievementRepository.hasUnlockedAchievement(
          userId,
          achievement.achievementId
        );

      if (hasUnlocked) continue;

      // Kiểm tra điều kiện
      const req = achievement.requirement as any;
      let isEligible = false;

      if (req.type === "complete_lessons") {
        const count = await Prisma.userLessonProgress.count({
          where: { userId, isCompleted: true },
        });
        isEligible = count >= req.count;
      } else if (req.type === "complete_courses") {
        const user = await Prisma.user.findUnique({
          where: { userId },
        });
        isEligible = user ? user.totalCoursesCompleted >= req.count : false;
      } else if (req.type === "pass_quizzes") {
        const count = await Prisma.submission.count({
          where: { userId, isPassed: true },
        });
        isEligible = count >= req.count;
      }

      // Unlock achievement nếu đạt điều kiện
      if (isEligible) {
        const unlocked = await this.achievementRepository.unlockAchievement(
          userId,
          achievement.achievementId
        );

        // Thưởng XP cho achievement
        if (achievement.xpReward > 0) {
          await this.addXP({
            userId,
            amount: achievement.xpReward,
            source: "achievement",
            description: `Đạt thành tích: ${achievement.name}`,
            achievementId: achievement.achievementId,
          });
        }

        unlockedAchievements.push(unlocked);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Lấy XP history của user
   */
  async getXPHistory(userId: string, limit: number = 50) {
    return await this.xpRepository.getXPHistory(userId, limit);
  }

  /**
   * Lấy user stats (XP, level, achievements)
   */
  async getUserStats(userId: string) {
    const user = await Prisma.user.findUnique({
      where: { userId },
    });
    if (!user) {
      throw createHttpError(404, "Không tìm thấy người dùng");
    }

    const totalXP = await this.xpRepository.getTotalXP(userId);
    const levelInfo =
      await this.levelRequirementRepository.calculateLevelFromXP(totalXP);
    const achievements = await this.achievementRepository.getUserAchievements(
      userId
    );
    const xpHistory = await this.xpRepository.getXPHistory(userId, 10);

    return {
      userId: user.userId,
      userName: user.userName,
      email: user.email,
      avatarURL: user.avatarURL,
      level: user.level,
      experiencePoints: totalXP,
      currentLevelXP: levelInfo.currentLevelXP,
      nextLevelXP: levelInfo.nextLevelXP,
      levelProgress: levelInfo.progress,
      totalCoursesCompleted: user.totalCoursesCompleted,
      achievements: {
        total: achievements.length,
        unlocked: achievements.filter((a) => a.progress === 100).length,
        list: achievements,
      },
      recentXP: xpHistory,
      levelInfo,
    };
  }

  /**
   * Lấy leaderboard
   */
  async getLeaderboard(limit: number = 10) {
    return await this.xpRepository.getLeaderboard(limit);
  }

  /**
   * Lấy tất cả achievements
   */
  async getAllAchievements() {
    return await this.achievementRepository.getAllActiveAchievements();
  }

  /**
   * Lấy achievements của user
   */
  async getUserAchievements(userId: string) {
    return await this.achievementRepository.getUserAchievements(userId);
  }

  /**
   * Thống kê tổng quan XP
   */
  async getStatisticsOverview() {
    const totalXP = await this.xpRepository.getTotalXPAllUsers();
    // TODO: Add countUsers() method to UserRepository
    const totalUsers = 0; // await this.userRepository.countUsers();
    // TODO: Add countAchievements() method to AchievementRepository  
    const totalAchievements = 0; // await this.achievementRepository.countAchievements();
    const avgXP = totalUsers > 0 ? Math.round(totalXP / totalUsers) : 0;
    return { totalXP, totalUsers, totalAchievements, avgXP };
  }

  /**
   * Thống kê XP theo thời gian
   */
  async getXPByPeriod(start: Date, end: Date, groupBy: string) {
    return await this.xpRepository.getXPStatsByPeriod(start, end, groupBy);
  }

  /**
   * Top user có XP cao nhất
   */
  async getTopUsers(limit: number = 10) {
    return await this.xpRepository.getLeaderboard(limit);
  }

  /**
   * Thống kê XP theo khóa học
   */
  async getXPByCourse(courseId: string) {
    return await this.xpRepository.getXPByCourse(courseId);
  }

  /**
   * Thống kê XP theo instructor
   */
  async getXPByInstructor(userId: string) {
    return await this.xpRepository.getXPByInstructor(userId);
  }
}

export default XPService;
