import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/UserMain.module.css";
import { courseService } from "../../service/course.service";
import { type Course } from "../../types/database.types";

const Main: React.FC = () => {
  const navigate = useNavigate();
  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ["Frontend", "Backend", "Data", "AI", "DevOps"];

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleBuyCourse = (courseId: string) => {
    navigate(`/payment?courseId=${courseId}`);
  };

  // === 1. Lấy toàn bộ khóa học ===
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseService.getAllCourses();
        if (res) {
          setApiCourses(res);
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

  // === 2. Lấy khóa học nổi bật (popular) ===
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await courseService.getPopularCourses(5);

        // Data từ service trả về đã là Course[]
        if (res) {
          setPopularCourses(res);
        }
      } catch (err) {
        console.error("Lỗi khi tải khóa học nổi bật:", err);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className={styles["blog-main"]}>
      {/* === HERO SECTION === */}
      <div className={styles["hero-section"]}>
        <img
          src="/images/SkillCoder_Logo.png"
          alt="SkillCoder Logo"
          className={styles["hero-logo"]}
        />
        <h1 className={styles["hero-title"]}>SkillCoder</h1>
        <p className={styles["hero-subtitle"]}>
          Cùng bạn định hướng tương lai lập trình!
        </p>
      </div>

      {/* === CATEGORY BUTTONS === */}
      <div className={styles["category-list"]}>
        {categories.map((cat, index) => (
          <button
            className={styles["category-btn"]}
            key={index}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* === KHÓA HỌC NỔI BẬT (TỪ API) === */}
      <div className={`container ${styles["course-section"]}`}>
        <div className={styles["section-header"]}>
          <h2>Khóa học Nổi bật</h2>
          <Link to="/featured-courses" className={styles["view-more-btn"]}>
            Xem thêm →
          </Link>
        </div>

        {apiCourses.length === 0 && !loading ? (
          <div className={styles["no-courses"]}>
            <p className="text-center text-muted">
              Chưa có khóa học nổi bật nào.
            </p>
          </div>
        ) : (
          <div className={styles["course-grid"]}>
            {popularCourses.map((course) => (
              <div className={styles["course-card"]} key={course.courseId}>
                {course.isEnrolled && (
                  <div className={styles["enrolled-badge"]}>✓ Đã mua</div>
                )}
                <div className={styles["course-img-wrapper"]}>
                  <img
                    src={
                      course.avatarURL
                        ? course.avatarURL
                        : "/images/default-course.jpg"
                    }
                    alt={course.courseName}
                    className={styles["course-img"]}
                  />
                </div>
                <div className={styles["course-info"]}>
                  <h5 className={styles["course-title"]}>{course.courseName}</h5>
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

      {/* === CÁC KHÓA HỌC KHÁC === */}
      <div className={`container ${styles["course-section"]}`}>
        <div className={styles["section-header"]}>
          <h2>Các khóa học tại SkillCoder</h2>
          <Link to="/all-courses" className={styles["view-more-btn"]}>
            Xem thêm →
          </Link>
        </div>

        {loading ? (
          <div className={styles["loading-container"]}>
            <div className={styles["spinner"]}></div>
            <p className="text-muted">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center mx-auto" style={{ maxWidth: "500px" }}>
            {error}
          </div>
        ) : apiCourses.length === 0 ? (
          <p className="text-center text-muted">
            Hiện chưa có khóa học nào được đăng.
          </p>
        ) : (
          <div className={styles["course-grid"]}>
            {apiCourses.map((course) => (
              <div className={styles["course-card"]} key={course.courseId}>
                {course.isEnrolled && (
                  <div className={styles["enrolled-badge"]}>✓ Đã mua</div>
                )}
                <div className={styles["course-img-wrapper"]}>
                  <img
                    src={
                      course.avatarURL
                        ? course.avatarURL
                        : "/images/default-course.jpg"
                    }
                    alt={course.courseName}
                    className={styles["course-img"]}
                  />
                </div>
                <div className={styles["course-info"]}>
                  <h5 className={styles["course-title"]}>{course.courseName}</h5>
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

export default Main;
