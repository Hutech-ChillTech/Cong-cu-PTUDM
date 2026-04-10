import { Prisma, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class CodeSubmissionRepository extends BaseRepository<
  "codeSubmission",
  PrismaClient["codeSubmission"],
  Prisma.CodeSubmissionCreateInput,
  Prisma.CodeSubmissionUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "codeSubmission", primaryKey);
  }
}

export default CodeSubmissionRepository;
