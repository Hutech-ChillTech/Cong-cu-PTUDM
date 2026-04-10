import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class LessonProgressRepository extends BaseRepository<
  "userLessonProgress",
  PrismaClient["userLessonProgress"],
  Prisma.UserLessonProgressCreateInput,
  Prisma.UserLessonProgressUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "userLessonProgress", primaryKey);
  }

  /**
   * Lấy progress của user cho 1 lesson cụ thể
   */
  async getUserLessonProgress(userId: string, lessonId: string) {
    return await this.prisma.userLessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      include: {
        lesson: {
          select: {
            lessonId: true,
            lessonName: true,
            chapterId: true,
          },
        },
      },
    });
  }

  /**
   * Tạo hoặc update progress cho lesson
   */
  async upsertLessonProgress(data: {
    userId: string;
    lessonId: string;
    isCompleted?: boolean;
    lastAccessAt?: Date;
  }) {
    return await this.prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: data.userId,
          lessonId: data.lessonId,
        },
      },
      create: {
        userId: data.userId,
        lessonId: data.lessonId,
        isCompleted: data.isCompleted || false,
        lastAccessAt: data.lastAccessAt || new Date(),
      },
      update: {
        isCompleted: data.isCompleted,
        lastAccessAt: data.lastAccessAt || new Date(),
      },
      include: {
        lesson: {
          select: {
            lessonId: true,
            lessonName: true,
            chapterId: true,
          },
        },
      },
    });
  }

  /**
   * Đánh dấu lesson hoàn thành
   */
  async markLessonCompleted(userId: string, lessonId: string) {
    return await this.upsertLessonProgress({
      userId,
      lessonId,
      isCompleted: true,
      lastAccessAt: new Date(),
    });
  }

  /**
   * Cập nhật lastAccessAt khi user xem lesson
   */
  async updateLastAccess(userId: string, lessonId: string) {
    return await this.upsertLessonProgress({
      userId,
      lessonId,
      lastAccessAt: new Date(),
    });
  }

  /**
   * Lấy tất cả lessons đã hoàn thành của user trong 1 khóa học
   */
  async getCompletedLessonsByCourse(userId: string, courseId: string) {
    return await this.prisma.userLessonProgress.findMany({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          chapter: {
            courseId,
          },
        },
      },
      include: {
        lesson: {
          select: {
            lessonId: true,
            lessonName: true,
            chapterId: true,
            videoUrl: true,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });
  }

  /**
   * Lấy tất cả progress của user trong 1 khóa học
   */
  async getAllProgressByCourse(userId: string, courseId: string) {
    return await this.prisma.userLessonProgress.findMany({
      where: {
        userId,
        lesson: {
          chapter: {
            courseId,
          },
        },
      },
      include: {
        lesson: {
          select: {
            lessonId: true,
            lessonName: true,
            chapterId: true,
            chapter: {
              select: {
                chapterId: true,
                chapterName: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastAccessAt: "desc",
      },
    });
  }

  /**
   * Đếm số lessons đã hoàn thành trong 1 khóa học
   */
  async countCompletedLessons(userId: string, courseId: string) {
    return await this.prisma.userLessonProgress.count({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          chapter: {
            courseId,
          },
        },
      },
    });
  }

  /**
   * Lấy lesson cuối cùng user đã truy cập trong khóa học
   */
  async getLastAccessedLesson(userId: string, courseId: string) {
    return await this.prisma.userLessonProgress.findFirst({
      where: {
        userId,
        lesson: {
          chapter: {
            courseId,
          },
        },
      },
      include: {
        lesson: {
          select: {
            lessonId: true,
            lessonName: true,
            videoUrl: true,
            chapterId: true,
            chapter: {
              select: {
                chapterName: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastAccessAt: "desc",
      },
    });
  }

  /**
   * Lấy danh sách lessons chưa hoàn thành trong khóa học
   */
  async getIncompleteLessons(userId: string, courseId: string) {
    // Lấy tất cả lessons trong course
    const allLessons = await this.prisma.lesson.findMany({
      where: {
        chapter: {
          courseId,
        },
      },
      select: {
        lessonId: true,
        lessonName: true,
        chapterId: true,
      },
    });

    // Lấy lessons đã hoàn thành
    const completedLessons = await this.getCompletedLessonsByCourse(
      userId,
      courseId
    );
    const completedLessonIds = completedLessons.map((p) => p.lesson.lessonId);

    // Filter lessons chưa hoàn thành
    return allLessons.filter(
      (lesson) => !completedLessonIds.includes(lesson.lessonId)
    );
  }
}

export default LessonProgressRepository;
