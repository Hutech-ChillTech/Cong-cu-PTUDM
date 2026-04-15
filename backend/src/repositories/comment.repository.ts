import { Prisma, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class CommentRepository extends BaseRepository<
  "comment",
  PrismaClient["comment"],
  Prisma.CommentCreateInput,
  Prisma.CommentUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "comment", primaryKey);
  }

  /**
   * Lấy tất cả comments của một khóa học (chỉ comment gốc + replies)
   */
  async getCommentsByCourseId(courseId: string) {
    return await this.prisma.comment.findMany({
      where: {
        courseId,
        parentId: null, // Chỉ lấy comment gốc
      },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            email: true,
            avatarURL: true,
          },
        },
        replies: {
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
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Lấy replies của một comment
   */
  async getRepliesByCommentId(parentId: string) {
    return await this.prisma.comment.findMany({
      where: { parentId },
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
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Tạo reply cho comment
   */
  async createReply(data: {
    parentId: string;
    userId: string;
    courseId: string;
    content: string;
  }) {
    return await this.prisma.comment.create({
      data: {
        content: data.content,
        parentId: data.parentId,
        userId: data.userId,
        courseId: data.courseId,
      },
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
    });
  }

  /**
   * Lấy comments của một user
   */
  async getCommentsByUserId(userId: string) {
    return await this.prisma.comment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            avatarURL: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Kiểm tra user đã comment cho course chưa
   */
  async hasUserCommented(userId: string, courseId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    return !!comment;
  }

  /**
   * Tính rating trung bình của khóa học
   */
  async getAverageRating(courseId: string) {
    const result = await this.prisma.comment.aggregate({
      where: {
        courseId,
        rating: { not: null },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalRatings: result._count.rating || 0,
    };
  }
}

export default CommentRepository;
