import {
  type LoginResponse,
  type Register,
  type Login,
} from "../types/login.types";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const authService = {
  login: async (loginData: Login): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...loginData,
          returnSecureToken: true,
        }),
      });

      const resData = await response.json();
      console.log("Dữ liệu chuẩn bị gửi về: ", resData);
      if (!response.ok) {
        throw new Error(resData.message || "Đăng nhập thất bại");
      }
      return resData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (registerData: Register) => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Đăng ký thất bại");
      }

      return resData;
    } catch (error) {
      console.error("Error fetching register: ", error);
      throw error;
    }
  },

  // 3. Google Login
  googleLogin: async (idToken: string): Promise<LoginResponse> => {
    try {
      console.log("Calling Google Login API:", `${API_URL}/users/google-login`);

      const response = await fetch(`${API_URL}/users/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text.substring(0, 200));
        throw new Error(
          "Backend server không phản hồi đúng định dạng. Vui lòng kiểm tra backend server có đang chạy không."
        );
      }

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Đăng nhập Google thất bại");
      }

      return resData;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  },

  // 4. Hàm Logout
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("uid");
    localStorage.removeItem("user");
  },
};
