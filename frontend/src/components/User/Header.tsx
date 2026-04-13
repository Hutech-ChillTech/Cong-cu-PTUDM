import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import styles from "../../styles/UserHeader.module.css";
import { jwtDecode } from "jwt-decode";

// 🧩 Kiểu dữ liệu payload trong JWT
interface JWTPayload {
  email: string;
  userId: string;
  userName: string;
  exp?: number;
}

// 🧱 Component
const UserHeader: React.FC = () => {
  const [user, setUser] = useState<{
    email?: string;
    userId?: string;
    userName?: string;
  } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Token đã hết hạn. Đang đăng xuất...");
          handleLogout();
        } else {
          setUser({
            email: decoded.email,
            userId: decoded.userId,
            userName: decoded.userName,
          });
        }
      } catch (err) {
        console.error("Token không hợp lệ:", err);
        handleLogout();
      }
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${styles["custom-navbar"]} ${
        scrolled ? styles["navbar-scrolled"] : ""
      } px-4 transition-all`}
    >
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className={styles["logo-wrapper"]}>
            <img
              src="/images/SkillCoder_Logo.png"
              alt="SkillCoder"
              className={styles["logo-img"]}
            />
          </div>
          <span className={`${styles["brand-text"]} ms-2`}>SkillCoder</span>
        </Link>

        {/* Toggle cho mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <Link className={styles["nav-link"]} to="/">
                Trang chủ
              </Link>
            </li>
            <li className="nav-item">
              <Link className={styles["nav-link"]} to="/all-courses">
                Khóa học
              </Link>
            </li>
            <li className="nav-item">
              <Link className={styles["nav-link"]} to="/learningPathMap">
                Lộ trình
              </Link>
            </li>
            <li className="nav-item">
              <Link className={styles["nav-link"]} to="/blogs">
                Blog
              </Link>
            </li>
            <li className="nav-item">
              <Link className={styles["nav-link"]} to="/contact">
                Liên hệ
              </Link>
            </li>
            <li className="nav-item">
              <Link className={styles["nav-link"]} to="/gamification">
                Xếp hạng
              </Link>
            </li>

            {/* Search Icon */}
            <li className="nav-item">
              <Link
                className={`${styles["nav-link"]} ${styles["search-icon"]}`}
                to="/search"
                title="Tìm kiếm"
              >
                <SearchOutlined />
              </Link>
            </li>

            <div className={styles["nav-divider"]}></div>

            {/* Auth Buttons */}
            {!user ? (
              <div className="d-flex align-items-center gap-2 ms-lg-2">
                <li className="nav-item">
                  <Link to="/login" className={styles["btn-login"]}>
                    Đăng nhập
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className={styles["btn-register"]}>
                    Đăng ký
                  </Link>
                </li>
              </div>
            ) : (
              <li className="nav-item dropdown ms-lg-3">
                <button
                  className={`${styles["user-profile-btn"]} dropdown-toggle`}
                  data-bs-toggle="dropdown"
                >
                  <UserOutlined className="me-2" />
                  <span className="d-none d-sm-inline">{user.userName || user.email}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      Hồ sơ cá nhân
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger py-2"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};


export default UserHeader;
