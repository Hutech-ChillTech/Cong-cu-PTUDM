import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { certificateService } from "../../service/certificate.service";
import { 
  Card, 
  Result, 
  Button, 
  Typography, 
  Divider, 
  Spin, 
  Badge,
  Tag,
  message
} from "antd";
import { 
  CheckCircleFilled, 
  SafetyCertificateOutlined, 
  DownloadOutlined,
  HomeOutlined
} from "@ant-design/icons";
import PageTransition from "../../components/PageTransition/PageTransition";
import "../../styles/CertificateVerify.css";

const { Title, Text } = Typography;

interface Certificate {
    certificateId: string;
    userId: string;
    courseId: string;
    certificateCode?: string;      // Mã chứng chỉ
    certificateTitle: string;
    pdfUrl?: string;               // Cloudinary URL
    viewUrl?: string;              // Backend normalized URL
    certificateURL?: string;       // Legacy format
    qrCodeUrl?: string;            // QR code
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

const CertificateVerify: React.FC = () => {
  const { certificateCode } = useParams<{ certificateCode: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateCode) {
      fetchCertificate(certificateCode);
    }
  }, [certificateCode]);

  const fetchCertificate = async (id: string) => {
    try {
      setLoading(true);
      const data = await certificateService.getCertificateById(id);
      if (data) {
        setCertificate(data);
      } else {
        setError("Không tìm thấy thông tin chứng chỉ");
      }
    } catch (err) {
      console.error("Error verifying certificate:", err);
      setError("Chứng chỉ không hợp lệ hoặc không tồn tại trong hệ thống");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="verify-loading">
        <Spin size="large" tip="Đang xác thực chứng chỉ..." />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <PageTransition>
        <div className="verify-container">
          <Card className="verify-card error-card">
            <Result
              status="error"
              title="Chứng chỉ không hợp lệ"
              subTitle={error || "Mã chứng chỉ này không tồn tại hoặc đã bị thu hồi."}
              extra={[
                <Link to="/" key="home">
                  <Button type="primary" icon={<HomeOutlined />}>Trang chủ</Button>
                </Link>
              ]}
            />
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="verify-container">
        <div className="verify-badge">
          <Badge.Ribbon text="Hợp lệ" color="green">
             <div style={{ height: 20 }}></div>
          </Badge.Ribbon>
        </div>

        <Card className="verify-card">
          <div className="verify-header">
            <SafetyCertificateOutlined className="verify-icon" />
            <Title level={2}>Xác thực chứng chỉ hệ thống</Title>
            <Tag color="success" icon={<CheckCircleFilled />}>Chứng chỉ hợp lệ</Tag>
          </div>

          <Divider />

          <div className="certificate-info">
            <div className="info-row">
              <Text type="secondary">Học viên:</Text>
              <Text strong className="info-value">{certificate.user?.userName || "N/A"}</Text>
            </div>
            <div className="info-row">
              <Text type="secondary">Khóa học:</Text>
              <Text strong className="info-value">{certificate.course?.courseName || certificate.certificateTitle}</Text>
            </div>
            <div className="info-row">
              <Text type="secondary">Ngày cấp:</Text>
              <Text className="info-value">{new Date(certificate.issuedAt).toLocaleDateString("vi-VN")}</Text>
            </div>
            <div className="info-row">
              <Text type="secondary">Mã chứng chỉ:</Text>
              <Text code className="info-value">{certificate.certificateId}</Text>
            </div>
          </div>

          <Divider />

          <div className="certificate-preview">
            <div className="preview-educational-style">
              <div className="certificate-outer-border">
                <div className="certificate-inner-border">
                  <div className="certificate-content">
                    <div className="cert-header">
                      <div className="org-type">IT TRAINING CENTER</div>
                      <div className="org-name">HUTECHEDU.PRO.VN</div>
                    </div>

                    <div className="cert-main-title">CERTIFICATE</div>
                    <div className="cert-sub-title">of Completion</div>

                    <div className="cert-certify-text">THIS IS TO CERTIFY THAT</div>
                    <div className="cert-recipient-name">
                      {certificate.user?.userName || "N/A"}
                    </div>

                    <div className="cert-divider">
                      <div className="divider-line"></div>
                      <div className="divider-diamond"></div>
                      <div className="divider-line"></div>
                    </div>

                    <div className="cert-course-info">
                      <div className="course-status-text">Has successfully completed the course</div>
                      <div className="course-name-display">
                        {certificate.course?.courseName || certificate.certificateTitle}
                      </div>
                      <div className="course-grade">
                        Grade: <span className="grade-value">Excellent</span>
                      </div>
                    </div>

                    <div className="cert-footer-new">
                      <div className="footer-left">
                        <div className="cert-no">No# {certificate.certificateId.substring(0, 8).toUpperCase()}</div>
                        <div className="cert-verify-link">
                          Verify at<br />
                          <small>hutechedu.pro.vn/verify/{certificate.certificateId.substring(0, 8)}</small>
                        </div>
                      </div>

                      <div className="footer-center">
                        <div className="gold-seal">
                          <div className="seal-circle"></div>
                          <div className="ribbon-left"></div>
                          <div className="ribbon-right"></div>
                        </div>
                      </div>

                      <div className="footer-right">
                        <div className="cert-date-display">
                          Date {new Date(certificate.issuedAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="verify-actions">
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              size="large"
              onClick={() => {
                // Priority: pdfUrl > viewUrl > certificateURL
                const url = certificate.pdfUrl || certificate.viewUrl || certificate.certificateURL;
                
                if (!url) {
                  message.warning("Chứng chỉ đang được xử lý");
                  return;
                }

                let certUrl: string;
                
                if (certificate.pdfUrl) {
                  // BEST: Cloudinary URL
                  certUrl = certificate.pdfUrl;
                } else if (certificate.viewUrl) {
                  // GOOD: Backend normalized URL
                  certUrl = `${import.meta.env.VITE_BACKEND_URL}${certificate.viewUrl}`;
                } else if (certificate.certificateURL?.startsWith("http")) {
                  certUrl = certificate.certificateURL;
                } else if (certificate.certificateURL?.startsWith("/certificates/")) {
                  certUrl = `${import.meta.env.VITE_BACKEND_URL}${certificate.certificateURL}`;
                } else if (certificate.certificateURL) {
                  certUrl = `${import.meta.env.VITE_BACKEND_URL}/certificates/view/${certificate.certificateURL}`;
                } else {
                  message.error("URL chứng chỉ không hợp lệ");
                  return;
                }
                
                window.open(certUrl, '_blank');
              }}
            >
              Tải chứng chỉ (PDF)
            </Button>
            <Link to="/">
              <Button icon={<HomeOutlined />} size="large">Quay về trang chủ</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default CertificateVerify;
