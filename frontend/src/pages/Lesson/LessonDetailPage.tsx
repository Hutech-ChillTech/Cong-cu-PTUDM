import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { message, Modal } from "antd";
import LectureListComponent from "../../components/Lecture/LectureListComponent";
import LessonDescriptionComponent from "../../components/Lecture/LectureDescriptionComponent";
import CompilerComponent from "../../components/Compiler/CompilerComponent";
import VideoLessonPlayer from "../../components/video/videoLessonComponent";
import styles from "../../styles/LessonDetailPage.module.css";

// Import Types & Services
import {
  type Course,
  type Lesson,
  type TestCase,
} from "../../types/database.types";
import { courseService } from "../../service/course.service";
import { lessonService } from "../../service/lesson.service";
import QuizComponent from "../../components/Quiz/QuizComponent";
import { progressService } from "../../service/progress.service";
import { learningSpeedService } from "../../service/learningSpeed.service";
import { certificateService } from "../../service/certificate.service";
import XPNotification from "../../components/Gamification/XPNotification";
import { useCourseTracking } from "../../hooks/useCourseTracking";

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

interface RecommendedCourse {
  courseId: string;
  courseName: string;
  courseDescription?: string;
  coursePrice?: number;
  avatarURL?: string;
  level?: string;
}

const PracticePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  // Auto-track course completion time
  useCourseTracking(courseId || "", !!courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState<
    RecommendedCourse[]
  >([]);
  const [learningSpeed, setLearningSpeed] = useState<string>("");
  const [recommendationReason, setRecommendationReason] = useState<string>("");
  const [certificateURL, setCertificateURL] = useState<string>("");
  const [actualHours, setActualHours] = useState<number>(0);
  const [estimatedHours, setEstimatedHours] = useState<number>(0);

  const [currentLessonPos, setCurrentLessonPos] = useState({
    chapterIndex: 0,
    lessonIndex: 0,
  });

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("Kết quả sẽ hiển thị ở đây");
  const [lessonTestCases, setLessonTestCases] = useState<TestCase[]>([]);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);

  // XP Notification state
  const [xpReward, setXpReward] = useState<{
    xpAwarded: number;
    description?: string;
    leveledUp?: boolean;
    newLevel?: string;
    achievementUnlocked?: { name: string; icon: string; xpReward: number };
  } | null>(null);

  // Course completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  useEffect(() => {
    const checkChapterQuiz = async () => {
      if (!course?.chapters || currentLessonPos.chapterIndex < 0) return;

      const currentChapter = course.chapters[currentLessonPos.chapterIndex];
      if (!currentChapter?.chapterId) return;

      try {
        // Dynamically import quizService to avoid circular dependency
        const { quizService } = await import("../../service/quiz.service");
        const quizzes = await quizService.getQuizzesByChapter(
          currentChapter.chapterId,
        );
        setHasQuiz(quizzes && quizzes.length > 0);
      } catch (error) {
        console.log("No quiz for this chapter or error:", error);
        setHasQuiz(false);
      }
    };

    checkChapterQuiz();
  }, [course, currentLessonPos.chapterIndex]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!courseId) throw new Error("Lỗi không tìm thấy ID");
        const res = await courseService.getCourseByIdContent(courseId);
        if (res) setCourse(res);
      } catch (error) {
        console.error("Lỗi fetch khóa học: ", error);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  // Fetch recommended courses
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId || !courseId) return;

        const res = await fetch(
          `${API_URL}/learning-speed/recommendations/${userId}/${courseId}`,
        );
        const data = await res.json();

        if (data.success && data.data.courses) {
          setRecommendedCourses(data.data.courses);
        }
      } catch (error) {
        console.error("Lỗi fetch gợi ý khóa học:", error);
      }
    };

    if (courseId) fetchRecommendations();
  }, [courseId]);

  const activeLesson: Lesson | null = useMemo(() => {
    if (!course || !course.chapters) return null;
    const chapter = course.chapters[currentLessonPos.chapterIndex];
    if (!chapter || !chapter.lessons) return null;
    return chapter.lessons[currentLessonPos.lessonIndex] || null;
  }, [course, currentLessonPos]);

  // Track lesson access and check completion status
  useEffect(() => {
    const trackLessonAccess = async () => {
      if (!activeLesson?.lessonId) return;

      try {
        // Track lesson access
        await progressService.accessLesson(activeLesson.lessonId);

        // Check if lesson is already completed
        const lessonProgress = await progressService.getLessonProgress(
          activeLesson.lessonId,
        );
        setLessonCompleted(lessonProgress?.isCompleted || false);
      } catch (error) {
        console.error("Error tracking lesson access:", error);
      }
    };

    trackLessonAccess();
  }, [activeLesson]);

  useEffect(() => {
    const fetchTestCases = async () => {
      if (!activeLesson) {
        console.log("LessonDetailPage: No active lesson");
        return;
      }

      console.log(
        "LessonDetailPage: Fetching test cases for lesson:",
        activeLesson.lessonId,
        activeLesson.lessonName,
      );
      setLessonTestCases([]);

      try {
        const res = await lessonService.getTestCaseByLessonId(
          activeLesson.lessonId,
        );
        console.log("LessonDetailPage: Test cases response:", res);

        if (res && res.length > 0) {
          setLessonTestCases(res as unknown as TestCase[]);
        } else {
          console.log("LessonDetailPage: No test cases found (empty array)");
        }
      } catch (error) {
        console.log("Bài học này không có test case hoặc lỗi API", error);
      }
    };

    fetchTestCases();
  }, [activeLesson]);

  useEffect(() => {
    if (activeLesson) {
      const defaultCode =
        (activeLesson as Lesson & { starterCode?: string }).starterCode || "";
      setCode(defaultCode);
      setOutput("Kết quả sẽ hiển thị ở đây");
    }
  }, [activeLesson]);

  const isCodingLesson = useMemo(() => {
    // Ưu tiên: Nếu có test case -> Là bài coding
    if (lessonTestCases.length > 0) return true;
    return false;
  }, [lessonTestCases]);

  const isQuizLesson = useMemo(() => {
    // Chỉ hiển thị quiz khi:
    // 1. Chapter có quiz
    // 2. Lesson hiện tại KHÔNG có video
    // 3. Lesson hiện tại KHÔNG có test case
    if (!hasQuiz) return false;
    if (lessonTestCases.length > 0) return false; // Có test case -> là coding lesson
    if (activeLesson?.videoUrl) return false; // Có video -> là video lesson

    return true; // Không có video, không có test case, nhưng chapter có quiz -> hiển thị quiz
  }, [hasQuiz, activeLesson, lessonTestCases]);

  // Navigation functions
  const goToPreviousLesson = () => {
    if (!course?.chapters) return;

    if (currentLessonPos.lessonIndex > 0) {
      // Previous lesson in same chapter
      setCurrentLessonPos({
        ...currentLessonPos,
        lessonIndex: currentLessonPos.lessonIndex - 1,
      });
    } else if (currentLessonPos.chapterIndex > 0) {
      // Last lesson of previous chapter
      const prevChapter = course.chapters[currentLessonPos.chapterIndex - 1];
      setCurrentLessonPos({
        chapterIndex: currentLessonPos.chapterIndex - 1,
        lessonIndex: (prevChapter.lessons?.length || 1) - 1,
      });
    }
  };

  const goToNextLesson = () => {
    if (!course?.chapters) return;

    const currentChapter = course.chapters[currentLessonPos.chapterIndex];
    const totalLessons = currentChapter.lessons?.length || 0;

    if (currentLessonPos.lessonIndex < totalLessons - 1) {
      // Next lesson in same chapter
      setCurrentLessonPos({
        ...currentLessonPos,
        lessonIndex: currentLessonPos.lessonIndex + 1,
      });
    } else if (currentLessonPos.chapterIndex < course.chapters.length - 1) {
      // First lesson of next chapter
      setCurrentLessonPos({
        chapterIndex: currentLessonPos.chapterIndex + 1,
        lessonIndex: 0,
      });
    }
  };

  const isFirstLesson =
    currentLessonPos.chapterIndex === 0 && currentLessonPos.lessonIndex === 0;
  const isLastLesson =
    course?.chapters &&
    currentLessonPos.chapterIndex === course.chapters.length - 1 &&
    currentLessonPos.lessonIndex ===
      (course.chapters[currentLessonPos.chapterIndex].lessons?.length || 1) - 1;

  // Handle manual lesson completion (for theory lessons)
  const handleCompleteLesson = async () => {
    if (!activeLesson?.lessonId || lessonCompleted) return;

    setCompletingLesson(true);
    try {
      const result = await progressService.completeLesson(
        activeLesson.lessonId,
      );
      setLessonCompleted(true);

      // Check if this is the last lesson and course is completed
      if (result.isLastLesson && result.courseCompleted) {
        message.success({
          content: (
            <div>
              <h3 style={{ margin: 0, color: "#52c41a" }}>
                Chúc mừng! Bạn đã hoàn thành khóa học!
              </h3>
              <p style={{ margin: "8px 0 0 0" }}>
                Đây là bài học cuối cùng. Bạn nhận được 100 XP bonus!
              </p>
              {result.courseCompletionInfo && (
                <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
                  Thời gian hoàn thành:{" "}
                  {result.courseCompletionInfo.totalHours.toFixed(1)} giờ
                </p>
              )}
            </div>
          ),
          duration: 6,
          style: { marginTop: "20vh" },
        });
      } else {
        message.success(
          `Đã hoàn thành bài học! Tiến độ khóa học: ${result.courseProgress.toFixed(
            1,
          )}%`,
        );
      }

      // Show XP notification if xpReward exists
      if (result.xpReward) {
        setXpReward({
          xpAwarded: result.xpReward.xpAwarded || 0,
          description: result.xpReward.description,
          leveledUp: result.xpReward.leveledUp,
          newLevel: result.xpReward.currentLevel,
          achievementUnlocked: result.xpReward.achievementUnlocked,
        });

        // Auto hide notification after 5 seconds
        setTimeout(() => setXpReward(null), 5000);
      }
    } catch (error) {
      message.error("Không thể đánh dấu hoàn thành bài học");
      console.error("Error completing lesson:", error);
    } finally {
      setCompletingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Đang tải khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorText}>Không tìm thấy khóa học</h2>
        <p className={styles.errorSubtext}>
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ
        </p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* XP Notification */}
      {xpReward && (
        <XPNotification
          xpAwarded={xpReward.xpAwarded}
          description={xpReward.description}
          leveledUp={xpReward.leveledUp}
          newLevel={xpReward.newLevel}
          achievementUnlocked={xpReward.achievementUnlocked}
        />
      )}

      <div className={styles.mainContent}>
        {/* Floating Toggle Button (shows when collapsed) */}
        {sidebarCollapsed && (
          <button
            className={styles.floatingToggle}
            onClick={() => setSidebarCollapsed(false)}
            title="Mở menu"
          >
            ☰
          </button>
        )}

        {/* Sidebar */}
        <div
          className={`${styles.sidebarWrapper} ${
            sidebarCollapsed ? styles.collapsed : ""
          }`}
        >
          <LectureListComponent
            key={`lecture-list-${course.courseId}-${lessonCompleted}`}
            chapters={course.chapters || []}
            currentLesson={currentLessonPos}
            onSelectLesson={(cIdx, lIdx) => {
              setCurrentLessonPos({ chapterIndex: cIdx, lessonIndex: lIdx });
            }}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            isCollapsed={sidebarCollapsed}
          />
        </div>

        {/* Main Content Area */}
        <div className={styles.contentWrapper}>
          {isCodingLesson ? (
            <CompilerComponent
              key={activeLesson?.lessonId}
              code={code}
              setCode={setCode}
              output={output}
              setOutput={setOutput}
              testCases={lessonTestCases}
            />
          ) : isQuizLesson ? (
            <QuizComponent
              chapterId={
                course.chapters?.[currentLessonPos.chapterIndex]?.chapterId ||
                ""
              }
              lessonName={activeLesson?.lessonName || ""}
              onQuizComplete={async (passed, score) => {
                console.log("✅ Quiz completed:", { passed, score });

                if (courseId) {
                  try {
                    const courseProgress =
                      await progressService.getCourseProgress(courseId);
                    console.log(
                      "📊 Course progress after quiz:",
                      courseProgress.progress,
                      "%",
                    );

                    // Nếu đã hoàn thành 100% course
                    if (courseProgress.progress >= 100) {
                      console.log("🎉 Showing course completion modal!");

                      // ✅ Fetch recommendations với cấu trúc API mới
                      try {
                        const token = localStorage.getItem("token");
                        if (token) {
                          const payload = JSON.parse(atob(token.split(".")[1]));
                          const userId = payload.userId;

                          const recommendations =
                            await learningSpeedService.onCourseCompleted(
                              userId,
                              courseId,
                            );

                          console.log("📚 Recommendations:", recommendations);

                          // Sử dụng cấu trúc mới
                          if (recommendations.courses) {
                            setRecommendedCourses(recommendations.courses);
                          }

                          if (recommendations.actualHours) {
                            setActualHours(recommendations.actualHours);
                          }

                          if (recommendations.estimatedHours) {
                            setEstimatedHours(recommendations.estimatedHours);
                          }

                          if (recommendations.learningSpeed) {
                            setLearningSpeed(recommendations.learningSpeed);

                            const speedMap: { [key: string]: string } = {
                              "Very Fast":
                                "Bạn học rất nhanh! Gợi ý khóa học khó hơn 2 cấp độ",
                              Fast: "Bạn học nhanh! Gợi ý khóa học khó hơn 1 cấp độ",
                              Normal:
                                "Tốc độ học bình thường. Gợi ý khóa học cùng cấp độ",
                              Slow: "Gợi ý khóa học dễ hơn để củng cố kiến thức",
                            };
                            setRecommendationReason(
                              speedMap[recommendations.learningSpeed] ||
                                recommendations.reason ||
                                "Gợi ý khóa học phù hợp",
                            );
                          }
                        }
                      } catch (err) {
                        console.error("Error fetching recommendations:", err);
                      }

                      // ✅ Xử lý certificate với API mới
                      try {
                        if (courseId) {
                          let certificate = null;

                          // Thử tạo certificate mới
                          try {
                            console.log(
                              "🔄 Attempting to issue certificate for course:",
                              courseId,
                            );
                            certificate =
                              await certificateService.issueCertificate(
                                courseId,
                              );
                            console.log("✅ Certificate created:", certificate);
                          } catch (issueError: unknown) {
                            const err = issueError as Error;
                            console.log(
                              "⚠️ Certificate issue failed:",
                              err.message,
                            );
                            console.log(
                              "Certificate already exists, fetching...",
                            );
                            // Nếu đã tồn tại, lấy certificate
                            try {
                              certificate =
                                await certificateService.getUserCertificateInCourse(
                                  courseId,
                                );
                              console.log(
                                "✅ Certificate retrieved:",
                                certificate,
                              );
                            } catch (fetchError: unknown) {
                              const err = fetchError as Error;
                              console.error(
                                "❌ Failed to fetch certificate:",
                                err.message,
                              );
                            }
                          }

                          if (certificate?.pdfUrl) {
                            // Backend đã trả về full URL từ Cloudinary
                            setCertificateURL(certificate.pdfUrl);
                            console.log(
                              "✅ Certificate PDF URL:",
                              certificate.pdfUrl,
                            );
                          } else {
                            console.log("ℹ️ No certificate URL available yet");
                          }
                        }
                      } catch (err) {
                        console.error("❌ Error handling certificate:", err);
                      }

                      // Set state để hiển thị modal
                      setCompletionScore(score);
                      setTimeout(() => {
                        setShowCompletionModal(true);
                      }, 1000);
                    }
                  } catch (error) {
                    console.error("Error checking course progress:", error);
                  }
                }
              }}
            />
          ) : (
            <div className={styles.videoMainSection}>
              {/* Video Player */}
              <div className={styles.videoPlayerWrapper}>
                {activeLesson?.videoUrl ? (
                  <div className={styles.videoContainer}>
                    <VideoLessonPlayer
                      videoUrl={activeLesson.videoUrl}
                      lessonTitle={activeLesson.lessonName}
                      lessonId={activeLesson.lessonId}
                      autoPlay={false}
                      onCompleted={async (result) => {
                        // Check nếu hoàn thành 100% course
                        if (result?.courseProgress === 100) {
                          message.success({
                            content: (
                              <div style={{ textAlign: "center" }}>
                                <h3
                                  style={{
                                    margin: 0,
                                    color: "#52c41a",
                                    fontSize: "18px",
                                  }}
                                >
                                  Chúc mừng! Bạn đã hoàn thành khóa học!
                                </h3>
                                <p
                                  style={{
                                    margin: "8px 0 0 0",
                                    fontSize: "14px",
                                  }}
                                >
                                  Tiến độ: 100% - Tất cả bài học đã hoàn thành
                                </p>
                                {result.xpReward && (
                                  <p
                                    style={{
                                      margin: "4px 0 0 0",
                                      fontSize: "13px",
                                      color: "#1890ff",
                                    }}
                                  >
                                    Bạn nhận được +{result.xpReward.xpAwarded}{" "}
                                    XP
                                  </p>
                                )}
                              </div>
                            ),
                            duration: 6,
                            style: { marginTop: "20vh" },
                          });
                        }

                        // Hiển thị XP notification nếu có
                        if (result?.xpReward) {
                          setXpReward({
                            xpAwarded: result.xpReward.xpAwarded || 0,
                            description: result.xpReward.description,
                            leveledUp: result.xpReward.leveledUp,
                            newLevel: result.xpReward.currentLevel,
                            achievementUnlocked:
                              result.xpReward.achievementUnlocked,
                          });

                          // Auto hide notification sau 5 giây
                          setTimeout(() => setXpReward(null), 5000);
                        }

                        // Reload lesson progress để update UI
                        if (activeLesson?.lessonId) {
                          try {
                            const lessonProgress =
                              await progressService.getLessonProgress(
                                activeLesson.lessonId,
                              );
                            setLessonCompleted(
                              lessonProgress?.isCompleted || false,
                            );

                            // Reload course để update danh sách lessons với dấu tick
                            if (courseId) {
                              const updatedCourse =
                                await courseService.getCourseByIdContent(
                                  courseId,
                                );
                              if (updatedCourse) setCourse(updatedCourse);
                            }
                          } catch (error) {
                            console.error("Error reloading progress:", error);
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className={styles.theoryPlaceholder}>
                    <div className={styles.theoryIcon}></div>
                    <h4 className={styles.theoryTitle}>
                      {activeLesson?.lessonName}
                    </h4>
                    <p className={styles.theoryText}>
                      Bài học này là lý thuyết. Vui lòng xem nội dung chi tiết ở
                      bên phải.
                    </p>
                    <button
                      className={`${styles.completeButton} ${
                        lessonCompleted ? styles.completed : ""
                      }`}
                      onClick={handleCompleteLesson}
                      disabled={lessonCompleted || completingLesson}
                    >
                      {completingLesson
                        ? "Đang xử lý..."
                        : lessonCompleted
                          ? "Đã hoàn thành"
                          : "Đánh dấu hoàn thành"}
                    </button>
                  </div>
                )}
              </div>

              {/* Lesson Info & Navigation */}
              <div className={styles.lessonInfoSection}>
                <div className={styles.lessonHeader}>
                  <h2 className={styles.lessonTitle}>
                    {activeLesson?.lessonName}
                  </h2>
                  <p className={styles.lessonMeta}>
                    Chương {currentLessonPos.chapterIndex + 1} - Bài{" "}
                    {currentLessonPos.lessonIndex + 1}
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className={styles.navigationButtons}>
                  <button
                    className={styles.navButton}
                    onClick={goToPreviousLesson}
                    disabled={isFirstLesson}
                  >
                    <span className={styles.navIcon}>←</span>
                    <span>Bài trước</span>
                  </button>
                  <button
                    className={styles.navButton}
                    onClick={goToNextLesson}
                    disabled={isLastLesson}
                  >
                    <span>Bài tiếp theo</span>
                    <span className={styles.navIcon}>→</span>
                  </button>
                </div>

                {/* Course Recommendations */}
                <div className={styles.recommendationsSection}>
                  <div className={styles.recommendHeader}>
                    <h3 className={styles.recommendTitle}>
                      Khóa học được gợi ý cho bạn
                    </h3>
                    <p className={styles.recommendSubtitle}>
                      Dựa trên tốc độ học tập và trình độ hiện tại của bạn
                    </p>
                    {actualHours > 0 && estimatedHours > 0 && (
                      <div className={styles.learningSpeedInfo}>
                        <div className={styles.speedDetail}>
                          <span className={styles.speedLabel}>
                            ⏱️ Thời gian học thực tế:
                          </span>
                          <span className={styles.speedValue}>
                            {actualHours.toFixed(1)} giờ
                          </span>
                        </div>
                        <div className={styles.speedDetail}>
                          <span className={styles.speedLabel}>
                            📊 Thời gian ước lượng:
                          </span>
                          <span className={styles.speedValue}>
                            {estimatedHours.toFixed(1)} giờ
                          </span>
                        </div>
                        <div className={styles.speedDetail}>
                          <span className={styles.speedLabel}>
                            🎯 Tốc độ học:
                          </span>
                          <span
                            className={`${styles.speedValue} ${
                              styles[
                                learningSpeed.toLowerCase().replace(" ", "-")
                              ]
                            }`}
                          >
                            {learningSpeed === "Very Fast"
                              ? "⚡ Rất Nhanh"
                              : learningSpeed === "Fast"
                                ? "🚀 Nhanh"
                                : learningSpeed === "Normal"
                                  ? "✅ Bình Thường"
                                  : "🐢 Chậm"}
                          </span>
                        </div>
                        <div className={styles.speedReason}>
                          <p>{recommendationReason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {recommendedCourses.length > 0 ? (
                    <div className={styles.carouselWrapper}>
                      <button
                        className={`${styles.carouselButton} ${styles.prev}`}
                        onClick={() => {
                          const container =
                            document.getElementById("course-carousel");
                          if (container) container.scrollLeft -= 320;
                        }}
                      >
                        ‹
                      </button>

                      <div
                        className={styles.carouselContainer}
                        id="course-carousel"
                      >
                        {recommendedCourses.map((course: RecommendedCourse) => (
                          <div
                            key={course.courseId}
                            className={styles.recommendCard}
                          >
                            <div className={styles.recommendImage}>
                              <img
                                src={
                                  course.avatarURL ||
                                  "/images/default-course.jpg"
                                }
                                alt={course.courseName}
                              />
                              <div className={styles.levelBadge}>
                                {course.level}
                              </div>
                            </div>
                            <div className={styles.recommendInfo}>
                              <h4>{course.courseName}</h4>
                              <p>
                                {course.courseDescription ||
                                  "Khóa học chất lượng cao"}
                              </p>
                              <div className={styles.coursePrice}>
                                {course.coursePrice?.toLocaleString("vi-VN")}đ
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        className={`${styles.carouselButton} ${styles.next}`}
                        onClick={() => {
                          const container =
                            document.getElementById("course-carousel");
                          if (container) container.scrollLeft += 320;
                        }}
                      >
                        ›
                      </button>
                    </div>
                  ) : (
                    <div className={styles.noRecommendations}>
                      <p>
                        Chưa có gợi ý khóa học. Hãy hoàn thành khóa học này để
                        nhận gợi ý!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description Panel */}
          <div className={styles.descriptionPanel}>
            <LessonDescriptionComponent lesson={activeLesson} />
          </div>
        </div>
      </div>

      {/* Course Completion Modal */}
      <Modal
        open={showCompletionModal}
        onOk={() => setShowCompletionModal(false)}
        onCancel={() => setShowCompletionModal(false)}
        centered
        width={800}
        footer={[
          <button
            key="ok"
            onClick={() => setShowCompletionModal(false)}
            style={{
              padding: "8px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Đóng
          </button>,
        ]}
      >
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              margin: "0 0 12px 0",
              color: "white",
            }}
          >
            Chúc mừng!
          </h2>
          <p style={{ fontSize: "18px", marginBottom: "16px", color: "white" }}>
            Bạn đã hoàn thành <strong>100%</strong> khóa học này!
          </p>
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          >
            <p style={{ fontSize: "16px", margin: 0, color: "white" }}>
              Điểm số: <strong>{completionScore}%</strong>
            </p>
          </div>

          {/* Learning Speed & Recommendations */}
          {learningSpeed && (
            <div style={{ marginTop: "20px", textAlign: "left" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ color: "white", fontSize: "20px", margin: 0 }}>
                  📊 Tốc độ học: <strong>{learningSpeed}</strong>
                </h3>
                {certificateURL && (
                  <button
                    onClick={() => window.open(certificateURL, "_blank")}
                    style={{
                      padding: "6px 16px",
                      background: "#f9b115",
                      color: "#333",
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    🎓 Tải chứng chỉ
                  </button>
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
                {recommendationReason}
              </p>
            </div>
          )}

          {recommendedCourses.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3
                style={{
                  color: "white",
                  fontSize: "18px",
                  marginBottom: "15px",
                }}
              >
                🎯 Khóa học gợi ý cho bạn:
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {recommendedCourses
                  .slice(0, 3)
                  .map((course: RecommendedCourse) => (
                    <div
                      key={course.courseId}
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        padding: "12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onClick={() => {
                        setShowCompletionModal(false);
                        window.location.href = `/course/${course.courseId}`;
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.15)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "600",
                              color: "white",
                              fontSize: "15px",
                            }}
                          >
                            {course.courseName}
                          </p>
                          <p
                            style={{
                              margin: "4px 0 0 0",
                              fontSize: "13px",
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            Cấp độ: {course.level}
                          </p>
                        </div>
                        <span style={{ color: "white", fontSize: "18px" }}>
                          →
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PracticePage;
