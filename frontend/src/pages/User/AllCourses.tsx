import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../styles/UserCoursePage.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

interface Course {
  courseId: string;
  courseName: string;
  courseDescription: string;
  coursePrice: number;
  avatarURL: string | null;
  level: string;
  isEnrolled?: boolean; // Backend tự động trả về field này
}

const AllCourses: React.FC = () => {
  const navigate = useNavigate(); // Thêm dòng này
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/courses`, {
          params: { skip: 0, take: 100 }, // Lấy nhiều hơn để phân trang ở frontend
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.data.success) {
          setCourses(response.data.data);
        } else {
          setError("Không thể tải danh sách khóa học.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối đến server.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = courses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading)
    return (
      <div className={styles.loading}>
        <p>Đang tải danh sách khóa học...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );

  return (
    <div className={styles["blog-main"]}>
      <div className={`container ${styles["course-section"]}`}>
        <div className={styles["section-header"]}>
          <h2>TẤT CẢ KHÓA HỌC</h2>
          <p>Khám phá toàn bộ khóa học hiện có trên nền tảng</p>
        </div>

        {courses.length === 0 ? (
          <p className={styles["no-course"]}>Chưa có khóa học nào.</p>
        ) : (
          <>
            <div className={styles["course-grid"]}>
              {currentItems.map((course) => (
                <div className={styles["course-card"]} key={course.courseId}>
                  {course.isEnrolled && (
                    <div className={styles["enrolled-badge"]}>✓ Đã mua</div>
                  )}
                  <img
                    src={
                      course.avatarURL
                        ? course.avatarURL
                        : "/images/default-course.jpg"
                    }
                    alt={course.courseName}
                    className={styles["course-img"]}
                  />
                  <div className={styles["course-info"]}>
                    <h5 className={styles["course-title"]}>
                      {course.courseName}
                    </h5>
                    <p className={styles["course-price"]}>
                      {course.coursePrice.toLocaleString("vi-VN")}đ
                    </p>
                    <p className={styles["course-level"]}>
                      Trình độ: {course.level}
                    </p>
                    <div className={styles["course-buttons"]}>
                      <button
                        className={styles["btn-view"]}
                        onClick={() => handleViewCourse(course.courseId)}
                      >
                        Xem
                      </button>
                      {course.isEnrolled ? (
                        <button
                          className={styles["btn-continue"]}
                          onClick={() => navigate(`/practice/${course.courseId}`)}
                        >
                          Tiếp tục học
                        </button>
                      ) : (
                        <button
                          className={styles["btn-buy"]}
                          onClick={() =>
                            navigate(`/payment?courseId=${course.courseId}`)
                          }
                        >
                          Mua ngay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Điều khiển phân trang */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.pageBtn}
                >
                  &laquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => paginate(num)}
                      className={`${styles.pageBtn} ${currentPage === num ? styles.active : ""}`}
                    >
                      {num}
                    </button>
                  ),
                )}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.pageBtn}
                >
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllCourses;
