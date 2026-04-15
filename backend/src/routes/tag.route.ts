import { Router } from "express";
import TagController from "../controllers/tag.controller";

const router = Router();
const tagController = new TagController();

/**
 * @route   GET /api/tags
 * @desc    Lấy tất cả tags
 * @access  Public
 */
router.get("/", tagController.getAllTags);

/**
 * @route   GET /api/tags/popular
 * @desc    Lấy tags phổ biến
 * @access  Public
 */
router.get("/popular", tagController.getPopularTags);

/**
 * @route   GET /api/tags/search
 * @desc    Tìm kiếm tags
 * @access  Public
 */
router.get("/search", tagController.searchTags);

/**
 * @route   GET /api/tags/:tagId
 * @desc    Lấy tag theo ID
 * @access  Public
 */
router.get("/:tagId", tagController.getTagById);

/**
 * @route   GET /api/tags/slug/:slug
 * @desc    Lấy tag theo slug
 * @access  Public
 */
router.get("/slug/:slug", tagController.getTagBySlug);

/**
 * @route   POST /api/tags
 * @desc    Tạo tag mới
 * @access  Admin only
 */
router.post("/", tagController.createTag);

/**
 * @route   PUT /api/tags/:tagId
 * @desc    Cập nhật tag
 * @access  Admin only
 */
router.put("/:tagId", tagController.updateTag);

/**
 * @route   DELETE /api/tags/:tagId
 * @desc    Xóa tag
 * @access  Admin only
 */
router.delete("/:tagId", tagController.deleteTag);

export default router;
