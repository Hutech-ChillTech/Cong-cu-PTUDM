import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import styles from "../styles/RegisterPage.module.css";
import { authService } from "../service/auth.service";

interface RegisterForm {
  userName: string;
  password: string;
  email: string;
  level: string;
  gender: string;
}

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    userName: "",
    password: "",
    email: "",
    level: "Basic",
    gender: "MALE",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await authService.register(form);
      message.success("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err: unknown) {
      const error = err as Error;
      message.error(
        error.message || "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.",
      );
    }
  };

  return (
    <div className={styles["register-gradient-background"]}>
      <div className={styles["register-container"]}>
        <h2 className={styles["register-title"]}>Đăng ký tài khoản</h2>

        <form onSubmit={handleRegister}>
          {/* Tên người dùng */}
          <input
            type="text"
            className={styles["register-input"]}
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Tên người dùng"
            required
          />

          {/* Email */}
          <input
            type="email"
            className={styles["register-input"]}
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />

          {/* Mật khẩu */}
          <div className={styles["password-container"]}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles["register-input"]}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              required
            />
            <span
              className={styles["password-toggle"]}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          </div>

          {/* 🎓 Level */}
          <select
            className={styles["register-select"]}
            name="level"
            value={form.level}
            onChange={handleChange}
          >
            <option value="Basic">Basic</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Giới tính */}
          <select
            className={styles["register-select"]}
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>

          <button type="submit" className={styles["register-button"]}>
            Đăng ký
          </button>

          <div className={styles["register-footer"]}>
            Đã có tài khoản?{" "}
            <Link to="/login" className={styles["text-link"]}>
              Đăng nhập tại đây
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
