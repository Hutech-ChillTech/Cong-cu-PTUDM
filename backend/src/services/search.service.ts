import prisma from "../configs/prismaClient";
import { Course, Tag } from "@prisma/client";
import TagRepository from "../repositories/tag.repository";

/**
 * Service để tìm kiếm courses và blogs theo tags
 * Tối ưu cho website học lập trình CNTT
 */
class SearchService {
  private tagRepository: TagRepository;

  constructor(tagRepository: TagRepository) {
    this.tagRepository = tagRepository;
  }

  /**
   * Tìm courses theo tag slug
   */
  async searchCoursesByTag(tagSlug: string, skip?: number, take?: number): Promise<any> {
    const tag = await this.tagRepository.findBySlug(tagSlug);
    if (!tag) {
      throw new Error(`Tag "${tagSlug}" không tồn tại`);
    }

    const courses = await prisma.course.findMany({
      where: {
        courseTags: {
          some: {
            tag: {
              slug: tagSlug,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        courseTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            comments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take,
    });

    return {
      tag,
      courses,
      total: courses.length,
    };
  }

  /**
   * Tìm courses theo nhiều tags (AND logic)
   */
  async searchCoursesByMultipleTags(tagSlugs: string[], skip?: number, take?: number): Promise<any> {
    const courses = await prisma.course.findMany({
      where: {
        AND: tagSlugs.map((slug) => ({
          courseTags: {
            some: {
              tag: {
                slug,
              },
            },
          },
        })),
      },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        courseTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            comments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take,
    });

    return {
      tags: tagSlugs,
      courses,
      total: courses.length,
    };
  }

  /**
   * Tìm kiếm tổng hợp (courses + blogs) theo tag
   */
  async searchAllByTag(tagSlug: string, skip?: number, take?: number): Promise<any> {
    const tag = await this.tagRepository.findBySlug(tagSlug);
    if (!tag) {
      throw new Error(`Tag "${tagSlug}" không tồn tại`);
    }

    // Tìm courses
    const courses = await prisma.course.findMany({
      where: {
        courseTags: {
          some: {
            tag: {
              slug: tagSlug,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        courseTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: take || 10,
    });

    // Tìm blog posts
    const blogPosts = await prisma.blogPost.findMany({
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
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: take || 10,
    });

    return {
      tag,
      courses,
      blogPosts,
      totalCourses: courses.length,
      totalBlogPosts: blogPosts.length,
    };
  }

  /**
   * Gợi ý courses dựa trên tags của course hiện tại
   */
  async getRecommendedCourses(courseId: string, limit: number = 5): Promise<Course[]> {
    // Lấy tags của course hiện tại
    const currentCourse = await prisma.course.findUnique({
      where: { courseId },
      include: {
        courseTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!currentCourse || !currentCourse.courseTags.length) {
      return [];
    }

    const tagIds = currentCourse.courseTags.map((ct) => ct.tagId);

    // Tìm courses có chung tags
    const recommendedCourses = await prisma.course.findMany({
      where: {
        courseId: { not: courseId },
        courseTags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        courseTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    return recommendedCourses;
  }

  /**
   * Lấy tags phổ biến cho CNTT (IT Education)
   */
  async getITTags(): Promise<Tag[]> {
    // Danh sách tags phổ biến cho lập trình CNTT
    const itTagSlugs = [
      "javascript",
      "python",
      "java",
      "csharp",
      "nodejs",
      "react",
      "angular",
      "vue",
      "typescript",
      "html",
      "css",
      "sql",
      "mongodb",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "git",
      "api",
      "rest",
      "graphql",
      "microservices",
      "devops",
      "ci-cd",
      "testing",
      "security",
      "ai",
      "machine-learning",
      "data-science",
      "blockchain",
    ];

    return prisma.tag.findMany({
      where: {
        slug: { in: itTagSlugs },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Tìm kiếm nâng cao với filters
   */
  async advancedSearch(params: {
    query?: string;
    tagSlugs?: string[];
    level?: "Basic" | "Intermediate" | "Advanced";
    minPrice?: number;
    maxPrice?: number;
    skip?: number;
    take?: number;
  }): Promise<any> {
    const where: any = {};

    // Text search
    if (params.query) {
      where.OR = [
        { courseName: { contains: params.query, mode: "insensitive" } },
        { courseDescription: { contains: params.query, mode: "insensitive" } },
      ];
    }

    // Filter by tags
    if (params.tagSlugs && params.tagSlugs.length > 0) {
      where.courseTags = {
        some: {
          tag: {
            slug: { in: params.tagSlugs },
          },
        },
      };
    }

    // Filter by level
    if (params.level) {
      where.level = params.level;
    }

    // Filter by price
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.coursePrice = {};
      if (params.minPrice !== undefined) {
        where.coursePrice.gte = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        where.coursePrice.lte = params.maxPrice;
      }
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            avatarURL: true,
          },
        },
        courseTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            comments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: params.skip,
      take: params.take,
    });

    const total = await prisma.course.count({ where });

    return {
      courses,
      total,
      page: params.skip && params.take ? Math.floor(params.skip / params.take) + 1 : 1,
      pageSize: params.take || courses.length,
    };
  }

  /**
   * Lấy learning path suggestions dựa trên tags
   */
  async getLearningPathByTags(tagSlugs: string[]): Promise<any> {
    // Tìm courses theo từng tag và sắp xếp theo level
    const suggestions: any = {};

    for (const tagSlug of tagSlugs) {
      const courses = await prisma.course.findMany({
        where: {
          courseTags: {
            some: {
              tag: {
                slug: tagSlug,
              },
            },
          },
        },
        include: {
          courseTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [
          { level: "asc" }, // Basic → Intermediate → Advanced
          { created_at: "desc" },
        ],
      });

      suggestions[tagSlug] = {
        basic: courses.filter((c) => c.level === "Basic"),
        intermediate: courses.filter((c) => c.level === "Intermediate"),
        advanced: courses.filter((c) => c.level === "Advanced"),
      };
    }

    return suggestions;
  }
}

export default SearchService;
