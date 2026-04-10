import { Router } from "express";
import CommentController from "../controllers/comment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  createCommentSchema,
  updateCommentSchema,
  createReplySchema,
} from "../validators/comment.validate";
import {
  publicContentLimiter,
  readLimiter,
  createLimiter,
} from "../middlewares/rateLimiter.middleware";

const router = Router();
const commentController = new CommentController();

/**
 * @route   GET /api/comments
 * @desc    Lấy tất cả comments (Admin)
 * @access  Private
 */
router.get("/", readLimiter, authenticate, commentController.getAllComments);

/**
 * @route   GET /api/comments/my-comments
 * @desc    Lấy comments của user hiện tại
 * @access  Private
 */
router.get(
  "/my-comments",
  readLimiter,
  authenticate,
  commentController.getMyComments
);

/**
 * @route   GET /api/comments/course/:courseId
 * @desc    Lấy tất cả comments của một khóa học
 * @access  Public
 */
router.get(
  "/course/:courseId",
  publicContentLimiter,
  commentController.getCommentsByCourse
);

/**
 * @route   GET /api/comments/course/:courseId/rating
 * @desc    Lấy rating trung bình của khóa học
 * @access  Public
 */
router.get(
  "/course/:courseId/rating",
  publicContentLimiter,
  commentController.getCourseRating
);

/**
 * @route   GET /api/comments/:commentId
 * @desc    Lấy comment theo ID
 * @access  Public
 */
router.get(
  "/:commentId",
  publicContentLimiter,
  commentController.getCommentById
);

/**
 * @route   POST /api/comments
 * @desc    Tạo comment mới
 * @access  Private
 */
router.post(
  "/",
  createLimiter,
  authenticate,
  validate(createCommentSchema),
  commentController.createComment
);

/**
 * @route   PUT /api/comments/:commentId
 * @desc    Cập nhật comment
 * @access  Private (Owner only)
 */
router.put(
  "/:commentId",
  createLimiter,
  authenticate,
  validate(updateCommentSchema),
  commentController.updateComment
);

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Xóa comment
 * @access  Private (Owner only)
 */
router.delete(
  "/:commentId",
  createLimiter,
  authenticate,
  commentController.deleteComment
);

/**
 * @route   GET /api/comments/:commentId/replies
 * @desc    Lấy tất cả replies của một comment
 * @access  Public
 */
router.get(
  "/:commentId/replies",
  publicContentLimiter,
  commentController.getReplies
);

/**
 * @route   POST /api/comments/:commentId/reply
 * @desc    Tạo reply cho comment
 * @access  Private
 */
router.post(
  "/:commentId/reply",
  createLimiter,
  authenticate,
  validate(createReplySchema),
  commentController.createReply
);

export default router;
