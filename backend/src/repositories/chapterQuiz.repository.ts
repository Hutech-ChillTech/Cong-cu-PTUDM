import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class ChapterQuizRepository extends BaseRepository<
  "chapterQuiz",
  PrismaClient["chapterQuiz"],
  Prisma.ChapterQuizCreateInput,
  Prisma.ChapterQuizUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "chapterQuiz", primaryKey);
  }

  async findByChapterId(chapterId: string) {
    return await this.prisma.chapterQuiz.findMany({
      where: { chapterId },
      include: {
        chapter: {
          select: {
            chapterId: true,
            chapterName: true,
            courseId: true,
          },
        },
        quizQuestions: {
          include: {
            quizOptions: true,
          },
        },
        _count: {
          select: {
            quizQuestions: true,
            submissions: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async findByIdWithDetails(chapterQuizId: string) {
    return await this.prisma.chapterQuiz.findUnique({
      where: { chapterQuizId },
      include: {
        chapter: {
          select: {
            chapterId: true,
            chapterName: true,
            courseId: true,
          },
        },
        quizQuestions: {
          include: {
            quizOptions: true,
          },
          orderBy: { created_at: "asc" },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });
  }

  async countByChapter(chapterId: string) {
    return await this.prisma.chapterQuiz.count({
      where: { chapterId },
    });
  }
}

export default ChapterQuizRepository;
