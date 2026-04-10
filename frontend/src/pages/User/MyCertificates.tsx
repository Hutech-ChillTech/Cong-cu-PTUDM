import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { certificateService } from "../../service/certificate.service";
import { useToast } from "../../contexts/ToastContext";
import {
  Card,
  Button,
  Badge,
  Space,
  Skeleton,
  Empty,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import PageTransition from "../../components/PageTransition/PageTransition";
import "../../styles/MyCertificates.css";

const { Title, Text, Paragraph } = Typography;

interface Certificate {
  certificateId: string;
  courseId: string;
  certificateCode?: string; // Mã chứng chỉ (new format)
  certificateTitle: string;
  pdfUrl?: string; // URL PDF từ Cloudinary (new format)
  viewUrl?: string; // Backend-generated view URL (normalized)
  certificateURL?: string; // Legacy format (fallback)
  qrCodeUrl?: string; // QR code URL (optional)
  issuedAt: string;
  totalScore?: number;
  averageScore?: number;
  maxScore?: number;
  course?: {
    courseName: string;
    level: string;
  };
}

const MyCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching certificates from API...");

      const data = await certificateService.getUserCertificates();

      console.log("📜 Certificates data:", data);
      console.log("📊 Total certificates:", data.length);

      if (data.length > 0) {
        console.log("📊 First certificate:", {
          certificateId: data[0]?.certificateId,
          certificateCode: data[0]?.certificateCode,
          totalScore: data[0]?.totalScore,
          averageScore: data[0]?.averageScore,
          maxScore: data[0]?.maxScore,
          pdfUrl: data[0]?.pdfUrl,
          viewUrl: data[0]?.viewUrl,
          certificateURL: data[0]?.certificateURL,
          qrCodeUrl: data[0]?.qrCodeUrl,
        });
      }

      setCertificates(data);
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      console.error("❌ Error fetching certificates:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error response:", err.response?.data);
      showToast("error", err.message || "Không thể tải danh sách chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (cert: Certificate, title: string) => {
    // Priority: pdfUrl (Cloudinary) > viewUrl (Backend normalized) > certificateURL (Legacy)
    const url = cert.pdfUrl || cert.viewUrl || cert.certificateURL;

    if (!url) {
      showToast("warning", "Chứng chỉ đang được xử lý, vui lòng thử lại sau");
      return;
    }

    console.log("🔍 Certificate data:", {
      pdfUrl: cert.pdfUrl,
      viewUrl: cert.viewUrl,
      certificateURL: cert.certificateURL,
      certificateCode: cert.certificateCode,
      usingFormat: cert.pdfUrl
        ? "NEW (Cloudinary)"
        : cert.viewUrl
          ? "NORMALIZED (Backend)"
          : "LEGACY (Manual)",
    });

    let finalUrl: string;

    if (cert.pdfUrl) {
      // BEST: Cloudinary URL - use directly
      finalUrl = cert.pdfUrl;
      console.log("✅ Using Cloudinary URL:", finalUrl);
    } else if (cert.viewUrl) {
      // GOOD: Backend normalized URL - use directly
      finalUrl = `${import.meta.env.VITE_BACKEND_URL}${cert.viewUrl}`;
      console.log("✅ Using Backend normalized URL:", finalUrl);
    } else if (cert.certificateURL) {
      // FALLBACK: Legacy format - manual construction
      if (cert.certificateURL.startsWith("http")) {
        finalUrl = cert.certificateURL;
      } else if (cert.certificateURL.startsWith("/certificates/")) {
        finalUrl = `${import.meta.env.VITE_BACKEND_URL}${cert.certificateURL}`;
      } else {
        finalUrl = `${import.meta.env.VITE_BACKEND_URL}/certificates/view/${cert.certificateURL}`;
      }
      console.log("⚠️ Using LEGACY format (manual):", finalUrl);
    } else {
      showToast("error", "URL chứng chỉ không hợp lệ");
      return;
    }

    // Download
    const link = document.createElement("a");
    link.href = finalUrl;
    link.target = "_blank";
    link.download = `Chung_chi_${title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ Opening PDF from:", finalUrl);
  };

  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "#52c41a";
      case "intermediate":
        return "#1890ff";
      case "advanced":
        return "#722ed1";
      default:
        return "#8c8c8c";
    }
  };

  const getLevelText = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      default:
        return level || "N/A";
    }
  };

  return (
    <PageTransition>
      <div className="my-certificates-container">
        <div className="header-section">
          <div className="header-content">
            <SafetyCertificateOutlined className="header-icon" />
            <div>
              <Title level={2}>Chứng chỉ của tôi</Title>
              <Text type="secondary">
                Danh sách các chứng chỉ bạn đã đạt được sau khi hoàn thành khóa
                học
              </Text>
            </div>
          </div>
        </div>

        {loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} sm={24} md={12} lg={8} key={i}>
                <Card>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : certificates.length > 0 ? (
          <>
            <div className="certificates-stats">
              <Card className="stats-card">
                <Space size="large">
                  <div className="stat-item">
                    <TrophyOutlined className="stat-icon" />
                    <div>
                      <Text type="secondary">Tổng chứng chỉ</Text>
                      <Title level={3}>{certificates.length}</Title>
                    </div>
                  </div>
                </Space>
              </Card>
            </div>

            <Row gutter={[24, 24]} className="certificates-grid">
              {certificates.map((cert) => (
                <Col xs={24} sm={24} md={12} lg={8} key={cert.certificateId}>
                  <Card className="certificate-card" hoverable>
                    <div className="certificate-header">
                      <div className="certificate-icon-wrapper">
                        <SafetyCertificateOutlined className="certificate-icon" />
                      </div>
                      <Badge
                        status="success"
                        text="Đã hoàn thành"
                        className="certificate-badge"
                      />
                    </div>

                    <Divider />

                    <div className="certificate-body">
                      <Title level={4} className="course-name">
                        {cert.course?.courseName || cert.certificateTitle}
                      </Title>

                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        {cert.course?.level && (
                          <div className="info-row">
                            <Text type="secondary">Cấp độ:</Text>
                            <Badge
                              color={getLevelColor(cert.course.level)}
                              text={getLevelText(cert.course.level)}
                            />
                          </div>
                        )}

                        {(cert.totalScore !== undefined ||
                          cert.averageScore !== undefined) && (
                          <div className="info-row">
                            <Text type="secondary">Điểm số:</Text>
                            <Text strong style={{ color: "#52c41a" }}>
                              {cert.totalScore !== undefined &&
                              cert.maxScore !== undefined
                                ? `${cert.totalScore}/${cert.maxScore} (${((cert.totalScore / cert.maxScore) * 100).toFixed(1)}%)`
                                : cert.averageScore !== undefined
                                  ? `${cert.averageScore.toFixed(1)}/100`
                                  : "N/A"}
                            </Text>
                          </div>
                        )}

                        <div className="info-row">
                          <CalendarOutlined style={{ color: "#8c8c8c" }} />
                          <Text type="secondary">
                            {new Date(cert.issuedAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </Text>
                        </div>
                      </Space>
                    </div>

                    <Divider />

                    <div className="certificate-actions">
                      <Link to={`/certificate/verify/${cert.certificateId}`}>
                        <Button icon={<EyeOutlined />} type="default" block>
                          Xem chi tiết
                        </Button>
                      </Link>
                      <Button
                        icon={<DownloadOutlined />}
                        type="primary"
                        block
                        onClick={() =>
                          handleDownload(
                            cert,
                            cert.course?.courseName || cert.certificateTitle,
                          )
                        }
                      >
                        Tải PDF
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <Card className="empty-state-card">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Paragraph>
                    Bạn chưa có chứng chỉ nào. Hãy hoàn thành khóa học để nhận
                    chứng chỉ nhé!
                  </Paragraph>
                </div>
              }
            >
              <Link to="/all-courses">
                <Button type="primary" size="large">
                  Khám phá khóa học
                </Button>
              </Link>
            </Empty>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default MyCertificates;
