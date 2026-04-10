import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class ChapterRepository extends BaseRepository<"chapter",
    PrismaClient["chapter"],
    Prisma.ChapterCreateInput,
    Prisma.ChapterUpdateInput> {

    constructor(prisma: PrismaClient, primaryKey: string) {
        super(prisma, "chapter", primaryKey);
    }
}

export default ChapterRepository;