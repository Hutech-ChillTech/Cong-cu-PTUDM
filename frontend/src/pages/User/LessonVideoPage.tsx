import React, { useState } from "react";
import LectureListComponent from "../../components/Lecture/LectureListComponent";
import styles from "../../styles/LessonVideoPage.module.css";

const LessonVideoPage: React.FC = () => {
  const [currentLesson, setCurrentLesson] = useState({
    chapterIndex: 0,
    lessonIndex: 0,
  });

  // Dữ liệu mẫu chapters
  const chapters = [
    {
      chapterId: "1",
      chapterName: "Chương 1: Giới thiệu",
      totalLesson: 1,
      courseId: "sample-course",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lessons: [
        {
          lessonId: "1",
          lessonName: "Bài học 1: Giới thiệu về JavaScript",
          videoUrl:
            "https://drive.google.com/file/d/1JcdlMNZV5cE_GZxxxxxx/view",
          content: null,
          isPreview: false,
          publicIdVideo: null,
          chapterId: "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
  ];

  // Dữ liệu mẫu
  const lessonData = {
    title: "Bài học 1: Giới thiệu về JavaScript",
    description:
      "Trong bài học này, bạn sẽ tìm hiểu cú pháp cơ bản và cách chạy chương trình đầu tiên với JavaScript. Bạn cũng sẽ được làm quen với biến, hằng và kiểu dữ liệu trong ngôn ngữ này.",
    driveLink: "https://drive.google.com/file/d/1JcdlMNZV5cE_GZxxxxxx/view",
  };

  // Hàm chuyển link Drive thành link nhúng
  const getEmbedLink = (link: string) => {
    const match = link.match(/\/d\/(.+?)\//);
    return match && match[1]
      ? `https://drive.google.com/file/d/${match[1]}/preview`
      : link;
  };

  const embedUrl = getEmbedLink(lessonData.driveLink);

  // Xử lý nút bài học
  const handlePrevLesson = () => {
    setCurrentLesson((prev) => ({
      ...prev,
      lessonIndex: Math.max(prev.lessonIndex - 1, 0),
    }));
  };

  const handleNextLesson = () => {
    setCurrentLesson((prev) => ({
      ...prev,
      lessonIndex: prev.lessonIndex + 1,
    }));
  };

  return (
    <div className={styles.lessonVideoPage}>
      <div className="row gx-3 h-100">
        <LectureListComponent
          chapters={chapters}
          currentLesson={currentLesson}
          onSelectLesson={(chapterIdx, lessonIdx) =>
            setCurrentLesson({
              chapterIndex: chapterIdx,
              lessonIndex: lessonIdx,
            })
          }
        />

        {/* Khu vực video và nội dung */}
        <div className={styles.videoArea}>
          <h2 className={styles.lessonTitle}>{lessonData.title}</h2>

          <div className={styles.videoWrapper}>
            <iframe
              src={embedUrl}
              allow="autoplay"
              allowFullScreen
              title="Lesson Video"
              className={styles.videoIframe}
            ></iframe>
          </div>

          <p className={styles.lessonDescription}>{lessonData.description}</p>

          {/* ✅ Thanh điều hướng sticky */}
          <div className={styles.lessonNavBar}>
            <button
              className={styles.navButton}
              onClick={handlePrevLesson}
              disabled={currentLesson.lessonIndex === 0}
            >
              ⬅ Bài trước
            </button>

            <button className={styles.navButton} onClick={handleNextLesson}>
              Bài tiếp theo ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonVideoPage;
