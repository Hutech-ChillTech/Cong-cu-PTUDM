import { PrismaClient, BlogStatus } from "@prisma/client";
import BlogRepository from "../repositories/blog.repository";

interface CreateBlogPostDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status?: BlogStatus;
  publishedAt?: Date | string;
  scheduledAt?: Date | string;
  isFeatured?: boolean;
  isPinned?: boolean;
  authorId: string;
  tagIds?: string[];
  categoryIds?: string[];
}

interface UpdateBlogPostDto {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status?: BlogStatus;
  publishedAt?: Date | string;
  scheduledAt?: Date | string;
  isFeatured?: boolean;
  isPinned?: boolean;
  tagIds?: string[];
  categoryIds?: string[];
}

class BlogService {
  private prisma: PrismaClient;
  private blogRepository: BlogRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.blogRepository = new BlogRepository(this.prisma);
  }

  async getAllPosts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    authorId?: string,
    status?: BlogStatus,
    tagId?: string,
    categoryId?: string
  ) {
    const skip = (page - 1) * limit;

    // Build filter query
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (authorId) {
      where.authorId = authorId;
    }

    if (status) {
      where.status = status;
    }

    // Filter by tag
    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId
        }
      };
    }

    // Filter by category
    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId
        }
      };
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          author: {
             select: {
               userId: true,
               userName: true,
               avatarURL: true
             }
          },
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(id: string) {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new Error("Blog post not found");
    return post;
  }

  async getPostBySlug(slug: string) {
    const post = await this.blogRepository.findBySlug(slug);
    if (!post) throw new Error("Blog post not found");
    // Increment view count
    await this.blogRepository.incrementViewCount(post.blogPostId);
    return post;
  }

  async createPost(data: CreateBlogPostDto) {
    const { tagIds, categoryIds, authorId, ...postData } = data;

    // Transform publishedAt/scheduledAt to Date objects if needed
    const processedData: any = { ...postData };
    if (processedData.publishedAt) processedData.publishedAt = new Date(processedData.publishedAt);
    if (processedData.scheduledAt) processedData.scheduledAt = new Date(processedData.scheduledAt);

    // Handle Tags & Categories connections
    const createData: any = {
      ...processedData,
      // Connect author using relation instead of authorId field
      author: {
        connect: { userId: authorId }
      }
    };

    if (tagIds && tagIds.length > 0) {
      createData.tags = {
        create: tagIds.map((tagId) => ({
          tag: { connect: { tagId } },
        })),
      };
    }

    if (categoryIds && categoryIds.length > 0) {
      createData.categories = {
        create: categoryIds.map((categoryId) => ({
          category: { connect: { categoryId } },
        })),
      };
    }

    return this.prisma.blogPost.create({
      data: createData,
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            email: true,
            avatarURL: true
          }
        },
        tags: {
          include: { tag: true }
        },
        categories: {
          include: { category: true }
        },
      }
    });
  }

  async updatePost(id: string, data: UpdateBlogPostDto) {
    const { tagIds, categoryIds, ...postData } = data;

    const processedData: any = { ...postData };
    if (processedData.publishedAt) processedData.publishedAt = new Date(processedData.publishedAt);
    if (processedData.scheduledAt) processedData.scheduledAt = new Date(processedData.scheduledAt);

    // Prepare update data
    const updateData: any = {
      ...processedData,
    };

    // Update Tags (Delete all existing and recreate)
    // This is a simple strategy. A more complex one would diff the lists.
    if (tagIds) {
      // First delete existing relations
      await this.prisma.blogPostTag.deleteMany({ where: { blogPostId: id } });
      
      // Then create new ones
      if (tagIds.length > 0) {
        updateData.tags = {
          create: tagIds.map((tagId) => ({
            tag: { connect: { tagId } },
          })),
        };
      }
    }

    // Update Categories
    if (categoryIds) {
       await this.prisma.blogPostCategory.deleteMany({ where: { blogPostId: id } });
       
       if (categoryIds.length > 0) {
        updateData.categories = {
          create: categoryIds.map((categoryId) => ({
            category: { connect: { categoryId } },
          })),
        };
       }
    }

    return this.prisma.blogPost.update({
      where: { blogPostId: id },
      data: updateData,
      include: {
        tags: true,
        categories: true
      }
    });
  }

  async deletePost(id: string) {
    return this.blogRepository.delete(id);
  }

  async getFeaturedPosts() {
    return this.blogRepository.getFeaturedPosts();
  }
}

export default BlogService;
