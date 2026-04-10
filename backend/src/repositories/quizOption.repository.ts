import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class QuizOptionRepository extends BaseRepository<
  "quizOption",
  PrismaClient["quizOption"],
  Prisma.QuizOptionCreateInput,
  Prisma.QuizOptionUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "quizOption", primaryKey);
  }

  async findByQuestionId(quizQuestionId: string) {
    return await this.prisma.quizOption.findMany({
      where: { quizQuestionId },
      include: {
        quizQuestion: {
          select: {
            quizQuestionId: true,
            questionText: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });
  }

  async findCorrectOptions(quizQuestionId: string) {
    return await this.prisma.quizOption.findMany({
      where: {
        quizQuestionId,
        isCorrect: true,
      },
    });
  }

  async countByQuestion(quizQuestionId: string) {
    return await this.prisma.quizOption.count({
      where: { quizQuestionId },
    });
  }
}

export default QuizOptionRepository;
