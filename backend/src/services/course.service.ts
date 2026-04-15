import { Prisma, Level } from "@prisma/client";
import CourseRepository from "../repositories/course.repository";

class CourseService {
  private readonly courseRepo: CourseRepository;
  constructor(courseRepo: CourseRepository) {
    this.courseRepo = courseRepo;
  }

  async getCourseById(courseId: string) {
    return await this.courseRepo.getById(courseId);
  }

  async getCourseByName(courseName: string) {
    return await this.courseRepo.getCourseByName(courseName);
  }

  async searchCourseByName(searchTerm: string, limit?: number) {
    return await this.courseRepo.searchCourseByName(searchTerm, limit);
  }

  async getCourseByNamePrefix(prefix: string) {
    return await this.courseRepo.getCourseByNamePrefix(prefix);
  }

  async getAllCourse(skip?: number, take?: number) {
    return await this.courseRepo.getAll({ skip, take });
  }

  async getAllSort(
    sortField: string = "created_at",
    sortOrder: string = "desc",
    skip?: number,
    take?: number
  ) {
    const safeOrder = sortOrder === "desc" ? "desc" : "asc";
    return this.courseRepo.getAllSorted(sortField, safeOrder, { skip, take });
  }

  async getCourseWithDetails(courseId: string) {
    return await this.courseRepo.getCourseWithDetails(courseId);
  }

  async getCoursesByLevel(level: Level, skip?: number, take?: number) {
    return await this.courseRepo.getCoursesByLevel(level, { skip, take });
  }

  async getCoursesByCreator(userId: string, skip?: number, take?: number) {
    return await this.courseRepo.getCoursesByCreator(userId, { skip, take });
  }

  async getPopularCourses(limit?: number) {
    return await this.courseRepo.getPopularCourses(limit);
  }

  async getCourseStats(courseId: string) {
    return await this.courseRepo.getCourseStats(courseId);
  }

  async filterCourses(filters: {
    level?: Level;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    skip?: number;
    take?: number;
  }) {
    return await this.courseRepo.filterCourses(filters);
  }

  async countCourses(filters?: {
    level?: Level;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
  }) {
    return await this.courseRepo.countCourses(filters);
  }

  async getCourseWithChaptersAndLessons(courseId: string) {
    return await this.courseRepo.getCourseWithChaptersAndLessons(courseId);
  }

  /**
   * Lấy danh sách khóa học mà user đã mua (enrolled)
   */
  async getEnrolledCourses(userId: string, skip?: number, take?: number) {
    return await this.courseRepo.getEnrolledCourses(userId, { skip, take });
  }

  /**
   * Kiểm tra user đã mua khóa học chưa
   */
  async checkUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    return await this.courseRepo.checkUserEnrolled(userId, courseId);
  }

  /**
   * Lấy danh sách courseId mà user đã enroll
   */
  async getUserEnrolledCourseIds(userId: string): Promise<string[]> {
    return await this.courseRepo.getUserEnrolledCourseIds(userId);
  }

  /**
   * Thêm field isEnrolled vào danh sách courses
   */
  async addEnrollmentStatus(courses: any[], userId?: string) {
    if (!userId) {
      return courses.map((course) => ({ ...course, isEnrolled: false }));
    }

    const enrolledCourseIds = await this.getUserEnrolledCourseIds(userId);
    const enrolledSet = new Set(enrolledCourseIds);

    return courses.map((course) => ({
      ...course,
      isEnrolled: enrolledSet.has(course.courseId),
    }));
  }

  async createCourse(course: Prisma.CourseCreateInput) {
    const existing = await this.courseRepo.getCourseByName(course.courseName);
    if (existing && existing.length > 0) {
      throw new Error("Tên khóa học đã tồn tại");
    }
    return this.courseRepo.create(course);
  }

  async updateCourse(courseId: string, course: Prisma.CourseUpdateInput) {
    const existing = await this.courseRepo.getById(courseId);
    if (!existing) {
      throw new Error("Khóa học chưa tồn tại");
    }
    return this.courseRepo.update(courseId, course);
  }

  async deleteCourse(courseId: string) {
    const existing = await this.courseRepo.getById(courseId);
    if (!existing) {
      throw new Error("Khóa học chưa tồn tại");
    }
    return this.courseRepo.delete(courseId);
  }
}

export default CourseService;
