import { PrismaClient, Submission, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class SubmissionRepository extends BaseRepository<
  "submission",
  PrismaClient["submission"],
  Prisma.SubmissionCreateInput,
  Prisma.SubmissionUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "submission", "submissionId");
  }

  /**
   * Tạo submission mới khi user nộp bài quiz
   */
  async createSubmission(data: {
    userId: string;
    chapterQuizId: string;
    score: number;
    maxScore: number;
    isPassed: boolean;
    answers: any;
    submittedAt: Date;
  }): Promise<Submission> {
    return this.prisma.submission.create({
      data,
      include: {
        chapterQuiz: {
          include: {
            chapter: true,
          },
        },
        user: {
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
   * Lấy submission của user cho một ChapterQuiz cụ thể
   */
  async getSubmissionByUserAndQuiz(
    userId: string,
    chapterQuizId: string
  ): Promise<Submission | null> {
    return this.prisma.submission.findFirst({
      where: {
        userId,
        chapterQuizId,
      },
      include: {
        chapterQuiz: {
          include: {
            chapter: true,
          },
        },
      },
    });
  }

  /**
   * Lấy tất cả submissions của user cho một course
   */
  async getSubmissionsByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: {
        userId,
        chapterQuiz: {
          chapter: {
            courseId,
          },
        },
      },
      include: {
        chapterQuiz: {
          include: {
            chapter: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  /**
   * Lấy tất cả submissions của user
   */
  async getSubmissionsByUser(userId: string): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: { userId },
      include: {
        chapterQuiz: {
          include: {
            chapter: {
              include: {
                course: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  /**
   * Kiểm tra xem user đã làm quiz này chưa
   * Trả về submission nếu có, null nếu chưa làm
   */
  async hasUserSubmittedQuiz(
    userId: string,
    chapterQuizId: string
  ): Promise<Submission | null> {
    const submission = await this.prisma.submission.findFirst({
      where: {
        userId,
        chapterQuizId,
      },
    });
    return submission;
  }

  /**
   * Đếm số submissions đã pass của user trong course
   */
  async countPassedSubmissions(
    userId: string,
    courseId: string
  ): Promise<number> {
    return this.prisma.submission.count({
      where: {
        userId,
        isPassed: true,
        chapterQuiz: {
          chapter: {
            courseId,
          },
        },
      },
    });
  }

  /**
   * Cập nhật submission (trường hợp cho phép làm lại)
   */
  async updateSubmission(
    userId: string,
    chapterQuizId: string,
    data: {
      score: number;
      maxScore: number;
      isPassed: boolean;
      answers: any;
      submittedAt: Date;
    }
  ): Promise<Submission> {
    return this.prisma.submission.updateMany({
      where: {
        userId,
        chapterQuizId,
      },
      data,
    }) as any; // Return first result
  }

  /**
   * Xóa submission
   */
  async deleteSubmission(submissionId: string): Promise<void> {
    await this.prisma.submission.delete({
      where: { submissionId },
    });
  }
}
