import axios from "axios";
import type {
  SearchByTagResponse,
  AdvancedSearchRequest,
  LearningPathResponse,
  CourseSearchResult,
} from "../types/blog.types";

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

export const searchService = {
  /**
   * Tìm courses theo 1 tag
   * @param tagSlug - Slug của tag (vd: "nodejs", "react")
   */
  searchCoursesByTag: async (tagSlug: string): Promise<SearchByTagResponse> => {
    const response = await axios.get(
      `${API_URL}/search/courses/by-tag/${tagSlug}`,
    );
    return response.data.data;
  },

  /**
   * Tìm courses theo nhiều tags (AND logic)
   * @param tags - Mảng các tag slugs
   */
  searchCoursesByTags: async (tags: string[]): Promise<SearchByTagResponse> => {
    const response = await axios.post(`${API_URL}/search/courses/by-tags`, {
      tags,
    });
    return response.data.data;
  },

  /**
   * Tìm cả courses và blogs theo tag
   * @param tagSlug - Slug của tag
   */
  searchAllByTag: async (tagSlug: string): Promise<SearchByTagResponse> => {
    const response = await axios.get(
      `${API_URL}/search/all/by-tag/${tagSlug}`,
    );
    return response.data.data;
  },

  /**
   * Gợi ý courses liên quan dựa trên tags
   * @param courseId - ID của course hiện tại
   * @param limit - Số lượng gợi ý (mặc định 5)
   */
  getRecommendedCourses: async (
    courseId: string,
    limit: number = 5,
  ): Promise<CourseSearchResult[]> => {
    const response = await axios.get(
      `${API_URL}/search/courses/${courseId}/recommended`,
      { params: { limit } },
    );
    return response.data.data;
  },

  /**
   * Tìm kiếm nâng cao với nhiều filters
   * @param params - Các tham số tìm kiếm
   */
  advancedSearch: async (
    params: AdvancedSearchRequest,
  ): Promise<SearchByTagResponse> => {
    const response = await axios.post(`${API_URL}/search/advanced`, params);
    return response.data.data;
  },

  /**
   * Lấy lộ trình học theo tags (grouped by level)
   * @param tags - Mảng các tag slugs
   */
  getLearningPath: async (tags: string[]): Promise<LearningPathResponse> => {
    const response = await axios.post(`${API_URL}/search/learning-path`, {
      tags,
    });
    return response.data.data;
  },
};
