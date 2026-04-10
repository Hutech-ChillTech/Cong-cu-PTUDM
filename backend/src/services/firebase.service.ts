import admin from "../configs/firebaseAdminConfig";
import axios from "axios";
import createHttpError from "http-errors";

class FirebaseService {
  /**
   * Verify Firebase ID Token using Admin SDK
   */
  async verifyIdToken(idToken: string) {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      throw createHttpError(401, "Token không hợp lệ hoặc hết hạn");
    }
  }

  /**
   * Sign in with email and password using Firebase REST API
   */
  async signInWithEmailPassword(email: string, password: string) {
    try {
      const firebaseApiKey = process.env.FIREBASE_API_KEY;

      if (!firebaseApiKey) {
        throw createHttpError(500, "Firebase API Key chưa được cấu hình");
      }

      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        { email, password, returnSecureToken: true }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        const firebaseError = error.response.data.error.message;
        if (
          firebaseError === "INVALID_PASSWORD" ||
          firebaseError === "EMAIL_NOT_FOUND"
        ) {
          throw createHttpError(401, "Email hoặc mật khẩu không đúng");
        }
        throw createHttpError(401, `Đăng nhập thất bại: ${firebaseError}`);
      }
      throw error;
    }
  }

  /**
   * Create a new user in Firebase Authentication
   */
  async createUser(properties: {
    email: string;
    password?: string;
    displayName?: string;
  }) {
    try {
      const firebaseUser = await admin.auth().createUser({
        email: properties.email,
        password: properties.password,
        displayName: properties.displayName,
      });
      return firebaseUser;
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        throw createHttpError(400, "Email đã tồn tại trên Firebase");
      }
      if (error.code === "auth/invalid-password") {
        throw createHttpError(400, "Mật khẩu phải có ít nhất 6 ký tự");
      }
      throw error;
    }
  }
}

export default new FirebaseService();
