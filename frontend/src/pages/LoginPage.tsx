import React, { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOutlined } from "@ant-design/icons";
import styles from "../styles/LoginPage.module.css";
import { jwtDecode } from "jwt-decode";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../configs/firebaseConfig";
import { authService } from "../service/auth.service";
import { type DecodedToken, type Login } from "../types/login.types";
import { useToast } from "../contexts/ToastContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Tạo object dữ liệu theo interface Login
      const loginData: Login = { email, password };

      // 2. Gọi service với object vừa tạo
      const res = await authService.login(loginData);

      // 3. Lấy token từ response (res.data)
      const token = res.data;
      if (!token || typeof token !== "string") {
        toast.error("Token không hợp lệ từ server!");
        return;
      }

      // 4. Decode token để lấy thông tin người dùng
      const decoded = jwtDecode<DecodedToken>(token);
      const roleFromToken = decoded.roles?.[0] || decoded.role || "user";
      const normalizedRole = roleFromToken.trim().toLowerCase();
      const userName = decoded.email?.split("@")[0] || "Người dùng";

      // 5. Lưu thông tin vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("username", userName);
      localStorage.setItem("userId", decoded.userId); // ✅ Đổi từ "uid" thành "userId"
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: decoded.userId,
          email: decoded.email,
          role: normalizedRole,
          userName,
        }),
      );

      // 6. Thông báo và điều hướng
      toast.success(`Đăng nhập thành công! Xin chào ${userName} 👋`);
      setTimeout(() => {
        navigate(normalizedRole === "admin" ? "/admin/dashboard" : "/");
      }, 500);
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(
        err.message ||
          err.response?.data?.message ||
          "Email hoặc mật khẩu không đúng!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // 1. Đăng nhập với Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // 2. Gửi idToken đến backend để xác thực
      const res = await authService.googleLogin(idToken);

      // 3. Lấy token từ backend response
      // Backend có thể trả về: res.data (string) hoặc res.data.token (object)
      const token = typeof res.data === "string" ? res.data : res.data?.token;

      console.log("📊 Google login response:", {
        resData: res.data,
        extractedToken: token,
        tokenType: typeof token,
      });

      if (!token || typeof token !== "string") {
        console.error("❌ Invalid token format:", { res, token });
        toast.error("Token không hợp lệ từ server!");
        return;
      }

      // 4. Decode token để lấy thông tin người dùng
      const decoded = jwtDecode<DecodedToken>(token);
      const roleFromToken = decoded.roles?.[0] || decoded.role || "user";
      const normalizedRole = roleFromToken.trim().toLowerCase();
      const userName =
        decoded.name ||
        user.displayName ||
        decoded.email?.split("@")[0] ||
        "Người dùng";

      // 5. Lưu thông tin vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("username", userName);
      localStorage.setItem("userId", decoded.userId);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: decoded.userId,
          email: decoded.email,
          role: normalizedRole,
          userName,
        }),
      );

      // 6. Thông báo và điều hướng
      toast.success(`Đăng nhập Google thành công! Xin chào ${userName} 👋`);
      setTimeout(() => {
        navigate(normalizedRole === "admin" ? "/admin/dashboard" : "/");
      }, 500);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Google login error:", err);
      toast.error(
        err.message || "Đăng nhập Google thất bại. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["login-gradient-background"]}>
      <div className={styles["login-container"]}>
        <form className={styles["login-form"]} onSubmit={handleLogin}>
          <h2 className={styles["login-title"]}>Đăng nhập</h2>

          <input
            type="email"
            className={styles["login-input"]}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className={styles["login-input"]}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles["login-button"]}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          <button
            type="button"
            className={styles["google-button"]}
            onClick={handleGoogleLogin}
          >
            <GoogleOutlined className={styles["google-icon"]} />
            Đăng nhập với Google
          </button>

          <div className={styles["login-footer"]}>
            <span>Bạn chưa có tài khoản? </span>
            <Link to="/register">Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
