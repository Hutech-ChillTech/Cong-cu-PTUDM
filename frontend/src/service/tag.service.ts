import axios from "axios";
import type { Tag, TagType } from "../types/blog.types";

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

export const tagService = {
  /**
   * Lấy tất cả tags
   * @param type - Optional filter by type (COURSE | BLOG | GENERAL)
   */
  getAllTags: async (type?: TagType): Promise<Tag[]> => {
    const response = await axios.get(`${API_URL}/tags`, {
      params: type ? { type } : undefined,
    });
    return response.data.data;
  },

  /**
   * Lấy tags phổ biến
   * @param limit - Số lượng tags cần lấy (default: 10)
   * @param type - Optional filter by type (COURSE | BLOG | GENERAL)
   */
  getPopularTags: async (
    limit: number = 10,
    type?: TagType,
  ): Promise<Tag[]> => {
    const response = await axios.get(`${API_URL}/tags/popular`, {
      params: { limit, ...(type && { type }) },
    });
    return response.data.data;
  },

  /**
   * Tìm kiếm tags
   * @param query - Từ khóa tìm kiếm
   * @param limit - Số lượng kết quả (default: 10)
   */
  searchTags: async (query: string, limit: number = 10): Promise<Tag[]> => {
    const response = await axios.get(`${API_URL}/tags/search`, {
      params: { q: query, limit },
    });
    return response.data.data;
  },

  /**
   * Lấy tag theo ID
   * @param tagId - ID của tag
   */
  getTagById: async (tagId: string): Promise<Tag> => {
    const response = await axios.get(`${API_URL}/tags/${tagId}`);
    return response.data.data;
  },

  /**
   * Lấy tag theo slug
   * @param slug - Slug của tag (vd: "nodejs", "react")
   */
  getTagBySlug: async (slug: string): Promise<Tag> => {
    const response = await axios.get(`${API_URL}/tags/slug/${slug}`);
    return response.data.data;
  },

  /**
   * Tạo tag mới (Admin only)
   * @param data - Dữ liệu tag
   */
  createTag: async (data: {
    name: string;
    description?: string;
    type?: "COURSE" | "BLOG" | "GENERAL";
  }): Promise<Tag> => {
    const response = await axios.post(`${API_URL}/tags`, data);
    return response.data.data;
  },

  /**
   * Cập nhật tag (Admin only)
   * @param tagId - ID của tag
   * @param data - Dữ liệu cần cập nhật
   */
  updateTag: async (
    tagId: string,
    data: Partial<{
      name: string;
      description: string;
      type: TagType;
    }>,
  ): Promise<Tag> => {
    const response = await axios.put(`${API_URL}/tags/${tagId}`, data);
    return response.data.data;
  },

  /**
   * Xóa tag (Admin only)
   * @param tagId - ID của tag
   */
  deleteTag: async (tagId: string): Promise<void> => {
    await axios.delete(`${API_URL}/tags/${tagId}`);
  },

  /**
   * Lấy tags IT phổ biến (JavaScript, Python, React, etc.)
   */
  getITTags: async (): Promise<Tag[]> => {
    const response = await axios.get(`${API_URL}/search/tags/it`);
    return response.data.data;
  },
};
