import admin from "firebase-admin";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * Khởi tạo Firebase Admin SDK.
 * Hỗ trợ 2 cách:
 * 1. JSON string trực tiếp trong env var FIREBASE_ADMIN_SDK_JSON (dùng cho production/Render)
 * 2. Đường dẫn file .json (dùng cho local dev)
 */
export const initializeFirebaseAdmin = (): void => {
  try {
    // Nếu đã khởi tạo rồi thì bỏ qua
    if (admin.apps.length > 0) {
      console.log("✅ Firebase Admin SDK đã được khởi tạo trước đó.");
      return;
    }

    const firebaseAdmin = process.env.FIREBASE_ADMIN_SDK_JSON;

    if (!firebaseAdmin) {
      console.warn(
        "⚠️ FIREBASE_ADMIN_SDK_JSON chưa được cấu hình. Bỏ qua Firebase Authentication.",
      );
      return;
    }

    let serviceAccount: any;

    // Nếu giá trị là JSON string (production - Render env var)
    if (firebaseAdmin.trim().startsWith("{")) {
      serviceAccount = JSON.parse(firebaseAdmin);
    } else {
      // Ngược lại, coi là đường dẫn file (local dev)
      const serviceAccountPath = path.resolve(process.cwd(), firebaseAdmin);
      serviceAccount = require(serviceAccountPath);
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
    });

    console.log("✅ Firebase Admin SDK đã khởi tạo thành công.");
  } catch (error: any) {
    console.warn("⚠️ Không thể khởi tạo Firebase Admin:", error.message);
    console.warn("   Chức năng Firebase Authentication sẽ không khả dụng.");
  }
};

/**
 * Get Firebase Storage bucket instance
 * Phải gọi sau khi initializeFirebaseAdmin() đã chạy
 */
export const getBucket = () => {
  if (admin.apps.length === 0) {
    throw new Error(
      "Firebase Admin SDK chưa được khởi tạo. Vui lòng gọi initializeFirebaseAdmin() trước.",
    );
  }
  return admin.storage().bucket();
};

export default admin;
