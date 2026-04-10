import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin, Card, Empty, Button, Tag } from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RightOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { courseService } from "../../service/course.service";
import {
  courseTrackingService,
  type AllCoursesTrackingInfo,
} from "../../service/courseTracking.service";
import styles from "../../styles/UserCoursePage.module.css";

interface EnrolledCourse {
  enrollmentId: string;
  enrolledAt: string;
  course: {
    courseId: string;
    courseName: string;
    courseDescription: string;
    coursePrice: number;
    discount: number;
    avatarURL: string;
    level: string;
    instructor: {
      userId: string;
      userName: string;
      avatarURL: string;
    };
    totalChapters: number;
    totalEnrollments: number;
  };
  payment: {
    paymentId: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    paidAt: string;
  } | null;
}

const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [completionTimes, setCompletionTimes] = useState<
    Map<string, AllCoursesTrackingInfo>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    fetchEnrolledCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getEnrolledCourses(
        page * pageSize,
        pageSize
      );
      setCourses(data);

      // Fetch completion times
      try {
        const times = await courseTrackingService.getAllCompletionTimes();
        const timesMap = new Map(times.map((t) => [t.courseId, t]));
        setCompletionTimes(timesMap);
      } catch (error) {
        console.error("Error fetching completion times:", error);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      if (error instanceof Error && error.message === "Unauthorized") {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        message.error("Không thể tải danh sách khóa học");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Basic":
        return "green";
      case "Intermediate":
        return "blue";
      case "Advanced":
        return "red";
      default:
        return "default";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "Basic":
        return "Cơ bản";
      case "Intermediate":
        return "Trung cấp";
      case "Advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p style={{ marginTop: 20 }}>Đang tải khóa học của bạn...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <h2>Bạn chưa mua khóa học nào</h2>
              <p>Khám phá các khóa học hấp dẫn và bắt đầu học ngay hôm nay!</p>
            </div>
          }
        >
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/all-courses")}
          >
            Khám phá khóa học
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          <BookOutlined /> Khóa Học Của Tôi
        </h1>
        <p className={styles.subtitle}>
          Bạn đã đăng ký {courses.length} khóa học
        </p>
      </div>

      <div className={styles.courseGrid}>
        {courses.map((item) => (
          <Card
            key={item.enrollmentId}
            hoverable
            className={styles.courseCard}
            cover={
              <div className={styles.courseImageWrapper}>
                <img
                  alt={item.course.courseName}
                  src={item.course.avatarURL || "/images/default-course.jpg"}
                  className={styles.courseImage}
                />
                <div className={styles.levelBadge}>
                  <Tag color={getLevelColor(item.course.level)}>
                    {getLevelText(item.course.level)}
                  </Tag>
                </div>
              </div>
            }
            onClick={() => navigate(`/practice/${item.course.courseId}`)}
          >
            <div className={styles.courseContent}>
              <h3 className={styles.courseTitle}>{item.course.courseName}</h3>

              <p className={styles.courseDescription}>
                {item.course.courseDescription?.substring(0, 100)}
                {item.course.courseDescription?.length > 100 ? "..." : ""}
              </p>

              <div className={styles.instructorInfo}>
                <UserOutlined />
                <span>{item.course.instructor.userName}</span>
              </div>

              <div className={styles.courseStats}>
                <span>
                  <BookOutlined /> {item.course.totalChapters} chương
                </span>
                <span>
                  <UserOutlined /> {item.course.totalEnrollments} học viên
                </span>
              </div>

              <div className={styles.enrollmentInfo}>
                <div className={styles.enrolledDate}>
                  <ClockCircleOutlined />
                  <span>Đã mua: {formatDate(item.enrolledAt)}</span>
                </div>
                {item.payment && (
                  <div className={styles.paymentInfo}>
                    <Tag color="success">{item.payment.paymentMethod}</Tag>
                    <span className={styles.amount}>
                      {formatCurrency(item.payment.amount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Completion Time Info */}
              {completionTimes.has(item.course.courseId) && (
                <div className={styles.completionInfo}>
                  {completionTimes.get(item.course.courseId)?.isCompleted ? (
                    <Tag color="success" icon={<TrophyOutlined />}>
                      Hoàn thành:{" "}
                      {completionTimes
                        .get(item.course.courseId)
                        ?.totalHours.toFixed(1)}
                      h
                    </Tag>
                  ) : completionTimes.get(item.course.courseId)
                      ?.firstAccessAt ? (
                    <Tag color="processing" icon={<ClockCircleOutlined />}>
                      Đã học:{" "}
                      {completionTimes
                        .get(item.course.courseId)
                        ?.totalHours.toFixed(1)}
                      h
                    </Tag>
                  ) : null}
                </div>
              )}

              <Button
                type="primary"
                block
                size="large"
                className={styles.continueButton}
                icon={<RightOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/practice/${item.course.courseId}`);
                }}
              >
                Tiếp tục học
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {courses.length === pageSize && (
        <div className={styles.pagination}>
          <Button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Trang trước
          </Button>
          <span className={styles.pageInfo}>Trang {page + 1}</span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={courses.length < pageSize}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
