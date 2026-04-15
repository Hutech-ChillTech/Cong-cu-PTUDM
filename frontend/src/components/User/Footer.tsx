import React from "react";
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
    <footer className={`text-white pt-5 ${styles["custom-footer"]}`}>
      <div className="container">
        <div className="row text-center text-md-start">
          {/* About */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">🎓 Về chúng tôi</h5>
            <p>
              Nền tảng học tập hiện đại giúp bạn nâng cao kỹ năng và phát triển bản thân mỗi ngày.
            </p>
            <div className="d-flex justify-content-center justify-content-md-start gap-2 mt-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-light btn-sm rounded-circle"
              >
                <FacebookOutlined />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-light btn-sm rounded-circle"
              >
                <TwitterOutlined />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-light btn-sm rounded-circle"
              >
                <InstagramOutlined />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-light btn-sm rounded-circle"
              >
                <LinkedinOutlined />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">📫 Liên hệ</h5>
            <ul className="list-unstyled small">
              <li>
                <EnvironmentOutlined className="me-2" /> TP. Hồ Chí Minh, Việt Nam
              </li>
              <li>
                <MailOutlined className="me-2" /> support@example.com
              </li>
              <li>
                <PhoneOutlined className="me-2" /> +84 123 456 789
              </li>
              <li>
                <ClockCircleOutlined className="me-2" /> Thứ 2 - CN: 8h - 22h
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">⏰ Giờ hoạt động</h5>
            <table className="table text-white table-borderless small">
              <tbody>
                <tr>
                  <td>Thứ 2 - Thứ 5:</td>
                  <td className="text-end">8:00 - 21:00</td>
                </tr>
                <tr>
                  <td>Thứ 6 - Thứ 7:</td>
                  <td className="text-end">8:00 - 1:00</td>
                </tr>
                <tr>
                  <td>Chủ nhật:</td>
                  <td className="text-end">9:00 - 22:00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`text-center py-3 ${styles["footer-bottom"]}`}>
        © {new Date().getFullYear()}{" "}
        <span className="text-warning">SkillCoder.com</span>
      </div>
    </footer>
  );
};

export default Footer;
