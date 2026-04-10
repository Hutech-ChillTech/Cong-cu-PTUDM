import CategoryRepository from "../repositories/category.repository";
import { Category } from "@prisma/client";

class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor(categoryRepository: CategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  /**
   * Lấy tất cả categories
   */
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  /**
   * Lấy root categories (hierarchy)
   */
  async getRootCategories(): Promise<Category[]> {
    return this.categoryRepository.getRootCategories();
  }

  /**
   * Lấy category theo ID
   */
  async getCategoryById(categoryId: string): Promise<Category | null> {
    return this.categoryRepository.findById(categoryId);
  }

  /**
   * Lấy category theo slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findBySlug(slug);
  }

  /**
   * Tạo category mới
   */
  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    coverImage?: string;
    parentId?: string;
    orderIndex?: number;
  }): Promise<Category> {
    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.categoryRepository.findBySlug(data.slug);
    if (existing) {
      throw new Error(`Category với slug "${data.slug}" đã tồn tại`);
    }

    return this.categoryRepository.create(data);
  }

  /**
   * Cập nhật category
   */
  async updateCategory(
    categoryId: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      color?: string;
      coverImage?: string;
      parentId?: string;
      orderIndex?: number;
    }
  ): Promise<Category> {
    // Nếu update slug, kiểm tra trùng lặp
    if (data.slug) {
      const existing = await this.categoryRepository.findBySlug(data.slug);
      if (existing && existing.categoryId !== categoryId) {
        throw new Error(`Category với slug "${data.slug}" đã tồn tại`);
      }
    }

    return this.categoryRepository.update(categoryId, data);
  }

  /**
   * Xóa category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    // Kiểm tra có children không
    const children = await this.categoryRepository.getChildren(categoryId);
    if (children.length > 0) {
      throw new Error("Không thể xóa category có children. Vui lòng xóa children trước.");
    }

    await this.categoryRepository.delete(categoryId);
  }

  /**
   * Lấy children của category
   */
  async getChildren(categoryId: string): Promise<Category[]> {
    return this.categoryRepository.getChildren(categoryId);
  }

  /**
   * Lấy popular categories
   */
  async getPopularCategories(limit: number = 10): Promise<Category[]> {
    return this.categoryRepository.getPopularCategories(limit);
  }

  /**
   * Generate slug từ name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
}

export default CategoryService;
