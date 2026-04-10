import { Request, Response, NextFunction } from "express";
import TagService from "../services/tag.service";
import TagRepository from "../repositories/tag.repository";
import prisma from "../configs/prismaClient";
import { sendSuccess, sendNotFound, sendEmpty } from "../utils/responseHelper";
import { AuthRequest } from "../types/customRequest";

class TagController {
  private tagService: TagService;

  constructor() {
    const tagRepository = new TagRepository(prisma, "tagId");
    this.tagService = new TagService(tagRepository);
  }

  /**
   * Lấy tất cả tags
   */
  getAllTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.query;
      
      let tags;
      if (type && (type === "COURSE" || type === "BLOG" || type === "GENERAL")) {
        tags = await this.tagService.getPopularTags(100, type as any);
      } else {
        tags = await this.tagService.getAllTags();
      }

      if (!tags || tags.length === 0) {
        return sendEmpty(res, "Chưa có tag nào");
      }

      return sendSuccess(res, tags, "Danh sách tags");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy tag theo ID
   */
  getTagById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tagId } = req.params;

      const tag = await this.tagService.getTagById(tagId);

      if (!tag) {
        return sendNotFound(res, "Không tìm thấy tag");
      }

      return sendSuccess(res, tag, "Thông tin tag");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy tag theo slug
   */
  getTagBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;

      const tag = await this.tagService.getTagBySlug(slug);

      if (!tag) {
        return sendNotFound(res, "Không tìm thấy tag");
      }

      return sendSuccess(res, tag, "Thông tin tag");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Tạo tag mới (Admin only)
   */
  createTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, type } = req.body;

      // Generate slug từ name
      const slug = this.tagService.generateSlug(name);

      const newTag = await this.tagService.createTag({
        name,
        slug,
        description,
        type,
      });

      return sendSuccess(res, newTag, "Tạo tag thành công", 201);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Cập nhật tag (Admin only)
   */
  updateTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tagId } = req.params;
      const { name, description, type } = req.body;

      const updateData: any = {
        description,
        type,
      };

      if (name) {
        updateData.name = name;
        updateData.slug = this.tagService.generateSlug(name);
      }

      const updatedTag = await this.tagService.updateTag(tagId, updateData);

      return sendSuccess(res, updatedTag, "Cập nhật tag thành công");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Xóa tag (Admin only)
   */
  deleteTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tagId } = req.params;

      await this.tagService.deleteTag(tagId);

      return sendSuccess(res, null, "Xóa tag thành công");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy popular tags
   */
  getPopularTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, type } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 10;

      const tags = await this.tagService.getPopularTags(
        limitNum,
        type as "COURSE" | "BLOG" | "GENERAL" | undefined
      );

      return sendSuccess(res, tags, "Tags phổ biến");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Tìm kiếm tags
   */
  searchTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit } = req.query;
      const query = q as string;
      const limitNum = limit ? parseInt(limit as string) : 10;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'q' is required",
        });
      }

      const tags = await this.tagService.searchTags(query, limitNum);

      return sendSuccess(res, tags, "Kết quả tìm kiếm");
    } catch (error) {
      return next(error);
    }
  };
}

export default TagController;
