import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class QuizQuestionRepository extends BaseRepository<
  "quizQuestion",
  PrismaClient["quizQuestion"],
  Prisma.QuizQuestionCreateInput,
  Prisma.QuizQuestionUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "quizQuestion", primaryKey);
  }

  async findByQuizId(chapterQuizId: string) {
    return await this.prisma.quizQuestion.findMany({
      where: { chapterQuizId },
      include: {
        quizOptions: true,
        chapterQuiz: {
          select: {
            chapterQuizId: true,
            title: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });
  }

  async findByIdWithOptions(quizQuestionId: string) {
    return await this.prisma.quizQuestion.findUnique({
      where: { quizQuestionId },
      include: {
        quizOptions: true,
        chapterQuiz: {
          select: {
            chapterQuizId: true,
            title: true,
          },
        },
      },
    });
  }

  async countByQuiz(chapterQuizId: string) {
    return await this.prisma.quizQuestion.count({
      where: { chapterQuizId },
    });
  }
}

export default QuizQuestionRepository;
