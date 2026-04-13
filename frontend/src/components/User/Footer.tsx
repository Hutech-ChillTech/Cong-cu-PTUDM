import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../../styles/UserFooter.module.css";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const Footer: React.FC = () => {
  return (
    <footer className={`${styles["custom-footer"]} pt-5`}>
      <div className="container">
        <div className="row g-4">
          {/* Brand & Social */}
          <div className="col-lg-4 col-md-12">
            <div className="d-flex align-items-center mb-4">
              <img src="/images/SkillCoder_Logo.png" alt="SkillCoder" className={styles["footer-logo"]} />
              <h4 className="ms-2 mb-0 fw-bold text-white">SkillCoder</h4>
            </div>
            <p className="text-secondary mb-4">
              Nền tảng học lập trình hàng đầu cho thế hệ mới. Đam mê, sáng tạo và không ngừng học hỏi để làm chủ công nghệ tương lai.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className={`${styles["social-link"]} ${styles["facebook"]}`}>
                <FacebookOutlined />
              </a>
              <a href="#" className={`${styles["social-link"]} ${styles["twitter"]}`}>
                <TwitterOutlined />
              </a>
              <a href="#" className={`${styles["social-link"]} ${styles["instagram"]}`}>
                <InstagramOutlined />
              </a>
              <a href="#" className={`${styles["social-link"]} ${styles["linkedin"]}`}>
                <LinkedinOutlined />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-4">
            <h5 className="text-white fw-bold mb-4">Khám phá</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/all-courses" className={styles["footer-link"]}>Khóa học</Link></li>
              <li className="mb-2"><Link to="/learningPathMap" className={styles["footer-link"]}>Lộ trình học</Link></li>
              <li className="mb-2"><Link to="/blogs" className={styles["footer-link"]}>Tin tức & Blog</Link></li>
              <li className="mb-2"><Link to="/gamification" className={styles["footer-link"]}>Bảng xếp hạng</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-4">
            <h5 className="text-white fw-bold mb-4">Liên hệ</h5>
            <ul className="list-unstyled">
              <li className="d-flex align-items-start mb-3 text-secondary">
                <EnvironmentOutlined className="mt-1 me-3 text-primary" />
                <span>Số 458, Đường Lê Văn Việt, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </li>
              <li className="d-flex align-items-center mb-3 text-secondary">
                <MailOutlined className="me-3 text-primary" />
                <span>contact@skillcoder.edu.vn</span>
              </li>
              <li className="d-flex align-items-center mb-3 text-secondary">
                <PhoneOutlined className="me-3 text-primary" />
                <span>(028) 1234 5678</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="col-lg-3 col-md-4">
            <h5 className="text-white fw-bold mb-4">Giờ làm việc</h5>
            <ul className="list-unstyled text-secondary">
              <li className="mb-2 d-flex justify-content-between">
                <span>Thứ 2 - Thứ 6:</span>
                <span className="text-white">08:00 - 21:00</span>
              </li>
              <li className="mb-2 d-flex justify-content-between">
                <span>Thứ 7 - CN:</span>
                <span className="text-white">09:00 - 18:00</span>
              </li>
              <li className="mt-4">
                <div className={styles["status-badge"]}>
                  <div className={styles["status-dot"]}></div>
                  Đang hoạt động trực tuyến
                </div>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-5 border-secondary opacity-25" />

        <div className="row pb-4 align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="small text-secondary mb-md-0">
              © {new Date().getFullYear()} SkillCoder. Tất cả các quyền được bảo lưu.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-4 small">
              <a href="#" className="text-secondary text-decoration-none">Chính sách bảo mật</a>
              <a href="#" className="text-secondary text-decoration-none">Điều khoản sử dụng</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
