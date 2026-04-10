import {
  PrismaClient,
  LearningPath,
  LearningPathCourse,
  Prisma,
} from "@prisma/client";
import prisma from "../configs/prismaClient";

export class LearningPathRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async findById(learningPathId: string) {
    return this.prismaClient.learningPath.findUnique({
      where: { learningPathId },
    });
  }

  /**
   * Tìm tất cả Learning Paths với filter
   */
  async findAllWithFilters(filters: {
    level?: string;
    isPublished?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { level, isPublished, search, page = 1, limit = 10 } = filters;

    const where: Prisma.LearningPathWhereInput = {};

    if (level) {
      where.level = level as any;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [paths, total] = await Promise.all([
      this.prismaClient.learningPath.findMany({
        where,
        include: {
          creator: {
            select: {
              userId: true,
              userName: true,
              email: true,
              avatarURL: true,
            },
          },
          courses: {
            include: {
              course: {
                select: {
                  courseId: true,
                  courseName: true,
                  courseDescription: true,
                  coursePrice: true,
                  discount: true,
                  avatarURL: true,
                  level: true,
                  specialization: true,
                  tag: true,
                },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
          _count: {
            select: {
              userLearningPaths: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      this.prismaClient.learningPath.count({ where }),
    ]);

    return {
      paths,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tìm Learning Path theo ID với full details
   */
  async findByIdWithDetails(learningPathId: string) {
    return this.prismaClient.learningPath.findUnique({
      where: { learningPathId },
      include: {
        creator: {
          select: {
            userId: true,
            userName: true,
            email: true,
            avatarURL: true,
          },
        },
        courses: {
          include: {
            course: {
              select: {
                courseId: true,
                courseName: true,
                courseDescription: true,
                coursePrice: true,
                discount: true,
                avatarURL: true,
                level: true,
                subLevel: true,
                estimatedDuration: true,
                specialization: true,
                tag: true,
                _count: {
                  select: {
                    chapters: true,
                    enrollments: true,
                  },
                },
              },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            userLearningPaths: true,
          },
        },
      },
    });
  }

  /**
   * Tạo Learning Path mới
   */
  async createLearningPath(data: {
    title: string;
    description?: string;
    level: string;
    estimatedHours?: number;
    isPublished?: boolean;
    createdBy?: string;
  }) {
    return this.prismaClient.learningPath.create({
      data: {
        title: data.title,
        description: data.description,
        level: data.level as any,
        estimatedHours: data.estimatedHours,
        isPublished: data.isPublished ?? false,
        createdBy: data.createdBy,
      },
      include: {
        creator: {
          select: {
            userId: true,
            userName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update Learning Path
   */
  async updateLearningPath(
    learningPathId: string,
    data: Partial<{
      title: string;
      description: string;
      level: string;
      estimatedHours: number;
      isPublished: boolean;
    }>
  ) {
    return this.prismaClient.learningPath.update({
      where: { learningPathId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.level && { level: data.level as any }),
        ...(data.estimatedHours !== undefined && {
          estimatedHours: data.estimatedHours,
        }),
        ...(data.isPublished !== undefined && {
          isPublished: data.isPublished,
        }),
      },
    });
  }

  /**
   * Xóa Learning Path
   */
  async deleteLearningPath(learningPathId: string) {
    return this.prismaClient.learningPath.delete({
      where: { learningPathId },
    });
  }

  /**
   * Thêm khóa học vào Learning Path
   */
  async addCourseToPath(data: {
    learningPathId: string;
    courseId: string;
    orderIndex: number;
    isRequired?: boolean;
  }) {
    return this.prismaClient.learningPathCourse.create({
      data: {
        learningPathId: data.learningPathId,
        courseId: data.courseId,
        orderIndex: data.orderIndex,
        isRequired: data.isRequired ?? true,
      },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            courseDescription: true,
            avatarURL: true,
            level: true,
          },
        },
      },
    });
  }

  /**
   * Xóa khóa học khỏi Learning Path
   */
  async removeCourseFromPath(learningPathId: string, courseId: string) {
    return this.prismaClient.learningPathCourse.deleteMany({
      where: {
        learningPathId,
        courseId,
      },
    });
  }

  /**
   * Cập nhật thứ tự khóa học trong Learning Path
   */
  async updateCourseOrder(
    learningPathId: string,
    courseOrders: Array<{ courseId: string; orderIndex: number }>
  ) {
    // Update từng course order trong transaction
    const updates = courseOrders.map(({ courseId, orderIndex }) =>
      this.prismaClient.learningPathCourse.updateMany({
        where: {
          learningPathId,
          courseId,
        },
        data: { orderIndex },
      })
    );

    return this.prismaClient.$transaction(updates);
  }

  /**
   * Lấy các khóa học trong Learning Path
   */
  async getCoursesInPath(learningPathId: string) {
    return this.prismaClient.learningPathCourse.findMany({
      where: { learningPathId },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            courseDescription: true,
            coursePrice: true,
            discount: true,
            avatarURL: true,
            level: true,
            subLevel: true,
            estimatedDuration: true,
            specialization: true,
            tag: true,
            _count: {
              select: {
                chapters: true,
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: { orderIndex: "asc" },
    });
  }

  /**
   * Kiểm tra course đã có trong path chưa
   */
  async isCourseInPath(learningPathId: string, courseId: string) {
    const exists = await this.prismaClient.learningPathCourse.findFirst({
      where: {
        learningPathId,
        courseId,
      },
    });
    return !!exists;
  }

  /**
   * Lấy số lượng courses trong path
   */
  async getCoursesCount(learningPathId: string) {
    return this.prismaClient.learningPathCourse.count({
      where: { learningPathId },
    });
  }

  /**
   * User follow Learning Path
   */
  async followLearningPath(userId: string, learningPathId: string) {
    return this.prismaClient.userLearningPath.create({
      data: {
        userId,
        learningPathId,
        progress: 0,
        isCompleted: false,
      },
    });
  }

  /**
   * User unfollow Learning Path
   */
  async unfollowLearningPath(userId: string, learningPathId: string) {
    return this.prismaClient.userLearningPath.deleteMany({
      where: {
        userId,
        learningPathId,
      },
    });
  }

  /**
   * Lấy Learning Paths mà user đang follow
   */
  async getUserLearningPaths(userId: string) {
    return this.prismaClient.userLearningPath.findMany({
      where: { userId },
      include: {
        learningPath: {
          include: {
            courses: {
              include: {
                course: {
                  select: {
                    courseId: true,
                    courseName: true,
                    avatarURL: true,
                    level: true,
                  },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });
  }

  /**
   * Update progress của user trong Learning Path
   */
  async updateUserProgress(
    userId: string,
    learningPathId: string,
    progress: number,
    isCompleted?: boolean
  ) {
    return this.prismaClient.userLearningPath.updateMany({
      where: {
        userId,
        learningPathId,
      },
      data: {
        progress,
        isCompleted: isCompleted ?? false,
        ...(isCompleted && { completedAt: new Date() }),
      },
    });
  }

  /**
   * Kiểm tra user đã follow path chưa
   */
  async isUserFollowingPath(userId: string, learningPathId: string) {
    const exists = await this.prismaClient.userLearningPath.findFirst({
      where: {
        userId,
        learningPathId,
      },
    });
    return !!exists;
  }

  /**
   * Lấy thống kê Learning Path
   */
  async getPathStats(learningPathId: string) {
    const [totalFollowers, completedFollowers, avgProgress] = await Promise.all(
      [
        this.prismaClient.userLearningPath.count({
          where: { learningPathId },
        }),
        this.prismaClient.userLearningPath.count({
          where: {
            learningPathId,
            isCompleted: true,
          },
        }),
        this.prismaClient.userLearningPath.aggregate({
          where: { learningPathId },
          _avg: { progress: true },
        }),
      ]
    );

    return {
      totalFollowers,
      completedFollowers,
      avgProgress: avgProgress._avg.progress || 0,
    };
  }
}

export default new LearningPathRepository();
