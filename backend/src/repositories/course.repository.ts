import { Prisma, PrismaClient, Level } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository<
  "course",
  PrismaClient["course"],
  Prisma.CourseCreateInput,
  Prisma.CourseUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "course", primaryKey);
  }

  // Lấy khóa học theo tên chính xác
  async getCourseByName(courseName: string) {
    return await this.prisma.course.findMany({
      where: { courseName },
      select: {
        courseId: true,
        courseName: true,
        courseDescription: true,
        coursePrice: true,
        discount: true,
        avatarURL: true,
        level: true,
        createdBy: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // Tìm kiếm khóa học theo tên (contains - không phân biệt hoa thường)
  async searchCourseByName(searchTerm: string, limit: number = 20) {
    return await this.prisma.course.findMany({
      where: {
        courseName: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        courseId: true,
        courseName: true,
        coursePrice: true,
        discount: true,
        avatarURL: true,
        level: true,
      },
      take: limit,
      orderBy: {
        courseName: "asc",
      },
    });
  }

  // Lấy khóa học bắt đầu bằng prefix (startsWith)
  async getCourseByNamePrefix(prefix: string) {
    return await this.prisma.course.findMany({
      where: {
        courseName: {
          startsWith: prefix,
          mode: "insensitive",
        },
      },
      select: {
        courseId: true,
        courseName: true,
        coursePrice: true,
        avatarURL: true,
        level: true,
      },
      take: 20,
      orderBy: {
        courseName: "asc",
      },
    });
  }

  // Lấy tất cả khóa học có sắp xếp (sort) và phân trang
  async getAllSorted(
    sortField: string = "created_at",
    sortOrder: "asc" | "desc" = "desc",
    options?: { skip?: number; take?: number }
  ) {
    const { skip = 0, take = 20 } = options || {};

    return this.prisma.course.findMany({
      select: {
        courseId: true,
        courseName: true,
        courseDescription: true,
        coursePrice: true,
        discount: true,
        avatarURL: true,
        level: true,
        created_at: true,
      },
      orderBy: { [sortField]: sortOrder },
      skip,
      take,
    });
  }

  // Lấy chi tiết khóa học kèm thông tin creator, chapters, enrollments, comments
  async getCourseWithDetails(courseId: string) {
    const course = await this.prisma.course.findUnique({
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
        chapters: {
          select: {
            chapterId: true,
            chapterName: true,
            totalLesson: true,
            created_at: true,
          },
          orderBy: {
            created_at: "asc",
          },
        },
        enrollments: {
          select: {
            enrollmentId: true,
            createdAt: true,
            user: {
              select: {
                userId: true,
                userName: true,
                avatarURL: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        comments: {
          select: {
            commentId: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                userId: true,
                userName: true,
                avatarURL: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!course) {
      return null;
    }

    return {
      ...course,
      chapters: course.chapters || [],
      enrollments: course.enrollments || [],
      comments: course.comments || [],
    };
  }

  // Lấy danh sách khóa học theo cấp độ
  async getCoursesByLevel(
    level: Level,
    options?: { skip?: number; take?: number }
  ) {
    const { skip = 0, take = 20 } = options || {};

    return await this.prisma.course.findMany({
      where: { level },
      select: {
        courseId: true,
        courseName: true,
        courseDescription: true,
        coursePrice: true,
        discount: true,
        avatarURL: true,
        level: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take,
    });
  }

  // Lấy khóa học theo người tạo (creator/instructor)
  async getCoursesByCreator(
    userId: string,
    options?: { skip?: number; take?: number }
  ) {
    const { skip = 0, take = 20 } = options || {};

    return await this.prisma.course.findMany({
      where: { createdBy: userId },
      select: {
        courseId: true,
        courseName: true,
        courseDescription: true,
        coursePrice: true,
        discount: true,
        avatarURL: true,
        level: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take,
    });
  }

  // Lấy khóa học phổ biến/nổi bật dựa vào số lượng người đăng ký
  async getPopularCourses(limit: number = 10) {
    const courses = await this.prisma.course.findMany({
      select: {
        courseId: true,
        courseName: true,
        courseDescription: true,
        coursePrice: true,
        discount: true,
        avatarURL: true,
        level: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return courses.map((course) => ({
      ...course,
      enrollmentCount: course._count.enrollments,
      _count: undefined,
    }));
  }

  // Lấy thống kê của khóa học (số lượng enrollments, chapters, comments, certificates)
  async getCourseStats(courseId: string) {
    const [totalEnrollments, totalChapters, totalComments, totalCertificates] =
      await Promise.all([
        this.prisma.enrollment.count({ where: { courseId } }),
        this.prisma.chapter.count({ where: { courseId } }),
        this.prisma.comment.count({ where: { courseId } }),
        this.prisma.certificate.count({ where: { courseId } }),
      ]);

    return {
      totalEnrollments,
      totalChapters,
      totalComments,
      totalCertificates,
    };
  }

  // Lọc khóa học theo nhiều tiêu chí (level, price range, search term)
  async filterCourses(filters: {
    level?: Level;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    skip?: number;
    take?: number;
  }) {
    const {
      level,
      minPrice,
      maxPrice,
      searchTerm,
      skip = 0,
      take = 20,
    } = filters;

    const where: Prisma.CourseWhereInput = {
      ...(level && { level }),
      ...(minPrice !== undefined && { coursePrice: { gte: minPrice } }),
      ...(maxPrice !== undefined && { coursePrice: { lte: maxPrice } }),
      ...(searchTerm && {
        OR: [
          { courseName: { contains: searchTerm, mode: "insensitive" } },
          { courseDescription: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    };

    return await this.prisma.course.findMany({
      where,
      select: {
        courseId: true,
        courseName: true,
        courseDescription: true,
        coursePrice: true,
        discount: true,
        avatarURL: true,
        level: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take,
    });
  }

  // Đếm số lượng khóa học theo bộ lọc
  async countCourses(filters?: {
    level?: Level;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
  }) {
    const where: Prisma.CourseWhereInput = {
      ...(filters?.level && { level: filters.level }),
      ...(filters?.minPrice !== undefined && {
        coursePrice: { gte: filters.minPrice },
      }),
      ...(filters?.maxPrice !== undefined && {
        coursePrice: { lte: filters.maxPrice },
      }),
      ...(filters?.searchTerm && {
        OR: [
          { courseName: { contains: filters.searchTerm, mode: "insensitive" } },
          {
            courseDescription: {
              contains: filters.searchTerm,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    return await this.prisma.course.count({ where });
  }

  // Lấy khóa học kèm theo chapters và lessons của từng chapter
  async getCourseWithChaptersAndLessons(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { courseId },
      include: {
        chapters: {
          include: {
            lessons: {
              select: {
                lessonId: true,
                lessonName: true,
                videoUrl: true,
                isPreview: true,
                created_at: true,
              },
              orderBy: {
                created_at: "asc",
              },
            },
          },
          orderBy: {
            created_at: "asc",
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    return {
      ...course,
      chapters: (course.chapters || []).map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons || [],
      })),
    };
  }

  /**
   * Lấy danh sách khóa học mà user đã mua (enrolled)
   */
  async getEnrolledCourses(
    userId: string,
    options?: { skip?: number; take?: number }
  ) {
    const { skip = 0, take = 20 } = options || {};

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
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
            created_at: true,
            user: {
              select: {
                userId: true,
                userName: true,
                avatarURL: true,
              },
            },
            _count: {
              select: {
                chapters: true,
                enrollments: true,
              },
            },
          },
        },
        payments: {
          select: {
            paymentId: true,
            amount: true,
            paymentMethod: true,
            paymentStatus: true,
            paidAt: true,
          },
          where: {
            paymentStatus: "COMPLETED",
          },
          orderBy: {
            paidAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });

    return enrollments.map((enrollment) => ({
      enrollmentId: enrollment.enrollmentId,
      enrolledAt: enrollment.createdAt,
      course: {
        ...enrollment.course,
        instructor: enrollment.course.user,
        totalChapters: enrollment.course._count.chapters,
        totalEnrollments: enrollment.course._count.enrollments,
      },
      payment: enrollment.payments[0] || null,
    }));
  }

  /**
   * Kiểm tra user đã mua khóa học chưa
   */
  async checkUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    return !!enrollment;
  }

  /**
   * Lấy danh sách courseId mà user đã enroll (dùng để check hàng loạt)
   */
  async getUserEnrolledCourseIds(userId: string): Promise<string[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });
    return enrollments.map((e) => e.courseId);
  }
}

export default CourseRepository;
