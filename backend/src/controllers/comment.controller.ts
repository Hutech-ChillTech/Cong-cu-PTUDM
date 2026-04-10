import { Request, Response, NextFunction } from "express";
import CommentService from "../services/comment.service";
import CommentRepository from "../repositories/comment.repository";
import prisma from "../configs/prismaClient";
import { sendSuccess, sendNotFound, sendEmpty } from "../utils/responseHelper";
import { AuthRequest } from "../types/customRequest";

class CommentController {
  private commentService: CommentService;

  constructor() {
    const commentRepository = new CommentRepository(prisma, "commentId");
    this.commentService = new CommentService(commentRepository);
  }

  /**
   * Lấy tất cả comments
   */
  getAllComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comments = await this.commentService.getAllComments();

      if (!comments || comments.length === 0) {
        return sendEmpty(res, "Chưa có comment nào");
      }

      return sendSuccess(res, comments, "Danh sách comments");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy comment theo ID
   */
  getCommentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;

      const comment = await this.commentService.getCommentById(commentId);

      if (!comment) {
        return sendNotFound(res, "Không tìm thấy comment");
      }

      return sendSuccess(res, comment, "Thông tin comment");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy tất cả comments của một khóa học
   */
  getCommentsByCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;

      const comments = await this.commentService.getCommentsByCourseId(
        courseId
      );

      if (!comments || comments.length === 0) {
        return sendEmpty(res, "Khóa học chưa có comment nào");
      }

      return sendSuccess(res, comments, "Danh sách comments của khóa học");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy rating trung bình của khóa học
   */
  getCourseRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;

      const rating = await this.commentService.getCourseRating(courseId);

      return sendSuccess(res, rating, "Đánh giá khóa học");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy comments của user hiện tại
   */
  getMyComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const comments = await this.commentService.getCommentsByUserId(userId);

      if (!comments || comments.length === 0) {
        return sendEmpty(res, "Bạn chưa có comment nào");
      }

      return sendSuccess(res, comments, "Danh sách comments của bạn");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Tạo comment mới
   */
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { courseId, content, rating } = req.body;

      const newComment = await this.commentService.createComment({
        courseId,
        userId,
        content,
        rating: rating ? parseInt(rating) : undefined,
      });

      return sendSuccess(res, newComment, "Tạo comment thành công", 201);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Cập nhật comment
   */
  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { commentId } = req.params;
      const { content, rating } = req.body;

      const updatedComment = await this.commentService.updateComment(
        commentId,
        userId,
        {
          content,
          rating: rating ? parseInt(rating) : undefined,
        }
      );

      return sendSuccess(res, updatedComment, "Cập nhật comment thành công");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Xóa comment
   */
  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { commentId } = req.params;

      await this.commentService.deleteComment(commentId, userId);

      return sendSuccess(res, null, "Xóa comment thành công");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lấy replies của một comment
   */
  getReplies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;

      const replies = await this.commentService.getReplies(commentId);

      if (!replies || replies.length === 0) {
        return sendEmpty(res, "Comment chưa có reply nào");
      }

      return sendSuccess(res, replies, "Danh sách replies");
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Tạo reply cho comment
   */
  createReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { commentId } = req.params;
      const { content } = req.body;

      const newReply = await this.commentService.createReply({
        parentId: commentId,
        userId,
        content,
      });

      return sendSuccess(res, newReply, "Tạo reply thành công", 201);
    } catch (error) {
      return next(error);
    }
  };
}

export default CommentController;
