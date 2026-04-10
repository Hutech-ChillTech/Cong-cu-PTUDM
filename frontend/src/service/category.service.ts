import axios from "axios";
import type { Category } from "../types/blog.types";

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

export const categoryService = {
  /**
   * Lấy tất cả categories
   */
  getAllCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data.data;
  },

  /**
   * Lấy categories gốc (parent = null) kèm children nested
   */
  getRootCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/categories/root`);
    return response.data.data;
  },

  /**
   * Lấy categories phổ biến
   * @param limit - Số lượng categories
   */
  getPopularCategories: async (limit: number = 10): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/categories/popular`, {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Lấy category theo ID
   * @param categoryId - ID của category
   */
  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await axios.get(`${API_URL}/categories/${categoryId}`);
    return response.data.data;
  },

  /**
   * Lấy category theo slug
   * @param slug - Slug của category
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await axios.get(`${API_URL}/categories/slug/${slug}`);
    return response.data.data;
  },

  /**
   * Lấy child categories
   * @param parentId - ID của parent category
   */
  getChildCategories: async (parentId: string): Promise<Category[]> => {
    const response = await axios.get(
      `${API_URL}/categories/${parentId}/children`,
    );
    return response.data.data;
  },

  /**
   * Tạo category mới (Admin only)
   * @param data - Dữ liệu category
   */
  createCategory: async (data: {
    name: string;
    description?: string;
    parentId?: string;
    orderIndex?: number;
  }): Promise<Category> => {
    const response = await axios.post(`${API_URL}/categories`, data);
    return response.data.data;
  },

  /**
   * Cập nhật category (Admin only)
   * @param categoryId - ID của category
   * @param data - Dữ liệu cần cập nhật
   */
  updateCategory: async (
    categoryId: string,
    data: Partial<{
      name: string;
      description: string;
      parentId: string;
      orderIndex: number;
    }>,
  ): Promise<Category> => {
    const response = await axios.put(
      `${API_URL}/categories/${categoryId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Xóa category (Admin only)
   * @param categoryId - ID của category
   */
  deleteCategory: async (categoryId: string): Promise<void> => {
    await axios.delete(`${API_URL}/categories/${categoryId}`);
  },
};
