import TagRepository from "../repositories/tag.repository";
import { Tag } from "@prisma/client";

class TagService {
  private tagRepository: TagRepository;

  constructor(tagRepository: TagRepository) {
    this.tagRepository = tagRepository;
  }

  /**
   * Lấy tất cả tags
   */
  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }

  /**
   * Lấy tag theo ID
   */
  async getTagById(tagId: string): Promise<Tag | null> {
    return this.tagRepository.findById(tagId);
  }

  /**
   * Lấy tag theo slug
   */
  async getTagBySlug(slug: string): Promise<Tag | null> {
    return this.tagRepository.findBySlug(slug);
  }

  /**
   * Tạo tag mới
   */
  async createTag(data: {
    name: string;
    slug: string;
    description?: string;
    type?: "COURSE" | "BLOG" | "GENERAL";
  }): Promise<any> {
    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.tagRepository.findBySlug(data.slug);
    if (existing) {
      throw new Error(`Tag với slug "${data.slug}" đã tồn tại`);
    }

    return this.tagRepository.create(data);
  }

  /**
   * Cập nhật tag
   */
  async updateTag(
    tagId: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      color?: string;
      type?: "COURSE" | "BLOG" | "GENERAL";
    }
  ): Promise<Tag> {
    // Nếu update slug, kiểm tra trùng lặp
    if (data.slug) {
      const existing = await this.tagRepository.findBySlug(data.slug);
      if (existing && existing.tagId !== tagId) {
        throw new Error(`Tag với slug "${data.slug}" đã tồn tại`);
      }
    }

    return this.tagRepository.update(tagId, data);
  }

  /**
   * Xóa tag
   */
  async deleteTag(tagId: string): Promise<void> {
    await this.tagRepository.delete(tagId);
  }

  /**
   * Lấy tags phổ biến
   */
  async getPopularTags(limit: number = 10, type?: "COURSE" | "BLOG" | "GENERAL"): Promise<Tag[]> {
    return this.tagRepository.getPopularTags(limit, type);
  }

  /**
   * Tìm kiếm tags
   */
  async searchTags(query: string, limit: number = 10): Promise<Tag[]> {
    return this.tagRepository.searchTags(query, limit);
  }

  /**
   * Tìm hoặc tạo tag
   */
  async findOrCreateTag(data: {
    name: string;
    slug: string;
    type?: "COURSE" | "BLOG" | "GENERAL";
  }): Promise<any> {
    return this.tagRepository.findOrCreate(data);
  }

  /**
   * Generate slug từ name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-"); // Remove multiple -
  }
}

export default TagService;
