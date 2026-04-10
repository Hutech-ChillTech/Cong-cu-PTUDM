import React, { useState, useEffect } from "react";
import { DownOutlined } from "@ant-design/icons";
import { type Chapter, type Lesson } from "../../types/database.types";
import styles from "../../styles/LectureList.module.css";
import { quizService } from "../../service/quiz.service";
import { progressService } from "../../service/progress.service";

interface LectureListProps {
  chapters: Chapter[];
  currentLesson: {
    chapterIndex: number;
    lessonIndex: number;
  };
  onSelectLesson: (chapterIndex: number, lessonIndex: number) => void;
  className?: string;
  onToggle?: () => void;
  isCollapsed?: boolean;
}

const LectureListComponent: React.FC<LectureListProps> = ({
  chapters,
  currentLesson,
  onSelectLesson,
  className = "",
  onToggle,
  isCollapsed = false,
}) => {
  const safeChapters = chapters || [];
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
  const [chapterQuizzes, setChapterQuizzes] = useState<{
    [key: string]: boolean;
  }>({});
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const checkQuizzes = async () => {
      const quizMap: { [key: string]: boolean } = {};
      for (const chapter of safeChapters) {
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
    };

    if (safeChapters.length > 0) {
      checkQuizzes();
    }
  }, [safeChapters]);

  // Fetch lesson completion status
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      try {
        const allProgress = await progressService.getAllMyProgress();
        const completed = new Set<string>();

        allProgress.forEach((courseProgress) => {
          if (Array.isArray(courseProgress.completedLessonsList)) {
            courseProgress.completedLessonsList.forEach((lesson) => {
              completed.add(lesson.lessonId);
            });
          }
        });

        setCompletedLessons(completed);
      } catch (error) {
        console.error("Error fetching lesson completion status:", error);
      }
    };

    fetchCompletionStatus();
  }, [currentLesson]);

  const toggleChapter = (index: number) => {
    setExpandedChapters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className={`${styles.lectureList} ${className}`}>
      <div className={styles.header}>
        <h5 className={styles.title}>📚 Nội dung khóa học</h5>
        {onToggle && (
          <button
            className={styles.toggleButton}
            onClick={onToggle}
            title={isCollapsed ? "Mở menu" : "Đóng menu"}
          >
            {isCollapsed ? "☰" : "✕"}
          </button>
        )}
      </div>

      {safeChapters.length === 0 ? (
        <div className={styles.emptyState}>Chưa có nội dung khóa học</div>
      ) : (
        safeChapters.map((chapter, cIdx) => {
          const isExpanded = expandedChapters.includes(cIdx);
          const hasQuiz = chapterQuizzes[chapter.chapterId];
          const lessons = chapter.lessons || [];
          const totalItems = lessons.length + (hasQuiz ? 1 : 0);

          return (
            <div key={chapter.chapterId} className={styles.chapterCard}>
              <div
                className={styles.chapterHeader}
                onClick={() => toggleChapter(cIdx)}
              >
                <h6 className={styles.chapterTitle}>
                  <span>📖</span>
                  <span>{chapter.chapterName}</span>
                </h6>
                <span className={styles.lessonCount}>{totalItems} bài học</span>
                <DownOutlined
                  className={`${styles.chapterIcon} ${
                    isExpanded ? styles.expanded : ""
                  }`}
                />
              </div>

              {isExpanded && (
                <ul className={styles.lessonList}>
                  {lessons.map((lesson, lIdx) => {
                    const isActive =
                      currentLesson.chapterIndex === cIdx &&
                      currentLesson.lessonIndex === lIdx;
                    const isCompleted = completedLessons.has(lesson.lessonId);

                    return (
                      <li
                        key={lesson.lessonId}
                        className={`${styles.lessonItem} ${
                          isActive ? styles.active : ""
                        } ${isCompleted ? styles.completed : ""}`}
                        onClick={() => onSelectLesson(cIdx, lIdx)}
                      >
                        <span className={styles.lessonIcon}>
                          {isCompleted ? "✅" : "▸"}
                        </span>
                        <span className={styles.lessonName}>
                          {lesson.lessonName}
                        </span>
                        {(lesson as Lesson & { lessonDuration?: string })
                          .lessonDuration && (
                          <span className={styles.lessonDuration}>
                            ⏱{" "}
                            {
                              (lesson as Lesson & { lessonDuration?: string })
                                .lessonDuration
                            }
                          </span>
                        )}
                      </li>
                    );
                  })}

                  {hasQuiz && (
                    <li
                      className={`${styles.lessonItem} ${styles.quizItem}`}
                      onClick={() => onSelectLesson(cIdx, lessons.length)}
                    >
                      <span className={styles.lessonIcon}>📝</span>
                      <span className={styles.lessonName}>Bài trắc nghiệm</span>
                      <span className={styles.quizBadge}>Quiz</span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default LectureListComponent;
