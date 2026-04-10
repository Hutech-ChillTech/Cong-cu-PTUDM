import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class BlogRepository extends BaseRepository<
  "blogPost",
  PrismaClient["blogPost"],
  Prisma.BlogPostCreateInput,
  Prisma.BlogPostUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string = "blogPostId") {
    super(prisma, "blogPost", primaryKey);
  }

  async findBySlug(slug: string) {
    return this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async findById(blogPostId: string) {
    return this.prisma.blogPost.findUnique({
      where: { blogPostId },
      include: {
        author: true,
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async getPublishedPosts(skip?: number, take?: number) {
    return this.prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
      },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
    });
  }

  async getFeaturedPosts(limit: number = 5) {
    return this.prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        isFeatured: true,
      },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }

  async findByTag(tagSlug: string, skip?: number, take?: number) {
    return this.prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        tags: {
          some: {
            tag: {
              slug: tagSlug,
            },
          },
        },
      },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
    });
  }

  async findByCategory(categorySlug: string, skip?: number, take?: number) {
    return this.prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        categories: {
          some: {
            category: {
              slug: categorySlug,
            },
          },
        },
      },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
    });
  }

  async findByAuthor(authorId: string, skip?: number, take?: number) {
    return this.prisma.blogPost.findMany({
      where: {
        authorId,
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
    });
  }

  async searchPosts(query: string, skip?: number, take?: number) {
    return this.prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
    });
  }

  async incrementViewCount(blogPostId: string) {
    return this.prisma.blogPost.update({
      where: { blogPostId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async incrementLikeCount(blogPostId: string) {
    return this.prisma.blogPost.update({
      where: { blogPostId },
      data: { likeCount: { increment: 1 } },
    });
  }

  async decrementLikeCount(blogPostId: string) {
    return this.prisma.blogPost.update({
      where: { blogPostId },
      data: { likeCount: { decrement: 1 } },
    });
  }

  async getPopularPosts(limit: number = 10) {
    return this.prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
      },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { viewCount: "desc" },
      take: limit,
    });
  }

  async getRelatedPosts(blogPostId: string, limit: number = 5) {
    const currentPost = await this.prisma.blogPost.findUnique({
      where: { blogPostId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!currentPost || !currentPost.tags.length) {
      return [];
    }

    const tagIds = currentPost.tags.map((t: any) => t.tagId);

    return this.prisma.blogPost.findMany({
      where: {
        blogPostId: { not: blogPostId },
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        tags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }
}

export default BlogRepository;
