import { LearningSpeed, SubLevel, Level } from "@prisma/client";
import prisma from "../configs/prismaClient";

/**
 * 📊 CÔNG THỨC TÍNH TỐC ĐỘ HỌC
 *
 * speedScore = (finalScore / 100 * estimatedDuration) / totalLearningTime
 *
 * Trong đó:
 * - finalScore: Điểm cuối cùng (từ Certificate.totalScore)
 * - estimatedDuration: Thời gian ước lượng (giờ) từ Course.estimatedDuration
 * - totalLearningTime: Tổng thời gian học thực tế (giờ)
 *
 * KẾT QUẢ:
 * - speedScore > 1.0: Học NHANH (Fast)
 * - speedScore = 1.0: Học BÌNH THƯỜNG (Normal)
 * - speedScore < 1.0: Học CHẬM (Slow)
 */

interface CalculateSpeedParams {
  userId: string;
  courseId: string;
  totalScore: number; // Từ Certificate
  estimatedDuration: number; // Từ Course (giờ)
  totalLearningTime?: number; // Optional - Từ Enrollment.totalCompletionTime (giờ)
}

interface SubLevelInfo {
  level: Level;
  subLevel: SubLevel;
  position: number; // 1-9 (1=Basic-Low, 9=Advanced-High)
}

export class LearningSpeedService {
  /**
   * Tính toán tốc độ học của user cho một khóa học
   */
  async calculateLearningSpeed(params: CalculateSpeedParams) {
    const {
      userId,
      courseId,
      totalScore,
      estimatedDuration,
      totalLearningTime: providedTime,
    } = params;

    // Lấy totalLearningTime từ Enrollment.totalCompletionTime nếu không được cung cấp
    let totalLearningTime = providedTime;

    if (!totalLearningTime || totalLearningTime <= 0) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (!enrollment || !enrollment.totalCompletionTime) {
        throw new Error(
          "Không thể tính learning speed: User chưa có thời gian học (totalCompletionTime = 0 hoặc NULL)"
        );
      }

      // Convert seconds to hours
      totalLearningTime = enrollment.totalCompletionTime / 3600;
    }

    // Validate inputs
    if (totalLearningTime <= 0) {
      throw new Error("Total learning time must be greater than 0");
    }
    if (estimatedDuration <= 0) {
      throw new Error("Estimated duration must be greater than 0");
    }
    if (totalScore < 0 || totalScore > 100) {
      throw new Error("Total score must be between 0 and 100");
    }

    // CÔNG THỨC: (totalScore / 100 * estimatedDuration) / totalLearningTime
    const speedScore =
      ((totalScore / 100) * estimatedDuration) / totalLearningTime;

    // Xác định learningSpeed
    let learningSpeed: LearningSpeed;
    if (speedScore > 1.0) {
      learningSpeed = LearningSpeed.Fast;
    } else if (speedScore >= 0.9 && speedScore <= 1.1) {
      // Cho phép sai số ±10% coi là Normal
      learningSpeed = LearningSpeed.Normal;
    } else {
      learningSpeed = LearningSpeed.Slow;
    }

    // Lưu hoặc cập nhật vào database
    const userLearningSpeed = await prisma.userLearningSpeed.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: {
        totalLearningTime,
        finalScore: totalScore,
        speedScore,
        learningSpeed,
        lastUpdated: new Date(),
      },
      create: {
        userId,
        courseId,
        totalLearningTime,
        finalScore: totalScore,
        speedScore,
        learningSpeed,
      },
    });

    return {
      speedScore,
      learningSpeed,
      userLearningSpeed,
    };
  }

  /**
   * Tính tổng thời gian học thực tế
   * Priority 1: Enrollment.totalCompletionTime (course-level tracking)
   * Priority 2: LearningSession (lesson-level tracking)
   */
  async calculateTotalLearningTime(
    userId: string,
    courseId: string
  ): Promise<number> {
    // Priority 1: Lấy từ Enrollment.totalCompletionTime (đã có sẵn)
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (enrollment && enrollment.totalCompletionTime > 0) {
      // Convert seconds to hours
      return enrollment.totalCompletionTime / 3600;
    }

    // Priority 2: Fallback to LearningSession (nếu chưa có totalCompletionTime)
    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        courseId,
        isActive: false, // Chỉ lấy sessions đã kết thúc
        endTime: { not: null },
      },
    });

    // Tổng thời gian active (giây) → chuyển sang giờ
    const totalSeconds = sessions.reduce(
      (sum, session) => sum + session.totalActiveTime,
      0
    );
    const totalHours = totalSeconds / 3600;

    return totalHours;
  }

  /**
   * Lấy thông tin vị trí cấp độ hiện tại của khóa học (1-9)
   */
  private getSubLevelPosition(level: Level, subLevel: SubLevel): number {
    const levelBase = {
      [Level.Basic]: 0,
      [Level.Intermediate]: 3,
      [Level.Advanced]: 6,
    }[level];

    const subLevelOffset = {
      [SubLevel.Low]: 1,
      [SubLevel.Mid]: 2,
      [SubLevel.High]: 3,
    }[subLevel];

    return levelBase + subLevelOffset;
  }

  /**
   * Chuyển đổi vị trí (1-9) thành Level + SubLevel
   */
  private positionToSubLevel(position: number): SubLevelInfo {
    if (position < 1) position = 1;
    if (position > 9) position = 9;

    let level: Level;
    let subLevel: SubLevel;

    if (position <= 3) {
      level = Level.Basic;
      subLevel = [SubLevel.Low, SubLevel.Mid, SubLevel.High][position - 1];
    } else if (position <= 6) {
      level = Level.Intermediate;
      subLevel = [SubLevel.Low, SubLevel.Mid, SubLevel.High][position - 4];
    } else {
      level = Level.Advanced;
      subLevel = [SubLevel.Low, SubLevel.Mid, SubLevel.High][position - 7];
    }

    return { level, subLevel, position };
  }

  /**
   * 🎯 GỢI Ý KHÓA HỌC DựA TRÊN TỐC ĐỘ HỌC + CHUYÊN NGÀNH + TAG
   *
   * - Fast (>1): +2 cấp (VD: Basic-Low → Basic-High)
   * - Normal (=1): Cùng cấp (VD: Basic-Mid → Basic-Mid)
   * - Slow (<1): -1 cấp (VD: Basic-High → Basic-Mid)
   *
   * Ưu tiên gợi ý:
   * 1. Khóa học cùng specialization với user
   * 2. Khóa học cùng tag với khóa vừa hoàn thành
   * 3. Khóa học cùng level/subLevel phù hợp
   */
  async recommendNextCourses(userId: string, completedCourseId: string) {
    // 1. Lấy thông tin user (specialization)
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { specialization: true },
    });

    // 2. Lấy thông tin khóa học vừa hoàn thành
    const completedCourse = await prisma.course.findUnique({
      where: { courseId: completedCourseId },
      select: {
        level: true,
        subLevel: true,
        estimatedDuration: true,
        specialization: true,
        tag: true,
      },
    });

    if (
      !completedCourse ||
      !completedCourse.level ||
      !completedCourse.subLevel
    ) {
      throw new Error("Course level/subLevel not found");
    }

    // 3. Lấy learning speed của user cho khóa học này
    const userSpeed = await prisma.userLearningSpeed.findUnique({
      where: {
        userId_courseId: { userId, courseId: completedCourseId },
      },
    });

    // Nếu chưa có dữ liệu tốc độ học, mặc định coi là Normal để không bị crash 500
    const speedScore = userSpeed?.speedScore || 1.0;
    const learningSpeed = userSpeed?.learningSpeed || LearningSpeed.Normal;

    // 3. Xác định vị trí hiện tại (1-9)
    const currentPosition = this.getSubLevelPosition(
      completedCourse.level,
      completedCourse.subLevel
    );

    // 4. Tính vị trí đề xuất dựa trên tốc độ học
    let recommendedPosition: number;
    let reason: string;

    switch (learningSpeed) {
      case LearningSpeed.Fast:
        // +2 cấp
        recommendedPosition = currentPosition + 2;
        reason = `Bạn học nhanh (điểm ${speedScore.toFixed(
          2
        )})! Gợi ý khóa học khó hơn 2 cấp`;
        break;

      case LearningSpeed.Normal:
        // Cùng cấp
        recommendedPosition = currentPosition;
        reason = `Bạn học ổn định (điểm ${speedScore.toFixed(
          2
        )}). Gợi ý khóa học cùng cấp độ`;
        break;

      case LearningSpeed.Slow:
        // -1 cấp
        recommendedPosition = currentPosition - 1;
        reason = `Bạn cần thêm thời gian (điểm ${speedScore.toFixed(
          2
        )}). Gợi ý khóa học dễ hơn 1 cấp`;
        break;

      default:
        recommendedPosition = currentPosition;
        reason = "Gợi ý khóa học cùng cấp độ";
    }

    // 5. Chuyển đổi vị trí thành Level + SubLevel
    const recommendedLevel = this.positionToSubLevel(recommendedPosition);

    // 6. Tìm khóa học phù hợp với NHIỀU TIÊU CHÍ
    // 6.1. Ưu tiên 1: Cùng TAG + Điều chỉnh LEVEL theo tốc độ học
    // Nếu Fast (+2 cấp), Normal (cùng cấp), Slow (-1 cấp)
    const coursesByTag = completedCourse.tag
      ? await prisma.course.findMany({
          where: {
            tag: completedCourse.tag,
            level: recommendedLevel.level,
            subLevel: recommendedLevel.subLevel,
            courseId: { not: completedCourseId },
          },
          take: 3,
          orderBy: { created_at: "desc" },
        })
      : [];

    // 6.2. Ưu tiên 2: Cùng specialization với user + cùng level được gợi ý
    const coursesBySpecialization = user?.specialization
      ? await prisma.course.findMany({
          where: {
            level: recommendedLevel.level,
            subLevel: recommendedLevel.subLevel,
            specialization: user.specialization,
            courseId: {
              not: completedCourseId,
              notIn: coursesByTag.map((c) => c.courseId),
            },
          },
          take: 2,
          orderBy: { created_at: "desc" },
        })
      : [];

    // 6.3. Ưu tiên 3: Các khóa học khác cùng level (fallback)
    const otherCourses = await prisma.course.findMany({
      where: {
        level: recommendedLevel.level,
        subLevel: recommendedLevel.subLevel,
        courseId: {
          not: completedCourseId,
          notIn: [
            ...coursesByTag.map((c) => c.courseId),
            ...coursesBySpecialization.map((c) => c.courseId),
          ],
        },
      },
      take: 5 - coursesByTag.length - coursesBySpecialization.length,
      orderBy: { created_at: "desc" },
    });

    // Gộp tất cả khóa học theo thứ tự ưu tiên: TAG → SPECIALIZATION → OTHERS
    const recommendedCourses = [
      ...coursesByTag,
      ...coursesBySpecialization,
      ...otherCourses,
    ];

    // 7. Tạo reason chi tiết dựa trên tiêu chí match
    const createDetailedReason = (course: any) => {
      const reasons = [];

      // Ưu tiên hiển thị tag trước
      if (completedCourse.tag && course.tag === completedCourse.tag) {
        reasons.push(`cùng chủ đề ${course.tag}`);
      }

      if (
        user?.specialization &&
        course.specialization === user.specialization
      ) {
        reasons.push(`phù hợp với chuyên ngành ${user.specialization}`);
      }

      reasons.push(reason); // Lý do từ learning speed

      return reasons.join(", ");
    };

    // 8. Lưu recommendations vào database
    const recommendations = await Promise.all(
      recommendedCourses.map((course) =>
        prisma.courseRecommendation.create({
          data: {
            userId,
            recommendedCourseId: course.courseId,
            reason: createDetailedReason(course),
            score: speedScore || 0,
          },
        })
      )
    );

    return {
      currentLevel: {
        level: completedCourse.level,
        subLevel: completedCourse.subLevel,
        position: currentPosition,
      },
      recommendedLevel: {
        level: recommendedLevel.level,
        subLevel: recommendedLevel.subLevel,
        position: recommendedLevel.position,
      },
      learningSpeed: learningSpeed,
      speedScore: speedScore,
      reason,
      matchCriteria: {
        userSpecialization: user?.specialization || null,
        courseTag: completedCourse.tag || null,
        courseSpecialization: completedCourse.specialization || null,
      },
      recommendationBreakdown: {
        byTag: coursesByTag.length,
        bySpecialization: coursesBySpecialization.length,
        others: otherCourses.length,
        total: recommendedCourses.length,
      },
      courses: recommendedCourses,
      recommendations,
    };
  }

  /**
   * Lấy learning speed history của user
   */
  async getUserLearningSpeedHistory(userId: string) {
    const history = await prisma.userLearningSpeed.findMany({
      where: { userId },
      orderBy: { lastUpdated: "desc" },
      take: 10,
    });

    return history;
  }

  /**
   * 🎯 GỢI Ý KHÓA HỌC SAU KHI HOÀN THÀNH (KHÔNG CẦN CERTIFICATE)
   * Chỉ dựa trên level của khóa học đã hoàn thành
   */
  async onCourseCompleted(userId: string, completedCourseId: string) {
    try {
      // 1. Lấy thông tin user (specialization)
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { specialization: true },
      });

      // 2. Lấy thông tin khóa học vừa hoàn thành
      const completedCourse = await prisma.course.findUnique({
        where: { courseId: completedCourseId },
        select: {
          courseName: true,
          level: true,
          subLevel: true,
          specialization: true,
          tag: true,
        },
      });

      if (!completedCourse || !completedCourse.level || !completedCourse.subLevel) {
        throw new Error('Course level/subLevel not found');
      }

      // 3. Xác định vị trí hiện tại (1-9)
      const currentPosition = this.getSubLevelPosition(
        completedCourse.level,
        completedCourse.subLevel
      );

      // 4. Gợi ý khóa học CAO HƠN 1 CẤP
      const recommendedPosition = currentPosition + 1;
      const recommendedLevel = this.positionToSubLevel(recommendedPosition);

      // 5. Tìm khóa học phù hợp
      // 5.1. Ưu tiên 1: Cùng TAG + Level cao hơn
      const coursesByTag = completedCourse.tag
        ? await prisma.course.findMany({
            where: {
              tag: completedCourse.tag,
              level: recommendedLevel.level,
              subLevel: recommendedLevel.subLevel,
              courseId: { not: completedCourseId },
            },
            take: 3,
            orderBy: { created_at: 'desc' },
          })
        : [];

      // 5.2. Ưu tiên 2: Cùng specialization với user
      const coursesBySpecialization = user?.specialization
        ? await prisma.course.findMany({
            where: {
              level: recommendedLevel.level,
              subLevel: recommendedLevel.subLevel,
              specialization: user.specialization,
              courseId: {
                not: completedCourseId,
                notIn: coursesByTag.map((c) => c.courseId),
              },
            },
            take: 2,
            orderBy: { created_at: 'desc' },
          })
        : [];

      // 5.3. Ưu tiên 3: Các khóa học khác cùng level
      const otherCourses = await prisma.course.findMany({
        where: {
          level: recommendedLevel.level,
          subLevel: recommendedLevel.subLevel,
          courseId: {
            not: completedCourseId,
            notIn: [
              ...coursesByTag.map((c) => c.courseId),
              ...coursesBySpecialization.map((c) => c.courseId),
            ],
          },
        },
        take: 5 - coursesByTag.length - coursesBySpecialization.length,
        orderBy: { created_at: 'desc' },
      });

      // Gộp tất cả khóa học
      const recommendedCourses = [
        ...coursesByTag,
        ...coursesBySpecialization,
        ...otherCourses,
      ];

      return {
        currentCourse: {
          courseName: completedCourse.courseName,
          level: completedCourse.level,
          subLevel: completedCourse.subLevel,
          position: currentPosition,
        },
        recommendedLevel: {
          level: recommendedLevel.level,
          subLevel: recommendedLevel.subLevel,
          position: recommendedLevel.position,
        },
        reason: `Bạn đã hoàn thành ${completedCourse.courseName}. Gợi ý khóa học tiếp theo!`,
        courses: recommendedCourses,
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
}

export default new LearningSpeedService();
