import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class CategoryRepository extends BaseRepository<
  "category",
  PrismaClient["category"],
  Prisma.CategoryCreateInput,
  Prisma.CategoryUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string = "categoryId") {
    super(prisma, "category", primaryKey);
  }

  async findById(categoryId: string) {
    return this.prisma.category.findUnique({
      where: { categoryId },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async getRootCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { orderIndex: "asc" },
      include: {
        children: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });
  }

  async getChildren(categoryId: string) {
    return this.prisma.category.findMany({
      where: { parentId: categoryId },
      orderBy: { orderIndex: "asc" },
    });
  }

  async getPopularCategories(limit: number = 10) {
    return this.prisma.category.findMany({
      orderBy: { name: "asc" },
      take: limit,
    });
  }
}

export default CategoryRepository;
