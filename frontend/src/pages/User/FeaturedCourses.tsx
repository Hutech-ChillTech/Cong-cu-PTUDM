import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/UserCoursePage.module.css";
import { courseService } from "../../service/course.service";
import type { Course } from "../../types/database.types";

const FeaturedCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        // Lấy tất cả khóa học nổi bật (không giới hạn số lượng)
        const res = await courseService.getPopularCourses(20);
        if (res) {
          setCourses(res);
        } else {
          setError("Không thể tải danh sách khóa học nổi bật.");
        }
      } catch (err) {
        console.error("Error fetching featured courses:", err);
        setError("Lỗi kết nối đến server.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleBuyCourse = (courseId: string) => {
    navigate(`/payment?courseId=${courseId}`);
  };

  return (
    <div className={styles["blog-main"]}>
      <div className={`container ${styles["course-section"]}`}>
        <div className={styles["section-header"]}>
          <h2>KHÓA HỌC NỔI BẬT</h2>
        </div>

        {loading ? (
          <p className="text-center text-muted">Đang tải dữ liệu...</p>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : courses.length === 0 ? (
          <p className="text-center text-muted">
            Hiện chưa có khóa học nổi bật nào.
          </p>
        ) : (
          <div className={styles["course-grid"]}>
            {courses.map((course) => (
              <div className={styles["course-card"]} key={course.courseId}>
                {course.isEnrolled && (
                  <div className={styles["enrolled-badge"]}>✓ Đã mua</div>
                )}
                <img
                  src={course.avatarURL || "/images/default-course.jpg"}
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
                        onClick={() => handleBuyCourse(course.courseId)}
                      >
                        Mua ngay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedCourses;
