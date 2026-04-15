import axiosInstance, { API_URL } from "../configs/axios";
import type {
  BlogPost,
  BlogListResponse,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogStatus,
} from "../types/blog.types";

export const blogService = {
  /**
   * Lấy danh sách blog posts (có phân trang)
   * @param params - Tham số phân trang và filter
   */
  getBlogPosts: async (params?: {
    page?: number;
    limit?: number;
    status?: BlogStatus;
    sort?: "new" | "popular" | "trending";
    category?: string; // slug
    tag?: string; // slug
    search?: string;
    // Keep these if verified custom, otherwise they might not work with strict API
    authorId?: string;
    featured?: boolean;
  }): Promise<BlogListResponse> => {
    const apiParams = {
      ...params,
      limit:
        params?.limit ||
        ((params as Record<string, unknown>)?.pageSize as number | undefined),
      category:
        params?.category ||
        ((params as Record<string, unknown>)?.categoryId as string | undefined),
      tag:
        params?.tag ||
        ((params as Record<string, unknown>)?.tagSlug as string | undefined),
    };
    const response = await axiosInstance.get(`${API_URL}/blog-posts`, {
      params: apiParams,
    });

    console.log("Blog API Response:", response.data);

    // Backend trả về: {posts: [], pagination: {page, limit, total, totalPages}}
    const { posts = [], pagination = {} } = response.data;

    return {
      posts,
      total: pagination.total || 0,
      page: pagination.page || 1,
      pageSize: pagination.limit || 10,
      totalPages: pagination.totalPages || 0,
    };
  },

  /**
   * Lấy blog post theo ID
   * @param blogPostId - ID của blog post
   */
  getBlogPostById: async (blogPostId: string): Promise<BlogPost> => {
    const response = await axiosInstance.get(
      `${API_URL}/blog-posts/${blogPostId}`,
    );
    console.log("getBlogPostById response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Lấy blog post theo slug
   * @param slug - Slug của blog post
   */
  getBlogPostBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await axiosInstance.get(
      `${API_URL}/blog-posts/slug/${slug}`,
    );
    console.log("getBlogPostBySlug response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Tạo blog post mới
   * @param data - Dữ liệu blog post
   */
  createBlogPost: async (data: CreateBlogPostRequest): Promise<BlogPost> => {
    const response = await axiosInstance.post(
      `${API_URL}/blog-posts`,
      data,
    );
    return response.data.data;
  },

  /**
   * Cập nhật blog post
   * @param blogPostId - ID của blog post
   * @param data - Dữ liệu cần cập nhật
   */
  updateBlogPost: async (
    blogPostId: string,
    data: Partial<UpdateBlogPostRequest>,
  ): Promise<BlogPost> => {
    const response = await axiosInstance.put(
      `${API_URL}/blog-posts/${blogPostId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Xóa blog post
   * @param blogPostId - ID của blog post
   */
  /**
   * Delete blog post
   */
  deleteBlogPost: async (blogPostId: string): Promise<void> => {
    await axiosInstance.delete(`${API_URL}/blog-posts/${blogPostId}`);
  },

  /**
   * Publish blog post
   * NOTE: This is not in the MD, but keeping it if custom.
   * If strictly MD, this might be an Update call with status='PUBLISHED'.
   */
  publishBlogPost: async (blogPostId: string): Promise<BlogPost> => {
    // Assuming this endpoint still exists or we should use update
    const response = await axiosInstance.post(
      `${API_URL}/blog-posts/${blogPostId}/publish`,
    );
    return response.data.data;
  },

  /**
   * Toggle Like blog post
   * @param blogPostId - ID của blog post
   */
  toggleLikeBlogPost: async (blogPostId: string): Promise<void> => {
    await axiosInstance.post(`${API_URL}/blog-posts/${blogPostId}/like`);
  },

  /**
   * Toggle Bookmark blog post
   * @param blogPostId - ID của blog post
   * @param note - Ghi chú (optional)
   */
  toggleBookmarkBlogPost: async (
    blogPostId: string,
    note?: string,
  ): Promise<void> => {
    await axiosInstance.post(
      `${API_URL}/blog-posts/${blogPostId}/bookmark`,
      { note },
    );
  },

  // Legacy/Deprecated wrappers to avoid breaking changes if possible, or remove them.
  // Converting them to use the new endpoints.

  likeBlogPost: async (blogPostId: string): Promise<void> => {
    await axiosInstance.post(`${API_URL}/blog-posts/${blogPostId}/like`);
  },

  unlikeBlogPost: async (blogPostId: string): Promise<void> => {
    // MD says POST is toggle. So calling it again toggles it off?
    await axiosInstance.post(`${API_URL}/blog-posts/${blogPostId}/like`);
  },

  bookmarkBlogPost: async (
    blogPostId: string,
    note?: string,
  ): Promise<void> => {
    await axiosInstance.post(
      `${API_URL}/blog-posts/${blogPostId}/bookmark`,
      { note },
    );
  },

  removeBookmark: async (blogPostId: string): Promise<void> => {
    // MD says toggle.
    await axiosInstance.post(
      `${API_URL}/blog-posts/${blogPostId}/bookmark`,
    );
  },

  /**
   * Lấy blog posts đã bookmark
   */
  getBookmarkedPosts: async (): Promise<BlogPost[]> => {
    // Note: getBookmarkedPosts not explicitly in MD list but implied as useful.
    // Assuming endpoint if exists, else using getBlogPosts?
    // Using api/blogs/bookmarks in original. Changing key to blog-posts
    const response = await axiosInstance.get(
      `${API_URL}/blog-posts/bookmarks`,
    );
    return response.data.data;
  },

  /**
   * Lấy featured blog posts
   * @param limit - Số lượng posts
   */
  getFeaturedPosts: async (limit: number = 5): Promise<BlogPost[]> => {
    const response = await axiosInstance.get(
      `${API_URL}/blog-posts/featured`,
      {
        params: { limit },
      },
    );
    return response.data.data;
  },

  /**
   * Lấy blog posts liên quan
   * @param blogPostId - ID của blog post hiện tại
   * @param limit - Số lượng posts
   */
  getRelatedPosts: async (
    blogPostId: string,
    limit: number = 5,
  ): Promise<BlogPost[]> => {
    const response = await axiosInstance.get(
      `${API_URL}/blog-posts/${blogPostId}/related`,
      { params: { limit } },
    );
    return response.data.data;
  },

  /**
   * Tăng view count
   * @param blogPostId - ID của blog post
   */
  incrementViewCount: async (blogPostId: string): Promise<void> => {
    // Not in MD, but if exists
    await axiosInstance.post(`${API_URL}/blog-posts/${blogPostId}/view`);
  },
};
