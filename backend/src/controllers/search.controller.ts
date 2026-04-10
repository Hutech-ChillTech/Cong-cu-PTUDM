import { Request, Response, NextFunction } from "express";
import SearchService from "../services/search.service";
import TagRepository from "../repositories/tag.repository";
import prisma from "../configs/prismaClient";
import { sendSuccess, sendEmpty } from "../utils/responseHelper";

class SearchController {
  private searchService: SearchService;

  constructor() {
    const tagRepository = new TagRepository(prisma, "tagId");
    this.searchService = new SearchService(tagRepository);
  }

  /**
   * Tìm courses theo tag
   * GET /api/search/courses/by-tag/:tagSlug
   */
  searchCoursesByTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tagSlug } = req.params;
      const { skip, take } = req.query;

      const skipNum = skip ? parseInt(skip as string) : undefined;
      const takeNum = take ? parseInt(take as string) : undefined;

      const result = await this.searchService.searchCoursesByTag(tagSlug, skipNum, takeNum);

      if (!result.courses || result.courses.length === 0) {
        return sendEmpty(res, `Không tìm thấy khóa học nào với tag "${tagSlug}"`);
      }

      return sendSuccess(res, result, `Tìm thấy ${result.total} khóa học với tag "${result.tag.name}"`);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Tìm courses theo nhiều tags
   * POST /api/search/courses/by-tags
   * Body: { tags: ["nodejs", "react"] }
   */
  searchCoursesByMultipleTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tags, skip, take } = req.body;

      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tags array is required",
        });
      }

      const result = await this.searchService.searchCoursesByMultipleTags(tags, skip, take);

      if (!result.courses || result.courses.length === 0) {
        return sendEmpty(res, `Không tìm thấy khóa học nào với tags: ${tags.join(", ")}`);
      }

      return sendSuccess(res, result, `Tìm thấy ${result.total} khóa học`);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Tìm kiếm tổng hợp (courses + blogs) theo tag
   * GET /api/search/all/by-tag/:tagSlug
   */
  searchAllByTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tagSlug } = req.params;
      const { skip, take } = req.query;

      const skipNum = skip ? parseInt(skip as string) : undefined;
      const takeNum = take ? parseInt(take as string) : undefined;

      const result = await this.searchService.searchAllByTag(tagSlug, skipNum, takeNum);

      return sendSuccess(
        res,
        result,
        `Tag "${result.tag.name}": ${result.totalCourses} courses, ${result.totalBlogPosts} blog posts`
      );
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Gợi ý courses liên quan
   * GET /api/search/courses/:courseId/recommended
   */
  getRecommendedCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { limit } = req.query;

      const limitNum = limit ? parseInt(limit as string) : 5;

      const courses = await this.searchService.getRecommendedCourses(courseId, limitNum);

      if (!courses || courses.length === 0) {
        return sendEmpty(res, "Không có khóa học gợi ý");
      }

      return sendSuccess(res, courses, `${courses.length} khóa học gợi ý`);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy tags phổ biến cho CNTT
   * GET /api/search/tags/it
   */
  getITTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await this.searchService.getITTags();

      return sendSuccess(res, tags, "Tags phổ biến cho lập trình CNTT");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Tìm kiếm nâng cao
   * POST /api/search/advanced
   * Body: {
   *   query: "nodejs",
   *   tagSlugs: ["nodejs", "backend"],
   *   level: "Intermediate",
   *   minPrice: 0,
   *   maxPrice: 1000000,
   *   skip: 0,
   *   take: 10
   * }
   */
  advancedSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.body;

      const result = await this.searchService.advancedSearch(params);

      if (!result.courses || result.courses.length === 0) {
        return sendEmpty(res, "Không tìm thấy khóa học nào");
      }

      return sendSuccess(
        res,
        result,
        `Tìm thấy ${result.total} khóa học (Trang ${result.page}/${Math.ceil(result.total / result.pageSize)})`
      );
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy learning path suggestions theo tags
   * POST /api/search/learning-path
   * Body: { tags: ["nodejs", "react", "mongodb"] }
   */
  getLearningPathByTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tags } = req.body;

      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tags array is required",
        });
      }

      const suggestions = await this.searchService.getLearningPathByTags(tags);

      return sendSuccess(res, suggestions, "Lộ trình học gợi ý");
    } catch (error) {
      return next(error);
    }
  };
}

export default SearchController;
