import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DownOutlined,
  UpOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  StarFilled,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { Rate, message, Progress, Badge, Button } from "antd";
import styles from "../../styles/UserCourseDetail.module.css";
import { quizService } from "../../service/quiz.service";
import { commentService } from "../../service/comment.service";
import {
  progressService,
  type CourseProgress,
} from "../../service/progress.service";
import { certificateService } from "../../service/certificate.service";
import type { Comment, CourseRating } from "../../service/comment.service";
import type { Certificate } from "../../service/certificate.service";

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

interface Lesson {
  lessonId: string;
  lessonName: string;
  lessonDuration?: string;
  previewURL?: string;
}

interface Chapter {
  chapterId: string;
  chapterName: string;
  totalLesson: number;
  lessons: Lesson[];
}

interface Course {
  courseId: string;
  courseName: string;
  courseDescription: string;
  coursePrice: number;
  discount?: number | null;
  avatarURL: string | null;
  level: string;
  chapters: Chapter[];
  isEnrolled?: boolean; // Backend tự động trả về
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [chapterQuizzes, setChapterQuizzes] = useState<{
    [key: string]: boolean;
  }>({});

  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const [courseRating, setCourseRating] = useState<CourseRating | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null,
  );
  const [replyContent, setReplyContent] = useState("");
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null,
  );
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/courses/${id}/content`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.data.success) {
          const courseData = res.data.data;
          setCourse(courseData);

          // If enrolled, fetch progress and certificate
          if (courseData.isEnrolled && id) {
            fetchProgressAndCertificate(id);
          }

          // Fetch quizzes for each chapter
          const quizMap: { [key: string]: boolean } = {};
          for (const chapter of courseData.chapters || []) {
            try {
              const quizzes = await quizService.getQuizzesByChapter(
                chapter.chapterId,
              );
              quizMap[chapter.chapterId] = quizzes && quizzes.length > 0;
            } catch {
              quizMap[chapter.chapterId] = false;
            }
          }
          setChapterQuizzes(quizMap);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết khóa học:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!id) return;
      try {
        const [commentsData, ratingData] = await Promise.all([
          commentService.getCommentsByCourse(id),
          commentService.getCourseRating(id),
        ]);
        setComments(commentsData);
        setCourseRating(ratingData);
      } catch (err) {
        console.error("Lỗi khi tải bình luận:", err);
      }
    };

    const fetchCurrentUser = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.userId);
        } catch {
          setCurrentUserId(null);
        }
      }
    };

    const fetchProgressAndCertificate = async (courseId: string) => {
      try {
        const [progressData, certificateData] = await Promise.all([
          progressService.getCourseProgress(courseId),
          certificateService.getUserCertificateInCourse(courseId),
        ]);
        setCourseProgress(progressData);
        setCertificate(certificateData);
      } catch (err) {
        console.error("Lỗi khi tải tiến độ và chứng chỉ:", err);
      }
    };

    if (id) {
      fetchCourseDetail();
      fetchComments();
      fetchCurrentUser();
    }
  }, [id]);

  const handleDownloadCertificate = () => {
    // Priority: pdfUrl > viewUrl > certificateURL
    const url =
      certificate?.pdfUrl ||
      certificate?.viewUrl ||
      certificate?.certificateURL;

    if (!url) {
      message.info("Chứng chỉ đang được xử lý, vui lòng thử lại sau");
      return;
    }

    let certUrl: string;

    if (certificate?.pdfUrl) {
      // BEST: Cloudinary URL - use directly
      certUrl = certificate.pdfUrl;
    } else if (certificate?.viewUrl) {
      // GOOD: Backend normalized URL
      certUrl = `${import.meta.env.VITE_BACKEND_URL}${certificate.viewUrl}`;
    } else if (certificate?.certificateURL) {
      // FALLBACK: Legacy format
      if (certificate.certificateURL.startsWith("http")) {
        certUrl = certificate.certificateURL;
      } else if (certificate.certificateURL.startsWith("/certificates/")) {
        certUrl = `${import.meta.env.VITE_BACKEND_URL}${certificate.certificateURL}`;
      } else {
        certUrl = `${import.meta.env.VITE_BACKEND_URL}/certificates/view/${certificate.certificateURL}`;
      }
    } else {
      message.error("URL chứng chỉ không hợp lệ");
      return;
    }

    window.open(certUrl, "_blank");
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapter((prev) => (prev === chapterId ? null : chapterId));
  };

  const handleTryLesson = () => {
    if (course?.courseId) {
      navigate(`/practice/${course.courseId}`);
    }
  };

  const handleBuyNow = () => {
    if (course?.courseId) {
      navigate(`/payment?courseId=${course.courseId}`);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận");
      return;
    }

    if (!id) return;

    try {
      await commentService.createComment({
        courseId: id,
        content: newComment,
        rating: newRating || undefined,
      });

      message.success("Đã gửi bình luận thành công!");
      setNewComment("");
      setNewRating(0);

      // Refresh comments
      const [commentsData, ratingData] = await Promise.all([
        commentService.getCommentsByCourse(id),
        commentService.getCourseRating(id),
      ]);
      setComments(commentsData);
      setCourseRating(ratingData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "Không thể gửi bình luận");
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.commentId);
    setEditContent(comment.content);
    setEditRating(comment.rating || 0);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      await commentService.updateComment(commentId, {
        content: editContent,
        rating: editRating || undefined,
      });

      message.success("Đã cập nhật bình luận!");
      setEditingCommentId(null);

      // Refresh comments
      if (id) {
        const [commentsData, ratingData] = await Promise.all([
          commentService.getCommentsByCourse(id),
          commentService.getCourseRating(id),
        ]);
        setComments(commentsData);
        setCourseRating(ratingData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(
        error.response?.data?.message || "Không thể cập nhật bình luận",
      );
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      message.success("Đã xóa bình luận!");

      // Refresh comments
      if (id) {
        const [commentsData, ratingData] = await Promise.all([
          commentService.getCommentsByCourse(id),
          commentService.getCourseRating(id),
        ]);
        setComments(commentsData);
        setCourseRating(ratingData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "Không thể xóa bình luận");
    }
  };

  const handleReplyComment = (commentId: string) => {
    setReplyingToCommentId(commentId);
    setReplyContent("");
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) {
      message.warning("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      await commentService.createReply(commentId, replyContent);
      message.success("Đã gửi trả lời!");
      setReplyingToCommentId(null);
      setReplyContent("");

      // Refresh comments
      if (id) {
        const commentsData = await commentService.getCommentsByCourse(id);
        setComments(commentsData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "Không thể gửi trả lời");
    }
  };

  if (loading)
    return <div className={styles.loading}>Đang tải dữ liệu khóa học...</div>;

  if (!course)
    return <div className={styles.notFound}>Không tìm thấy khóa học.</div>;

  const totalLessons =
    course.chapters?.reduce((acc, ch) => acc + (ch.totalLesson || 0), 0) || 0;

  const totalQuizzes = Object.values(chapterQuizzes).filter(Boolean).length;
  const totalItems = totalLessons + totalQuizzes;

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.courseImageWrapper}>
            <img
              src={course.avatarURL || "/images/default-course.jpg"}
              alt={course.courseName}
              className={styles.courseImage}
            />
          </div>

          <div className={styles.courseInfo}>
            <div className={styles.levelBadge}>{course.level}</div>

            <h1 className={styles.courseTitle}>{course.courseName}</h1>
            <p className={styles.courseDescription}>
              {course.courseDescription}
            </p>

            <div className={styles.courseStats}>
              <div>
                <BookOutlined /> {course.chapters?.length || 0} chương
              </div>
              <div>
                <PlayCircleOutlined /> {totalItems} bài ({totalLessons} lessons
                + {totalQuizzes} quizzes)
              </div>
              {courseRating && (
                <div>
                  <StarFilled style={{ color: "#fadb14" }} />{" "}
                  {courseRating.averageRating.toFixed(1)} (
                  {courseRating.totalRatings} đánh giá)
                </div>
              )}
            </div>

            <div className={styles.priceBlock}>
              <div className={styles.coursePrice}>
                {course.coursePrice.toLocaleString("vi-VN")}đ
              </div>
              {course.discount && (
                <div className={styles.discount}>Giảm {course.discount}%</div>
              )}
            </div>

            {course.isEnrolled && courseProgress && (
              <div className={styles.progressSection}>
                <div className={styles.progressInfo}>
                  <span className={styles.progressText}>
                    Tiến độ học tập: {courseProgress.progress}%
                  </span>
                  {courseProgress.progress === 100 && (
                    <Badge
                      count={
                        <span className={styles.completedBadge}>
                          <FileDoneOutlined /> Đã hoàn thành khóa học
                        </span>
                      }
                    />
                  )}
                </div>
                <Progress
                  percent={courseProgress.progress}
                  status={
                    courseProgress.progress === 100 ? "success" : "active"
                  }
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                />
              </div>
            )}

            <div className={styles.buttonGroup}>
              {course.isEnrolled ? (
                <div className={styles.enrolledActions}>
                  <button
                    className={styles.continueButton}
                    onClick={() => navigate(`/practice/${course.courseId}`)}
                  >
                    Tiếp tục học
                  </button>
                  {certificate && (
                    <Button
                      type="primary"
                      icon={<SafetyCertificateOutlined />}
                      className={styles.certificateButton}
                      onClick={handleDownloadCertificate}
                    >
                      Tải chứng chỉ
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <button
                    className={styles.tryButton}
                    onClick={handleTryLesson}
                  >
                    Học thử
                  </button>
                  <button className={styles.buyButton} onClick={handleBuyNow}>
                    Mua ngay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className={styles.contentSection}>
        <h2 className={styles.sectionTitle}>Nội dung khóa học</h2>
        <p className={styles.sectionDesc}>
          {course.courseDescription ||
            "Khóa học này đang được cập nhật nội dung."}
        </p>
      </div>

      {/* Chapters Section */}
      <div className={styles.chaptersSection}>
        <h2 className={styles.sectionTitle}>Chương trình học</h2>

        {course.chapters && course.chapters.length > 0 ? (
          course.chapters.map((chapter, index) => {
            const hasQuiz = chapterQuizzes[chapter.chapterId];
            const totalItems = chapter.totalLesson + (hasQuiz ? 1 : 0);

            return (
              <div key={chapter.chapterId} className={styles.chapterCard}>
                <div
                  className={styles.chapterHeader}
                  onClick={() => toggleChapter(chapter.chapterId)}
                >
                  <div className={styles.chapterHeaderLeft}>
                    <div className={styles.chapterNumber}>{index + 1}</div>
                    <h4 className={styles.chapterTitle}>
                      {chapter.chapterName}
                    </h4>
                  </div>

                  <div className={styles.chapterHeaderRight}>
                    <span>{totalItems} bài học</span>
                    {expandedChapter === chapter.chapterId ? (
                      <UpOutlined className={styles.icon} />
                    ) : (
                      <DownOutlined className={styles.icon} />
                    )}
                  </div>
                </div>

                {expandedChapter === chapter.chapterId && (
                  <div className={styles.lessonList}>
                    {chapter.lessons && chapter.lessons.length > 0
                      ? chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.lessonId}
                            className={styles.lessonItem}
                          >
                            <div className={styles.lessonLeft}>
                              <PlayCircleOutlined />
                              <span>{lesson.lessonName}</span>
                            </div>
                            <div className={styles.lessonRight}>
                              {lesson.lessonDuration && (
                                <span className={styles.duration}>
                                  <ClockCircleOutlined />{" "}
                                  {lesson.lessonDuration}
                                </span>
                              )}
                              {lesson.previewURL && (
                                <a
                                  href={lesson.previewURL}
                                  className={styles.previewButton}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Xem trước
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      : null}

                    {hasQuiz && (
                      <div
                        className={`${styles.lessonItem} ${styles.quizItem}`}
                      >
                        <div className={styles.lessonLeft}>
                          <QuestionCircleOutlined />
                          <span>Bài trắc nghiệm</span>
                        </div>
                        <div className={styles.lessonRight}>
                          <span className={styles.quizBadge}>Quiz</span>
                        </div>
                      </div>
                    )}

                    {!chapter.lessons?.length && !hasQuiz && (
                      <div className={styles.noLesson}>
                        Chương này đang được cập nhật bài học
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.noChapter}>
            <BookOutlined /> Hiện chưa có chương trình học.
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className={styles.commentSection}>
        <h2 className={styles.sectionTitle}>
          Bình luận khóa học
          {courseRating && (
            <span className={styles.ratingBadge}>
              <StarFilled /> {courseRating.averageRating.toFixed(1)} / 5.0
            </span>
          )}
        </h2>

        {/* New Comment Form */}
        <div className={styles.commentForm}>
          <div className={styles.ratingInput}>
            <span>Đánh giá của bạn:</span>
            <Rate value={newRating} onChange={setNewRating} />
          </div>

          <textarea
            placeholder="Chia sẻ suy nghĩ của bạn về khóa học này..."
            className={styles.commentBox}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <button
            className={styles.commentButton}
            onClick={handleSubmitComment}
          >
            Gửi bình luận
          </button>
        </div>

        {/* Comments List */}
        <div className={styles.commentsList}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.commentId} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentUser}>
                    <img
                      src={
                        comment.user.avatarURL || "/images/default-avatar.png"
                      }
                      alt={comment.user.userName}
                      className={styles.userAvatar}
                    />
                    <div>
                      <div className={styles.userName}>
                        {comment.user.userName}
                      </div>
                      <div className={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </div>
                    </div>
                  </div>

                  {currentUserId === comment.userId && (
                    <div className={styles.commentActions}>
                      <button onClick={() => handleEditComment(comment)}>
                        <EditOutlined /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.commentId)}
                      >
                        <DeleteOutlined /> Xóa
                      </button>
                    </div>
                  )}
                </div>

                {comment.rating && (
                  <div className={styles.commentRating}>
                    <Rate disabled value={comment.rating} />
                  </div>
                )}

                {editingCommentId === comment.commentId ? (
                  <div className={styles.editForm}>
                    <Rate value={editRating} onChange={setEditRating} />
                    <textarea
                      className={styles.commentBox}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className={styles.editActions}>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleUpdateComment(comment.commentId)}
                      >
                        Lưu
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() => setEditingCommentId(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={styles.commentContent}>{comment.content}</p>

                    {/* Reply Button */}
                    {!comment.parentId && (
                      <button
                        className={styles.replyButton}
                        onClick={() => handleReplyComment(comment.commentId)}
                      >
                        Trả lời
                      </button>
                    )}
                  </>
                )}

                {/* Reply Form */}
                {replyingToCommentId === comment.commentId && (
                  <div className={styles.replyForm}>
                    <textarea
                      placeholder="Nhập câu trả lời của bạn..."
                      className={styles.replyBox}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <div className={styles.replyActions}>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleSubmitReply(comment.commentId)}
                      >
                        Gửi
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() => setReplyingToCommentId(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies List */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className={styles.repliesList}>
                    {comment.replies.map((reply) => (
                      <div key={reply.commentId} className={styles.replyItem}>
                        <div className={styles.commentHeader}>
                          <div className={styles.commentUser}>
                            <img
                              src={
                                reply.user.avatarURL ||
                                "/images/default-avatar.png"
                              }
                              alt={reply.user.userName}
                              className={styles.userAvatar}
                            />
                            <div>
                              <div className={styles.userName}>
                                {reply.user.userName}
                              </div>
                              <div className={styles.commentDate}>
                                {new Date(reply.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </div>
                            </div>
                          </div>

                          {currentUserId === reply.userId && (
                            <div className={styles.commentActions}>
                              <button
                                onClick={() =>
                                  handleDeleteComment(reply.commentId)
                                }
                              >
                                <DeleteOutlined /> Xóa
                              </button>
                            </div>
                          )}
                        </div>

                        <p className={styles.commentContent}>{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noComment}>
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
