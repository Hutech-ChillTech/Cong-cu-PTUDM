import { Router } from "express";
import SearchController from "../controllers/search.controller";

const router = Router();
const searchController = new SearchController();

/**
 * @route   GET /api/search/courses/by-tag/:tagSlug
 * @desc    Tìm courses theo tag
 * @access  Public
 */
router.get("/courses/by-tag/:tagSlug", searchController.searchCoursesByTag);

/**
 * @route   POST /api/search/courses/by-tags
 * @desc    Tìm courses theo nhiều tags
 * @access  Public
 */
router.post("/courses/by-tags", searchController.searchCoursesByMultipleTags);

/**
 * @route   GET /api/search/all/by-tag/:tagSlug
 * @desc    Tìm kiếm tổng hợp (courses + blogs) theo tag
 * @access  Public
 */
router.get("/all/by-tag/:tagSlug", searchController.searchAllByTag);

/**
 * @route   GET /api/search/courses/:courseId/recommended
 * @desc    Gợi ý courses liên quan
 * @access  Public
 */
router.get("/courses/:courseId/recommended", searchController.getRecommendedCourses);

/**
 * @route   GET /api/search/tags/it
 * @desc    Lấy tags phổ biến cho CNTT
 * @access  Public
 */
router.get("/tags/it", searchController.getITTags);

/**
 * @route   POST /api/search/advanced
 * @desc    Tìm kiếm nâng cao
 * @access  Public
 */
router.post("/advanced", searchController.advancedSearch);

/**
 * @route   POST /api/search/learning-path
 * @desc    Lấy learning path suggestions theo tags
 * @access  Public
 */
router.post("/learning-path", searchController.getLearningPathByTags);

export default router;
