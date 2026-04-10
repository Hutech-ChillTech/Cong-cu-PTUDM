// Blog & Tag System Types
// Based on backend documentation: BLOG_TAG_CATEGORY_API.md
// Last updated: 2025-12-07

export type TagType = "COURSE" | "BLOG" | "GENERAL";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";

/**
 * Tag interface - matches backend schema
 * No usage/count fields as per updated backend
 */
export interface Tag {
  tagId: string;
  name: string;
  slug: string;
  description?: string;
  type: TagType;
  created_at: string;
  updated_at: string;
}

/**
 * Category interface - supports hierarchical structure
 * No postCount field as per updated backend
 */
export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  orderIndex: number;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
}

/**
 * Blog Post interface - complete schema with SEO and stats
 */
export interface BlogPost {
  blogPostId: string;

  // Content
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Status & Publishing
  status: BlogStatus;
  publishedAt?: string;
  scheduledAt?: string;

  // Stats
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount: number;
  readingTime?: number;

  // Author
  authorId: string;

  // Featured
  isFeatured: boolean;
  isPinned: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations
  author?: {
    userId: string;
    userName: string;
    avatarURL?: string;
  };
  categories?: BlogPostCategory[];
  tags?: BlogPostTag[];
  comments?: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface BlogPostCategory {
  id: string;
  blogPostId: string;
  categoryId: string;
  category: Category;
}

export interface BlogPostTag {
  id: string;
  blogPostId: string;
  tagId: string;
  tag: Tag;
}

export interface BlogLike {
  id: string;
  blogPostId: string;
  userId: string;
  createdAt: string;
}

export interface BlogBookmark {
  id: string;
  blogPostId: string;
  userId: string;
  note?: string;
  createdAt: string;
}

// Request/Response Types
export interface CreateBlogPostRequest {
  title: string;
  slug?: string; // Optional, auto-generated from title if not provided
  content: string;
  excerpt?: string;
  coverImage?: string;

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Status & Publishing
  status?: BlogStatus;
  scheduledAt?: string;

  // Relations
  categoryIds?: string[];
  tagIds?: string[];

  // Featured
  isFeatured?: boolean;
  isPinned?: boolean;
  readingTime?: number;
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  blogPostId: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchByTagResponse {
  tag: Tag;
  courses?: CourseSearchResult[];
  blogs?: BlogPost[];
  total: number;
}

export interface CourseSearchResult {
  courseId: string;
  courseName: string;
  courseDescription?: string;
  coursePrice?: number;
  avatarURL?: string;
  level?: string;
  _count?: {
    enrollments?: number;
  };
}

export interface AdvancedSearchRequest {
  query?: string;
  tagSlugs?: string[];
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  skip?: number;
  take?: number;
}

export interface LearningPathRequest {
  tags: string[];
}

export interface LearningPathResponse {
  [tagSlug: string]: {
    basic: CourseSearchResult[];
    intermediate: CourseSearchResult[];
    advanced: CourseSearchResult[];
  };
}
