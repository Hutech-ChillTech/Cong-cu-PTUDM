import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class EnrollmentRepository extends BaseRepository<
  "enrollment",
  PrismaClient["enrollment"],
  Prisma.EnrollmentCreateInput,
  Prisma.EnrollmentUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "enrollment", primaryKey);
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    return await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            avatarURL: true,
            coursePrice: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            courseDescription: true,
            avatarURL: true,
            coursePrice: true,
            discount: true,
            createdBy: true,
            user: {
              select: {
                userId: true,
                userName: true,
                email: true,
              },
            },
            chapters: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Tính progress cho mỗi enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Đếm tổng số lessons
        const totalLessons = enrollment.course.chapters.reduce(
          (sum, chapter) => sum + chapter.lessons.length,
          0
        );

        // Đếm số lessons đã hoàn thành
        const completedLessons = await this.prisma.userLessonProgress.count({
          where: {
            userId,
            isCompleted: true,
            lesson: {
              chapter: {
                courseId: enrollment.courseId,
              },
            },
          },
        });

        // Tính progress %
        const progress =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        // Lấy lastAccessAt
        const lastAccessed = await this.prisma.userLessonProgress.findFirst({
          where: {
            userId,
            lesson: {
              chapter: {
                courseId: enrollment.courseId,
              },
            },
          },
          orderBy: {
            lastAccessAt: "desc",
          },
          select: {
            lastAccessAt: true,
          },
        });

        // Remove chapters từ response (chỉ dùng để tính toán)
        const { chapters, ...courseWithoutChapters } = enrollment.course;

        return {
          ...enrollment,
          course: courseWithoutChapters,
          progress: parseFloat(progress.toFixed(2)),
          completedLessons,
          totalLessons,
          lastAccessAt: lastAccessed?.lastAccessAt || null,
        };
      })
    );

    return enrollmentsWithProgress;
  }

  async findByCourseId(courseId: string) {
    return await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            email: true,
            avatarURL: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async countByCourse(courseId: string) {
    return await this.prisma.enrollment.count({
      where: { courseId },
    });
  }

  async countByUser(userId: string) {
    return await this.prisma.enrollment.count({
      where: { userId },
    });
  }

  async getAllWithDetails(params?: { skip?: number; take?: number }) {
    const query: any = {
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            email: true,
          },
        },
        course: {
          select: {
            courseId: true,
            courseName: true,
            coursePrice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    };

    if (params?.skip) query.skip = params.skip;
    if (params?.take && params.take > 0) query.take = params.take;

    return await this.prisma.enrollment.findMany(query);
  }
}

export default EnrollmentRepository;
