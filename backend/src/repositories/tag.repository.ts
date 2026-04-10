import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class TagRepository extends BaseRepository<
  "tag",
  PrismaClient["tag"],
  Prisma.TagCreateInput,
  Prisma.TagUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string = "tagId") {
    super(prisma, "tag", primaryKey);
  }

  async findById(tagId: string) {
    return this.prisma.tag.findUnique({
      where: { tagId },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.tag.findUnique({
      where: { slug },
    });
  }

  async findByName(name: string) {
    return this.prisma.tag.findUnique({
      where: { name },
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
  }

  async getPopularTags(limit: number = 10, type?: "COURSE" | "BLOG" | "GENERAL") {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    return this.prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      take: limit,
    });
  }

  async findOrCreate(data: { name: string; slug: string; type?: "COURSE" | "BLOG" | "GENERAL" }) {
    const existing = await this.findBySlug(data.slug);
    if (existing) {
      return existing;
    }

    return this.prisma.tag.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type || "GENERAL",
      },
    });
  }

  async searchTags(query: string, limit: number = 10) {
    return this.prisma.tag.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: limit,
    });
  }
}

export default TagRepository;
