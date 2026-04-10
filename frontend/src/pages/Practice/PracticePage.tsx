import React, { useState, useEffect } from "react";
import LectureListComponent from "../../components/Lecture/LectureListComponent";
import LessonDescriptionComponent from "../../components/Lecture/LectureDescriptionComponent";
import CompilerComponent from "../../components/Compiler/CompilerComponent";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { Chapter } from "../../types/database.types";

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

interface Course {
  courseId: string;
  courseName: string;
  courseDescription: string;
  coursePrice: number;
  discount?: number | null;
  avatarURL: string | null;
  level: string;
  chapters: Chapter[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const PracticePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentLesson, setCurrentLesson] = useState({
    chapterIndex: 0,
    lessonIndex: 0,
  });

  const [code, setCode] = useState("// Viết code của bạn ở đây");
  const [output, setOutput] = useState("Kết quả sẽ hiển thị ở đây");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/courses/${courseId}/content`,
          { headers: getAuthHeaders() },
        );

        if (res.data.success) {
          setCourse(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi fetch dữ liệu practice: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  // ⛔ KHÔNG ĐẶT STATE SAU RETURN
  if (loading) return <div>Đang tải...</div>;
  if (!course) return <div>Không tìm thấy khóa học</div>;

  return (
    <div className="" style={{ height: "100vh" }}>
      <div className="row gx-3 h-100">
        <LectureListComponent
          chapters={course.chapters}
          currentLesson={currentLesson}
          onSelectLesson={(cIdx, lIdx) => {
            setCurrentLesson({ chapterIndex: cIdx, lessonIndex: lIdx });
            setCode("// Viết code của bạn ở đây");
            setOutput("Kết quả sẽ hiển thị ở đây");
          }}
        />

        <CompilerComponent
          code={code}
          setCode={setCode}
          output={output}
          setOutput={setOutput}
        />

        <LessonDescriptionComponent lesson={null} />
      </div>
    </div>
  );
};

export default PracticePage;
