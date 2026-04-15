import { Request, Response, NextFunction } from "express";
import CategoryService from "../services/category.service";
import CategoryRepository from "../repositories/category.repository";
import prisma from "../configs/prismaClient";
import { sendSuccess, sendNotFound, sendEmpty } from "../utils/responseHelper";

class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    const categoryRepository = new CategoryRepository(prisma, "categoryId");
    this.categoryService = new CategoryService(categoryRepository);
  }

  /**
   * Lấy tất cả categories
   */
  getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getAllCategories();

      if (!categories || categories.length === 0) {
        return sendEmpty(res, "Chưa có category nào");
      }

      return sendSuccess(res, categories, "Danh sách categories");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy root categories (hierarchy)
   */
  getRootCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getRootCategories();

      if (!categories || categories.length === 0) {
        return sendEmpty(res, "Chưa có category nào");
      }

      return sendSuccess(res, categories, "Danh sách root categories");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy category theo ID
   */
  getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;

      const category = await this.categoryService.getCategoryById(categoryId);

      if (!category) {
        return sendNotFound(res, "Không tìm thấy category");
      }

      return sendSuccess(res, category, "Thông tin category");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy category theo slug
   */
  getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;

      const category = await this.categoryService.getCategoryBySlug(slug);

      if (!category) {
        return sendNotFound(res, "Không tìm thấy category");
      }

      return sendSuccess(res, category, "Thông tin category");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Tạo category mới (Admin only)
   */
  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, icon, color, coverImage, parentId, orderIndex } = req.body;

      // Generate slug từ name
      const slug = this.categoryService.generateSlug(name);

      const newCategory = await this.categoryService.createCategory({
        name,
        slug,
        description,
        icon,
        color,
        coverImage,
        parentId,
        orderIndex,
      });

      return sendSuccess(res, newCategory, "Tạo category thành công", 201);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Cập nhật category (Admin only)
   */
  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const { name, description, icon, color, coverImage, parentId, orderIndex } = req.body;

      const updateData: any = {
        description,
        icon,
        color,
        coverImage,
        parentId,
        orderIndex,
      };

      if (name) {
        updateData.name = name;
        updateData.slug = this.categoryService.generateSlug(name);
      }

      const updatedCategory = await this.categoryService.updateCategory(categoryId, updateData);

      return sendSuccess(res, updatedCategory, "Cập nhật category thành công");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Xóa category (Admin only)
   */
  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;

      await this.categoryService.deleteCategory(categoryId);

      return sendSuccess(res, null, "Xóa category thành công");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy children của category
   */
  getChildren = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;

      const children = await this.categoryService.getChildren(categoryId);

      if (!children || children.length === 0) {
        return sendEmpty(res, "Category không có children");
      }

      return sendSuccess(res, children, "Danh sách children");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy popular categories
   */
  getPopularCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 10;

      const categories = await this.categoryService.getPopularCategories(limitNum);

      return sendSuccess(res, categories, "Categories phổ biến");
    } catch (error) {
      return next(error);
    }
  };
}

export default CategoryController;
