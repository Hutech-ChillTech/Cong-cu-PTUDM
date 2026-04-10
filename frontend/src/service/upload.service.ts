import axios from "axios";
import { message } from "antd";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const uploadService = {
  /**
   * Lấy signature từ backend để upload lên Cloudinary
   * Backend API: POST /api/uploads/signature
   * @param folder - Folder path trong Cloudinary (default: "videos")
   * @returns {signature, timestamp, cloudName, apiKey, folder}
   */
  getSignature: async (folder: string = "videos") => {
    try {
      const res = await fetch(`${API_URL}/uploads/signature`, {
        method: "POST", // ✅ Backend dùng POST, không phải GET
        headers: getAuthHeaders(),
        body: JSON.stringify({ folder }), // ✅ Gửi folder trong body
      });

      if (!res.ok) {
        if (res.status === 404) {
          message.error(
            "❌ API upload chưa được cấu hình trên backend. Vui lòng liên hệ admin!"
          );
          throw new Error(
            "API endpoint /api/uploads/signature không tồn tại (404)"
          );
        }
        if (res.status === 401) {
          message.error("❌ Vui lòng đăng nhập để upload video!");
          throw new Error("Unauthorized - Token không hợp lệ");
        }
        throw new Error(`Không lấy được chữ ký upload (HTTP ${res.status})`);
      }

      const data = await res.json();
      return data.data; // ✅ Backend trả về data.data
    } catch (error) {
      console.error("❌ Lỗi lấy signature:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (
        !errorMessage.includes("404") &&
        !errorMessage.includes("Unauthorized")
      ) {
        message.error("Lỗi kết nối đến server. Vui lòng kiểm tra kết nối!");
      }
      throw error;
    }
  },
  /**
   * Upload video trực tiếp lên Cloudinary với chunked upload
   * @param file - File video cần upload
   * @param folder - Folder path trong Cloudinary (default: "lesson-videos")
   * @param onProgress - Callback để track progress (0-100)
   * @returns {url, publicId, duration, format, bytes}
   */
  uploadVideo: async (
    file: File,
    folder: string = "lesson-videos",
    onProgress?: (percent: number) => void
  ) => {
    try {
      message.loading("Đang chuẩn bị upload video...", 0);

      // ✅ Lấy signature với folder parameter
      const {
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder: uploadFolder,
      } = await uploadService.getSignature(folder);

      const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks
      const totalSize = file.size;
      const uniqueUploadId = `upload_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      let start = 0;
      let end = Math.min(CHUNK_SIZE, totalSize);
      let result = null;

      while (start < totalSize) {
        const chunk = file.slice(start, end);
        const formData = new FormData();

        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", uploadFolder || folder); // ✅ Dùng folder từ signature
        formData.append("file", chunk);

        const contentRange = `bytes ${start}-${end - 1}/${totalSize}`;

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
          formData,
          {
            headers: {
              "X-Unique-Upload-Id": uniqueUploadId,
              "Content-Range": contentRange,
            },
          }
        );

        result = res.data;

        if (onProgress) {
          const percent = Math.round((end / totalSize) * 100);
          onProgress(percent);
        }

        start = end;
        end = Math.min(start + CHUNK_SIZE, totalSize);
      }

      message.destroy();
      message.success("✅ Upload video thành công!");

      // ✅ Return structured data theo backend docs
      return {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      message.destroy();
      message.error("❌ Upload video thất bại. Vui lòng thử lại!");
      console.error("❌ Lỗi upload video:", error);
      throw error;
    }
  },

  /**
   * Upload image trực tiếp lên Cloudinary
   * @param file - File image cần upload
   * @param folder - Folder path trong Cloudinary (default: "images")
   * @param onProgress - Callback để track progress (0-100)
   * @returns {url, publicId, width, height, format, bytes}
   */
  uploadImage: async (
    file: File,
    folder: string = "images",
    onProgress?: (percent: number) => void
  ) => {
    try {
      message.loading("Đang upload hình ảnh...", 0);

      const {
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder: uploadFolder,
      } = await uploadService.getSignature(folder);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", uploadFolder || folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const response = await axios.post(cloudinaryUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.(percentCompleted);
          }
        },
      });

      message.destroy();
      message.success("✅ Upload hình ảnh thành công!");

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        bytes: response.data.bytes,
      };
    } catch (error) {
      message.destroy();
      message.error("❌ Upload hình ảnh thất bại!");
      console.error("❌ Lỗi upload image:", error);
      throw error;
    }
  },
};
