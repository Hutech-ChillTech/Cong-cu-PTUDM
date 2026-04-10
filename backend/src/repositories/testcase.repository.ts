import { BaseRepository } from "./baseRepository";
import { Prisma, PrismaClient } from "@prisma/client";

class TestCaseRepository extends BaseRepository<
  "testCases",
  PrismaClient["testCases"], 
  Prisma.TestCasesCreateInput,
  Prisma.TestCasesUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "testCases", primaryKey);
  }

  async getTestCaseByLessonId(lessonId: string) {
    return await this.prisma.testCases.findMany({
      where: {
        lessonId,
      },
    });
  }
}

export default TestCaseRepository;
