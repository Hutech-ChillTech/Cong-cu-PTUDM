import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class LessonRepository extends BaseRepository<
  "lesson",
  PrismaClient["lesson"],
  Prisma.LessonCreateInput,
  Prisma.LessonUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "lesson", primaryKey);
  }
}

export default LessonRepository;
