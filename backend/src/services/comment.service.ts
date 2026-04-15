import { Prisma } from "@prisma/client";
import CommentRepository from "../repositories/comment.repository";
import createHttpError from "http-errors";

class CommentService {
  private readonly commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  /**
   * Lấy tất cả comments
   */
  async getAllComments() {
    return await this.commentRepository.getAll();
  }

  /**
   * Lấy comment theo ID
   */
  async getCommentById(commentId: string) {
    return await this.commentRepository.getById(commentId);
  }

  /**
   * Lấy tất cả comments của một khóa học
   */
  async getCommentsByCourseId(courseId: string) {
    return await this.commentRepository.getCommentsByCourseId(courseId);
  }

  /**
   * Lấy comments của một user
   */
  async getCommentsByUserId(userId: string) {
    return await this.commentRepository.getCommentsByUserId(userId);
  }

  /**
   * Tạo comment mới
   */
  async createComment(data: {
    courseId: string;
    userId: string;
    content: string;
    rating?: number;
  }) {
    // Validate rating nếu có
    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw createHttpError(400, "Rating phải từ 1 đến 5 sao");
      }
    }

    // Kiểm tra user đã comment chưa (optional - tùy business logic)
    // const hasCommented = await this.commentRepository.hasUserCommented(
    //   data.userId,
    //   data.courseId
    // );
    // if (hasCommented) {
    //   throw createHttpError(400, "Bạn đã đánh giá khóa học này rồi");
    // }

    return await this.commentRepository.create({
      content: data.content,
      rating: data.rating,
      user: { connect: { userId: data.userId } },
      course: { connect: { courseId: data.courseId } },
    });
  }

  /**
   * Cập nhật comment
   */
  async updateComment(
    commentId: string,
    userId: string,
    data: {
      content?: string;
      rating?: number;
    }
  ) {
    // Kiểm tra comment tồn tại
    const comment = await this.commentRepository.getById(commentId);
    if (!comment) {
      throw createHttpError(404, "Không tìm thấy comment");
    }

    // Kiểm tra quyền sở hữu
    if (comment.userId !== userId) {
      throw createHttpError(403, "Bạn không có quyền chỉnh sửa comment này");
    }

    // Validate rating nếu có
    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw createHttpError(400, "Rating phải từ 1 đến 5 sao");
      }
    }

    return await this.commentRepository.update(commentId, data);
  }

  /**
   * Xóa comment
   */
  async deleteComment(commentId: string, userId: string) {
    // Kiểm tra comment tồn tại
    const comment = await this.commentRepository.getById(commentId);
    if (!comment) {
      throw createHttpError(404, "Không tìm thấy comment");
    }

    // Kiểm tra quyền sở hữu
    if (comment.userId !== userId) {
      throw createHttpError(403, "Bạn không có quyền xóa comment này");
    }

    return await this.commentRepository.delete(commentId);
  }

  /**
   * Lấy rating trung bình của khóa học
   */
  async getCourseRating(courseId: string) {
    return await this.commentRepository.getAverageRating(courseId);
  }

  /**
   * Lấy replies của một comment
   */
  async getReplies(commentId: string) {
    return await this.commentRepository.getRepliesByCommentId(commentId);
  }

  /**
   * Tạo reply cho comment
   */
  async createReply(data: {
    parentId: string;
    userId: string;
    content: string;
  }) {
    // Kiểm tra parent comment tồn tại
    const parentComment = await this.commentRepository.getById(data.parentId);
    if (!parentComment) {
      throw createHttpError(404, "Không tìm thấy comment gốc");
    }

    // Không cho phép reply vào reply (chỉ 1 level)
    if (parentComment.parentId) {
      throw createHttpError(
        400,
        "Không thể reply vào một reply. Hãy reply vào comment gốc."
      );
    }

    // Tạo reply
    return await this.commentRepository.createReply({
      parentId: data.parentId,
      userId: data.userId,
      courseId: parentComment.courseId, // Lấy courseId từ parent
      content: data.content,
    });
  }
}

export default CommentService;
