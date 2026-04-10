import { Router } from "express";
import CategoryController from "../controllers/category.controller";

const router = Router();
const categoryController = new CategoryController();

/**
 * @route   GET /api/categories
 * @desc    Lấy tất cả categories
 * @access  Public
 */
router.get("/", categoryController.getAllCategories);

/**
 * @route   GET /api/categories/root
 * @desc    Lấy root categories (hierarchy)
 * @access  Public
 */
router.get("/root", categoryController.getRootCategories);

/**
 * @route   GET /api/categories/popular
 * @desc    Lấy categories phổ biến
 * @access  Public
 */
router.get("/popular", categoryController.getPopularCategories);

/**
 * @route   GET /api/categories/:categoryId
 * @desc    Lấy category theo ID
 * @access  Public
 */
router.get("/:categoryId", categoryController.getCategoryById);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Lấy category theo slug
 * @access  Public
 */
router.get("/slug/:slug", categoryController.getCategoryBySlug);

/**
 * @route   GET /api/categories/:categoryId/children
 * @desc    Lấy children của category
 * @access  Public
 */
router.get("/:categoryId/children", categoryController.getChildren);

/**
 * @route   POST /api/categories
 * @desc    Tạo category mới
 * @access  Admin only
 */
router.post("/", categoryController.createCategory);

/**
 * @route   PUT /api/categories/:categoryId
 * @desc    Cập nhật category
 * @access  Admin only
 */
router.put("/:categoryId", categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:categoryId
 * @desc    Xóa category
 * @access  Admin only
 */
router.delete("/:categoryId", categoryController.deleteCategory);

export default router;
