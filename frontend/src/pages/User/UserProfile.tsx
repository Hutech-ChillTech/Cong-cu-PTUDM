import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  List,
  Avatar,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Tabs,
  Badge,
  Tag,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  TrophyOutlined,
  LockOutlined,
  EditOutlined,
  RightOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import styles from "../../styles/UserProfile.module.css";
import { courseService } from "../../service/course.service";
import { uploadService } from "../../service/upload.service";
import { userService } from "../../service/user.service";
import { certificateService } from "../../service/certificate.service";

const { Option } = Select;
const { TabPane } = Tabs;

const API_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface User {
  userId: string;
  userName: string;
  email: string;
  gender: string;
  level: string;
  created_at: string;
  avatarURL?: string;
}

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

interface Certificate {
  certificateId: string;
  userId: string;
  courseId: string;
  certificateCode?: string;
  certificateTitle: string;
  pdfUrl?: string;
  viewUrl?: string;
  certificateURL?: string;
  qrCodeUrl?: string;
  totalScore: number;
  averageScore: number;
  maxScore: number;
  issuedAt: string;
  user?: {
    userName: string;
    email: string;
  };
  course?: {
    courseName: string;
    level: string;
  };
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);

  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ============ FETCH DATA ============
  useEffect(() => {
    // Nếu không có userId hoặc token, redirect về login
    if (!userId || !token) {
      message.warning("Vui lòng đăng nhập để tiếp tục");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // API 1: GET /users/:userId - Lấy thông tin cơ bản
        const userRes = await fetch(`${API_URL}/users/${userId}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });
        const userData = await userRes.json();

        if (userRes.status === 401) {
          message.error("Phiên đăng nhập hết hạn!");
          localStorage.clear();
          navigate("/login");
          return;
        }

        setUser(userData.data);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin:", err);
        message.error("Không thể tải thông tin người dùng!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token, navigate]);

  // ============ FETCH ENROLLED COURSES ============
  const fetchEnrolledCourses = async () => {
    setCoursesLoading(true);
    try {
      const data = await courseService.getEnrolledCourses(0, 100);
      setEnrolledCourses(data);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      if (error instanceof Error && error.message === "Unauthorized") {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setCoursesLoading(false);
    }
  };

  // Load enrolled courses when "courses" tab is active
  useEffect(() => {
    if (activeTab === "courses" && enrolledCourses.length === 0) {
      fetchEnrolledCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ============ FETCH CERTIFICATES ============
  const fetchCertificates = async () => {
    if (!userId) return;

    setCertificatesLoading(true);
    try {
      const data = await certificateService.getUserCertificates();
      console.log("📜 Certificates data:", data);
      if (data.length > 0) {
        console.log("📊 First certificate:", {
          certificateId: data[0]?.certificateId,
          certificateCode: data[0]?.certificateCode,
          pdfUrl: data[0]?.pdfUrl,
          viewUrl: data[0]?.viewUrl,
          certificateURL: data[0]?.certificateURL,
          qrCodeUrl: data[0]?.qrCodeUrl,
        });
      }
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      message.error("Không thể tải danh sách chứng chỉ");
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Load certificates when "certificates" tab is active
  useEffect(() => {
    if (activeTab === "certificates" && certificates.length === 0) {
      fetchCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ============ UPDATE USER ============
  interface UpdateUserValues {
    userName?: string;
    email?: string;
    gender?: string;
    level?: string;
    avatarURL?: string;
  }

  const handleUpdateUser = async (values: UpdateUserValues) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Cập nhật thất bại!");
      }

      setUser(data.data);
      message.success("Cập nhật thông tin thành công!");
      setIsEditModalVisible(false);
      editForm.resetFields();
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Lỗi cập nhật:", error);
      message.error(error.message || "Cập nhật thất bại!");
    }
  };

  // ============ CHANGE PASSWORD ============
  interface ChangePasswordValues {
    oldPassword: string;
    newPassword: string;
  }

  const handleChangePassword = async (values: ChangePasswordValues) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/change-password`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đổi mật khẩu thất bại!");
      }

      message.success("Đổi mật khẩu thành công!");
      setIsChangePasswordVisible(false);
      passwordForm.resetFields();
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Lỗi đổi mật khẩu:", error);
      message.error(error.message || "Đổi mật khẩu thất bại!");
    }
  };

  // ============ HELPER FUNCTIONS ============
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

  // ============ LOGOUT ============
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  // ============ AVATAR UPLOAD ============
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        message.error("Vui lòng chọn file hình ảnh!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error("Kích thước ảnh không được vượt quá 5MB!");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !userId) return;

    try {
      setUploadingAvatar(true);
      const result = await uploadService.uploadImage(avatarFile, "avatars");

      await userService.updateUser(userId, {
        avatarURL: result.url,
      });

      setUser((prev) => (prev ? { ...prev, avatarURL: result.url } : null));
      message.success("Cập nhật ảnh đại diện thành công!");
      setIsAvatarModalVisible(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Không thể cập nhật ảnh đại diện!");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ============ OPEN EDIT MODAL ============
  const openEditModal = () => {
    editForm.setFieldsValue({
      userName: user?.userName,
      email: user?.email,
      gender: user?.gender,
    });
    setIsEditModalVisible(true);
  };

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: "#888" }}>Đang tải thông tin...</p>
      </div>
    );
  }

  // ============ NOT LOGGED IN STATE ============
  if (!userId || !token || !user) {
    return (
      <div className={styles.loadingContainer}>
        <p style={{ fontSize: 18, color: "#d32f2f" }}>
          Vui lòng đăng nhập để xem hồ sơ cá nhân
        </p>
        <Button
          type="primary"
          size="large"
          style={{ marginTop: 16 }}
          onClick={() => navigate("/login")}
        >
          Đi tới trang đăng nhập
        </Button>
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div className={styles.profileContainer}>
      {/* ========== SIDEBAR ========== */}
      <div className={styles.sidebar}>
        <Card className={styles.userCard}>
          <div className={styles.avatarWrapper}>
            <Avatar
              size={100}
              src={user?.avatarURL}
              icon={!user?.avatarURL && <UserOutlined />}
              className={styles.avatar}
            />
            <button
              className={styles.avatarUploadButton}
              onClick={() => setIsAvatarModalVisible(true)}
              title="Thay đổi ảnh đại diện"
            >
              <CameraOutlined />
            </button>
          </div>
          <h3 className={styles.username}>
            {user?.userName || "Chưa đăng nhập"}
          </h3>
          <p className={styles.role}>HỌC VIÊN KHÓA HỌC ONLINE</p>

          <div className={styles.buttonGroup}>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              block
              onClick={() => navigate("/")}
            >
              Trang chủ
            </Button>
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              block
            >
              Thoát ra
            </Button>
          </div>
        </Card>

        <Card className={styles.menuCard}>
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                key: "info",
                icon: <UserOutlined />,
                text: "Thông tin cá nhân",
              },
              {
                key: "courses",
                icon: <BookOutlined />,
                text: "Khóa học của tôi",
                badge: enrolledCourses.length,
              },
              {
                key: "certificates",
                icon: <TrophyOutlined />,
                text: "Chứng chỉ của tôi",
              },
              {
                key: "roadmap",
                icon: <TrophyOutlined />,
                text: "Lộ trình học tập",
              },
              {
                key: "messages",
                icon: <MessageOutlined />,
                text: "Thông báo & Tin nhắn",
              },
            ]}
            renderItem={(item) => (
              <List.Item
                className={`${styles.menuItem} ${
                  activeTab === item.key ? styles.active : ""
                }`}
                onClick={() => setActiveTab(item.key)}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.text}</span>
                {item.badge !== undefined && (
                  <Badge
                    count={item.badge}
                    style={{
                      backgroundColor:
                        activeTab === item.key ? "#3b82f6" : "#ef4444",
                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                      fontWeight: "600",
                      fontSize: "12px",
                    }}
                  />
                )}
              </List.Item>
            )}
          />
        </Card>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className={styles.content}>
        <Card className={styles.mainCard}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* ========== TAB 1: Thông tin cá nhân ========== */}
            <TabPane tab="Thông tin cá nhân" key="info">
              <div className={styles.tabHeader}>
                <h2>🎓 Thông tin cá nhân</h2>
                <div>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={openEditModal}
                    style={{ marginRight: 10 }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    icon={<LockOutlined />}
                    onClick={() => setIsChangePasswordVisible(true)}
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>

              <div className={styles.infoList}>
                <p>
                  <strong>Tên đăng nhập:</strong> {user.userName}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Giới tính:</strong>{" "}
                  {user.gender === "MALE" ? "Nam" : "Nữ"}
                </p>
                <p>
                  <strong>Trình độ học viên:</strong> {user.level}
                </p>
                <p>
                  <strong>Ngày tham gia:</strong>{" "}
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </TabPane>

            {/* ========== TAB 2: Khóa học của tôi ========== */}
            <TabPane
              tab={`Khóa học của tôi (${enrolledCourses.length})`}
              key="courses"
            >
              <div className={styles.tabHeader}>
                <h2>📚 Khóa học đã đăng ký</h2>
                {enrolledCourses.length > 0 && (
                  <Button
                    type="primary"
                    onClick={() => navigate("/all-courses")}
                  >
                    Khám phá thêm
                  </Button>
                )}
              </div>

              {coursesLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Đang tải khóa học...</p>
                </div>
              ) : enrolledCourses.length > 0 ? (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
                  dataSource={enrolledCourses}
                  renderItem={(item) => (
                    <List.Item style={{ display: "flex", height: "100%" }}>
                      <Card
                        hoverable
                        className={styles.courseCard}
                        cover={
                          <img
                            alt={item.course.courseName}
                            src={
                              item.course.avatarURL ||
                              "/images/default-course.jpg"
                            }
                            style={{
                              width: "100%",
                              height: "160px",
                              objectFit: "cover",
                            }}
                          />
                        }
                        actions={[
                          <Button
                            type="primary"
                            icon={<RightOutlined />}
                            onClick={() =>
                              navigate(`/practice/${item.course.courseId}`)
                            }
                            key="learn"
                          >
                            Tiếp tục học
                          </Button>,
                        ]}
                      >
                        <div
                          style={{ position: "absolute", top: 10, right: 10 }}
                        >
                          <Tag color={getLevelColor(item.course.level)}>
                            {getLevelText(item.course.level)}
                          </Tag>
                        </div>
                        <Card.Meta
                          title={
                            <div
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.course.courseName}
                            </div>
                          }
                          description={
                            <div>
                              <p
                                style={{
                                  marginBottom: 8,
                                  height: "40px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {item.course.courseDescription ||
                                  "Không có mô tả"}
                              </p>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 8,
                                  fontSize: 12,
                                  color: "#666",
                                }}
                              >
                                <UserOutlined style={{ marginRight: 4 }} />
                                <span>{item.course.instructor.userName}</span>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: 12,
                                  marginBottom: 8,
                                }}
                              >
                                <span>
                                  <BookOutlined /> {item.course.totalChapters}{" "}
                                  chương
                                </span>
                                <span>
                                  <UserOutlined />{" "}
                                  {item.course.totalEnrollments} học viên
                                </span>
                              </div>

                              <div
                                style={{
                                  marginTop: 8,
                                  paddingTop: 8,
                                  borderTop: "1px solid #f0f0f0",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: 12,
                                    color: "#888",
                                    marginBottom: 4,
                                  }}
                                >
                                  <ClockCircleOutlined
                                    style={{ marginRight: 4 }}
                                  />
                                  <span>
                                    Đã mua: {formatDate(item.enrolledAt)}
                                  </span>
                                </div>
                                {item.payment && (
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Tag color="success" style={{ margin: 0 }}>
                                      {item.payment.paymentMethod}
                                    </Tag>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        color: "#52c41a",
                                      }}
                                    >
                                      {formatCurrency(item.payment.amount)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <BookOutlined
                    style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <h3>Bạn chưa đăng ký khóa học nào</h3>
                  <p style={{ color: "#888", marginBottom: 24 }}>
                    Khám phá các khóa học hấp dẫn và bắt đầu học ngay hôm nay!
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate("/all-courses")}
                  >
                    Khám phá khóa học
                  </Button>
                </div>
              )}
            </TabPane>

            {/* ========== TAB 3: Chứng chỉ của tôi ========== */}
            <TabPane
              tab={`Chứng chỉ của tôi (${certificates.length})`}
              key="certificates"
            >
              <div className={styles.tabHeader}>
                <h2>🎓 Chứng chỉ đã đạt được</h2>
              </div>

              {certificatesLoading ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16, color: "#888" }}>
                    Đang tải chứng chỉ...
                  </p>
                </div>
              ) : certificates.length > 0 ? (
                <List
                  grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 3,
                    xxl: 3,
                  }}
                  dataSource={certificates}
                  renderItem={(cert: Certificate) => (
                    <List.Item>
                      <Card
                        hoverable
                        className={styles.certificateCard}
                        cover={
                          <div
                            style={{
                              height: 200,
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: 48,
                            }}
                          >
                            🎓
                          </div>
                        }
                        actions={[
                          <Button
                            key="view"
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              console.log(
                                "🔍 Button clicked! Certificate:",
                                cert,
                              );

                              // Priority: pdfUrl > viewUrl > certificateURL
                              // Fix: Backend trả về empty string ('') thay vì null
                              const pdfUrl =
                                cert.pdfUrl && cert.pdfUrl.trim() !== ""
                                  ? cert.pdfUrl
                                  : null;
                              const viewUrl =
                                cert.viewUrl && cert.viewUrl.trim() !== ""
                                  ? cert.viewUrl
                                  : null;
                              const certificateURL =
                                cert.certificateURL &&
                                cert.certificateURL.trim() !== ""
                                  ? cert.certificateURL
                                  : null;

                              const url = pdfUrl || viewUrl || certificateURL;

                              console.log("📊 URL priority check:", {
                                pdfUrl: cert.pdfUrl,
                                viewUrl: cert.viewUrl,
                                certificateURL: cert.certificateURL,
                                cleanedPdfUrl: pdfUrl,
                                cleanedViewUrl: viewUrl,
                                cleanedCertificateURL: certificateURL,
                                selectedUrl: url,
                              });

                              if (!url) {
                                console.error("❌ No valid URL found!");
                                message.warning(
                                  "Chứng chỉ chưa có URL. Vui lòng liên hệ admin.",
                                );
                                return;
                              }

                              let certUrl: string;
                              if (pdfUrl) {
                                certUrl = pdfUrl;
                                console.log(
                                  "✅ Using pdfUrl (Cloudinary):",
                                  certUrl,
                                );
                              } else if (viewUrl) {
                                certUrl = `${import.meta.env.VITE_BACKEND_URL}${viewUrl}`;
                                console.log("✅ Using viewUrl:", certUrl);
                              } else if (certificateURL?.startsWith("http")) {
                                certUrl = certificateURL;
                                console.log(
                                  "✅ Using certificateURL (http):",
                                  certUrl,
                                );
                              } else if (
                                certificateURL?.startsWith("/certificates/")
                              ) {
                                certUrl = `${import.meta.env.VITE_BACKEND_URL}${certificateURL}`;
                                console.log(
                                  "✅ Using certificateURL (/certificates/):",
                                  certUrl,
                                );
                              } else if (certificateURL) {
                                certUrl = `${import.meta.env.VITE_BACKEND_URL}/certificates/view/${certificateURL}`;
                                console.log(
                                  "✅ Using certificateURL (filename):",
                                  certUrl,
                                );
                              } else {
                                console.error("❌ Invalid certificate URL!");
                                message.error("URL chứng chỉ không hợp lệ");
                                return;
                              }

                              console.log("🚀 Opening URL:", certUrl);
                              window.open(certUrl, "_blank");
                            }}
                          >
                            Xem
                          </Button>,
                          <Button
                            key="download"
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() => {
                              // Priority: pdfUrl > viewUrl > certificateURL
                              // Fix: Backend trả về empty string ('') thay vì null
                              const pdfUrl =
                                cert.pdfUrl && cert.pdfUrl.trim() !== ""
                                  ? cert.pdfUrl
                                  : null;
                              const viewUrl =
                                cert.viewUrl && cert.viewUrl.trim() !== ""
                                  ? cert.viewUrl
                                  : null;
                              const certificateURL =
                                cert.certificateURL &&
                                cert.certificateURL.trim() !== ""
                                  ? cert.certificateURL
                                  : null;

                              const url = pdfUrl || viewUrl || certificateURL;

                              if (!url) {
                                message.warning(
                                  "Chứng chỉ chưa có URL. Vui lòng liên hệ admin.",
                                );
                                return;
                              }

                              let certUrl: string;
                              if (pdfUrl) {
                                certUrl = pdfUrl;
                              } else if (viewUrl) {
                                certUrl = `${import.meta.env.VITE_BACKEND_URL}${viewUrl}`;
                              } else if (certificateURL?.startsWith("http")) {
                                certUrl = certificateURL;
                              } else if (
                                certificateURL?.startsWith("/certificates/")
                              ) {
                                certUrl = `${import.meta.env.VITE_BACKEND_URL}${certificateURL}`;
                              } else if (certificateURL) {
                                certUrl = `${import.meta.env.VITE_BACKEND_URL}/certificates/view/${certificateURL}`;
                              } else {
                                message.error("URL chứng chỉ không hợp lệ");
                                return;
                              }

                              window.open(certUrl, "_blank");
                            }}
                          >
                            Tải xuống
                          </Button>,
                        ]}
                      >
                        <Card.Meta
                          title={cert.certificateTitle || "Certificate"}
                          description={
                            <div>
                              <p style={{ margin: "8px 0", fontSize: 14 }}>
                                <strong>Khóa học:</strong>{" "}
                                {cert.course?.courseName || "N/A"}
                              </p>
                              <p style={{ margin: "8px 0", fontSize: 14 }}>
                                <strong>Điểm số:</strong>{" "}
                                <Tag
                                  color={
                                    cert.totalScore >= 90
                                      ? "green"
                                      : cert.totalScore >= 70
                                        ? "blue"
                                        : "orange"
                                  }
                                >
                                  {cert.totalScore}%
                                </Tag>
                              </p>
                              <p
                                style={{
                                  margin: "8px 0",
                                  fontSize: 12,
                                  color: "#888",
                                }}
                              >
                                <ClockCircleOutlined
                                  style={{ marginRight: 4 }}
                                />
                                Cấp ngày:{" "}
                                {new Date(cert.issuedAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </p>

                              {/* QR Code Display */}
                              {cert.qrCodeUrl && (
                                <div
                                  style={{
                                    textAlign: "center",
                                    marginTop: 12,
                                    paddingTop: 12,
                                    borderTop: "1px solid #f0f0f0",
                                  }}
                                >
                                  <img
                                    src={cert.qrCodeUrl}
                                    alt="QR Code"
                                    style={{
                                      width: 80,
                                      height: 80,
                                      border: "2px solid #d4af37",
                                      borderRadius: 8,
                                      padding: 4,
                                      background: "white",
                                    }}
                                  />
                                  <p
                                    style={{
                                      fontSize: 11,
                                      color: "#999",
                                      marginTop: 6,
                                      marginBottom: 0,
                                    }}
                                  >
                                    Quét để xác thực
                                  </p>
                                </div>
                              )}
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <TrophyOutlined
                    style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <h3>Bạn chưa có chứng chỉ nào</h3>
                  <p style={{ color: "#888", marginBottom: 24 }}>
                    Hoàn thành các khóa học để nhận chứng chỉ!
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate("/all-courses")}
                  >
                    Khám phá khóa học
                  </Button>
                </div>
              )}
            </TabPane>

            {/* ========== TAB 4: Lộ trình học tập ========== */}
            <TabPane tab="Lộ trình học tập" key="roadmap">
              <h2>Lộ trình học tập của bạn</h2>
              <p className={styles.emptyText}>Tính năng đang phát triển...</p>
            </TabPane>

            {/* ========== TAB 5: Thông báo ========== */}
            <TabPane tab="Thông báo" key="messages">
              <h2>💬 Thông báo & Tin nhắn</h2>
              <p className={styles.emptyText}>Bạn chưa có thông báo mới.</p>
            </TabPane>
          </Tabs>
        </Card>
      </div>

      {/* ========== MODAL: Edit User ========== */}
      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        centered
      >
        <Form form={editForm} onFinish={handleUpdateUser} layout="vertical">
          <Form.Item
            label="Tên đăng nhập"
            name="userName"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MessageOutlined />} />
          </Form.Item>

          <Form.Item label="Giới tính" name="gender">
            <Select>
              <Option value="MALE">Nam</Option>
              <Option value="FEMALE">Nữ</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật thông tin
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ========== MODAL: Upload Avatar ========== */}
      <Modal
        title="Thay đổi ảnh đại diện"
        open={isAvatarModalVisible}
        onCancel={() => {
          setIsAvatarModalVisible(false);
          setAvatarFile(null);
          setAvatarPreview(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsAvatarModalVisible(false);
              setAvatarFile(null);
              setAvatarPreview(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            loading={uploadingAvatar}
            disabled={!avatarFile}
            onClick={handleUploadAvatar}
          >
            Tải lên
          </Button>,
        ]}
        centered
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          {avatarPreview ? (
            <Avatar
              size={150}
              src={avatarPreview}
              style={{ marginBottom: 20 }}
            />
          ) : (
            <Avatar
              size={150}
              src={user?.avatarURL}
              icon={!user?.avatarURL && <UserOutlined />}
              style={{ marginBottom: 20 }}
            />
          )}

          <div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarFileChange}
            />
            <Button
              icon={<CameraOutlined />}
              onClick={() => document.getElementById("avatar-upload")?.click()}
              block
            >
              Chọn ảnh mới
            </Button>
            <p style={{ marginTop: 10, color: "#888", fontSize: 13 }}>
              Định dạng: JPG, PNG, GIF. Tối đa 5MB
            </p>
          </div>
        </div>
      </Modal>

      {/* ========== MODAL: Change Password ========== */}
      <Modal
        title="Đổi mật khẩu"
        open={isChangePasswordVisible}
        onCancel={() => setIsChangePasswordVisible(false)}
        footer={null}
        centered
      >
        <Form
          form={passwordForm}
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            label="Mật khẩu cũ"
            name="oldPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
