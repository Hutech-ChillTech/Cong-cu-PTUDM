import { LearningPathRepository } from "../repositories/learningPath.repository";

export class LearningPathService {
  private learningPathRepo: LearningPathRepository;

  constructor() {
    this.learningPathRepo = new LearningPathRepository();
  }

  /**
   * Lấy tất cả Learning Paths với filters
   */
  async getAllLearningPaths(filters: {
    level?: string;
    isPublished?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.learningPathRepo.findAllWithFilters(filters);
  }

  /**
   * Lấy chi tiết Learning Path theo ID
   */
  async getLearningPathById(learningPathId: string) {
    const path = await this.learningPathRepo.findByIdWithDetails(
      learningPathId
    );

    if (!path) {
      throw new Error("Learning Path không tồn tại");
    }

    // Tính tổng thời gian ước tính từ các khóa học
    const totalEstimatedHours = path.courses.reduce(
      (sum: number, pathCourse: any) => {
        return sum + (pathCourse.course.estimatedDuration || 0);
      },
      0
    );

    // Tính tổng giá
    const totalPrice = path.courses.reduce((sum: number, pathCourse: any) => {
      const price = pathCourse.course.coursePrice || 0;
      const discount = pathCourse.course.discount || 0;
      return sum + (price - (price * discount) / 100);
    }, 0);

    return {
      ...path,
      totalEstimatedHours,
      totalPrice,
      totalCourses: path.courses.length,
    };
  }

  /**
   * Tạo Learning Path mới
   */
  async createLearningPath(data: {
    title: string;
    description?: string;
    level: string;
    estimatedHours?: number;
    isPublished?: boolean;
    createdBy?: string;
  }) {
    // Validate level
    const validLevels = ["Basic", "Intermediate", "Advanced"];
    if (!validLevels.includes(data.level)) {
      throw new Error(`Level phải là một trong: ${validLevels.join(", ")}`);
    }

    return this.learningPathRepo.createLearningPath(data);
  }

  /**
   * Cập nhật Learning Path
   */
  async updateLearningPath(
    learningPathId: string,
    data: Partial<{
      title: string;
      description: string;
      level: string;
      estimatedHours: number;
      isPublished: boolean;
    }>
  ) {
    // Kiểm tra path có tồn tại không
    const exists = await this.learningPathRepo.findById(learningPathId);
    if (!exists) {
      throw new Error("Learning Path không tồn tại");
    }

    // Validate level nếu có
    if (data.level) {
      const validLevels = ["Basic", "Intermediate", "Advanced"];
      if (!validLevels.includes(data.level)) {
        throw new Error(`Level phải là một trong: ${validLevels.join(", ")}`);
      }
    }

    return this.learningPathRepo.updateLearningPath(learningPathId, data);
  }

  /**
   * Xóa Learning Path
   */
  async deleteLearningPath(learningPathId: string) {
    const exists = await this.learningPathRepo.findById(learningPathId);
    if (!exists) {
      throw new Error("Learning Path không tồn tại");
    }

    return this.learningPathRepo.deleteLearningPath(learningPathId);
  }

  /**
   * Thêm khóa học vào Learning Path
   */
  async addCourseToPath(data: {
    learningPathId: string;
    courseId: string;
    orderIndex?: number;
    isRequired?: boolean;
  }) {
    // Kiểm tra path có tồn tại không
    const path = await this.learningPathRepo.findById(data.learningPathId);
    if (!path) {
      throw new Error("Learning Path không tồn tại");
    }

    // Kiểm tra course đã có trong path chưa
    const exists = await this.learningPathRepo.isCourseInPath(
      data.learningPathId,
      data.courseId
    );
    if (exists) {
      throw new Error("Khóa học đã có trong Learning Path");
    }

    // Nếu không có orderIndex, lấy số lượng courses hiện tại + 1
    let orderIndex: number = data.orderIndex || 0;
    if (orderIndex === 0) {
      const count = await this.learningPathRepo.getCoursesCount(
        data.learningPathId
      );
      orderIndex = count + 1;
    }

    return this.learningPathRepo.addCourseToPath({
      learningPathId: data.learningPathId,
      courseId: data.courseId,
      orderIndex,
      isRequired: data.isRequired ?? true,
    });
  }

  /**
   * Xóa khóa học khỏi Learning Path
   */
  async removeCourseFromPath(learningPathId: string, courseId: string) {
    const exists = await this.learningPathRepo.isCourseInPath(
      learningPathId,
      courseId
    );
    if (!exists) {
      throw new Error("Khóa học không có trong Learning Path");
    }

    return this.learningPathRepo.removeCourseFromPath(learningPathId, courseId);
  }

  /**
   * Sắp xếp lại thứ tự khóa học trong Learning Path
   */
  async reorderCourses(
    learningPathId: string,
    courseOrders: Array<{ courseId: string; orderIndex: number }>
  ) {
    const path = await this.learningPathRepo.findById(learningPathId);
    if (!path) {
      throw new Error("Learning Path không tồn tại");
    }

    // Validate các courseId có trong path không
    const coursesInPath = await this.learningPathRepo.getCoursesInPath(
      learningPathId
    );
    const pathCourseIds = coursesInPath.map((c: any) => c.courseId);

    for (const { courseId } of courseOrders) {
      if (!pathCourseIds.includes(courseId)) {
        throw new Error(`Course ${courseId} không có trong Learning Path`);
      }
    }

    return this.learningPathRepo.updateCourseOrder(
      learningPathId,
      courseOrders
    );
  }

  /**
   * User follow Learning Path
   */
  async followLearningPath(userId: string, learningPathId: string) {
    // Kiểm tra path có tồn tại không
    const path = await this.learningPathRepo.findById(learningPathId);
    if (!path) {
      throw new Error("Learning Path không tồn tại");
    }

    // Kiểm tra path có published không
    if (!path.isPublished) {
      throw new Error("Learning Path chưa được công khai");
    }

    // Kiểm tra user đã follow chưa
    const alreadyFollowing = await this.learningPathRepo.isUserFollowingPath(
      userId,
      learningPathId
    );
    if (alreadyFollowing) {
      throw new Error("Bạn đã follow Learning Path này rồi");
    }

    return this.learningPathRepo.followLearningPath(userId, learningPathId);
  }

  /**
   * User unfollow Learning Path
   */
  async unfollowLearningPath(userId: string, learningPathId: string) {
    const isFollowing = await this.learningPathRepo.isUserFollowingPath(
      userId,
      learningPathId
    );
    if (!isFollowing) {
      throw new Error("Bạn chưa follow Learning Path này");
    }

    return this.learningPathRepo.unfollowLearningPath(userId, learningPathId);
  }

  /**
   * Lấy các Learning Paths mà user đang follow
   */
  async getUserLearningPaths(userId: string) {
    return this.learningPathRepo.getUserLearningPaths(userId);
  }

  /**
   * Cập nhật progress của user trong Learning Path
   */
  async updateUserProgress(
    userId: string,
    learningPathId: string,
    completedCourseIds: string[]
  ) {
    // Lấy tổng số courses trong path
    const courses = await this.learningPathRepo.getCoursesInPath(
      learningPathId
    );
    const totalCourses = courses.length;

    if (totalCourses === 0) {
      throw new Error("Learning Path chưa có khóa học nào");
    }

    // Tính progress (%)
    const completedCount = completedCourseIds.length;
    const progress = Math.round((completedCount / totalCourses) * 100);
    const isCompleted = progress >= 100;

    return this.learningPathRepo.updateUserProgress(
      userId,
      learningPathId,
      progress,
      isCompleted
    );
  }

  /**
   * Lấy thống kê Learning Path
   */
  async getLearningPathStats(learningPathId: string) {
    const path = await this.learningPathRepo.findById(learningPathId);
    if (!path) {
      throw new Error("Learning Path không tồn tại");
    }

    const stats = await this.learningPathRepo.getPathStats(learningPathId);
    const coursesCount = await this.learningPathRepo.getCoursesCount(
      learningPathId
    );

    return {
      ...stats,
      coursesCount,
      completionRate:
        stats.totalFollowers > 0
          ? Math.round((stats.completedFollowers / stats.totalFollowers) * 100)
          : 0,
    };
  }

  /**
   * Lấy các khóa học trong Learning Path
   */
  async getCoursesInPath(learningPathId: string) {
    const path = await this.learningPathRepo.findById(learningPathId);
    if (!path) {
      throw new Error("Learning Path không tồn tại");
    }

    return this.learningPathRepo.getCoursesInPath(learningPathId);
  }

  /**
   * Lấy Learning Paths phổ biến
   */
  async getPopularLearningPaths(limit: number = 10) {
    const result = await this.learningPathRepo.findAllWithFilters({
      isPublished: true,
      limit,
    });

    // Sort theo số lượng followers
    const sorted = result.paths.sort((a: any, b: any) => {
      return b._count.userLearningPaths - a._count.userLearningPaths;
    });

    return {
      paths: sorted,
      pagination: result.pagination,
    };
  }

  /**
   * Gợi ý Learning Path dựa trên level của user
   */
  async suggestLearningPaths(userLevel?: string, limit: number = 5) {
    const filters: any = {
      isPublished: true,
      limit,
    };

    if (userLevel) {
      filters.level = userLevel;
    }

    return this.learningPathRepo.findAllWithFilters(filters);
  }
}

export default new LearningPathService();
