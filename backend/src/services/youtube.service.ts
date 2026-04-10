import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";

/**
 * YouTubeService - Quản lý upload video lên YouTube
 * Sử dụng cơ chế Resumable Upload phù hợp cho các file cực lớn (> 1 tiếng)
 */
class YouTubeService {
  private youtube;
  
  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    this.youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });
  }

  /**
   * Upload video lên YouTube dưới dạng Unlisted
   * @param title Tiêu đề video
   * @param description Mô tả
   * @param filePath Đường dẫn file trên local server
   */
  async uploadVideo(title: string, description: string, filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error("File video không tồn tại trên server để upload.");
    }

    try {
      const fileSize = fs.statSync(filePath).size;

      const res = await this.youtube.videos.insert(
        {
          part: ["snippet", "status"],
          requestBody: {
            snippet: {
              title: title || "Bài học mới",
              description: description || "Video bài học từ Hutech Edu",
              categoryId: "27", // Education
            },
            status: {
              privacyStatus: "unlisted", // Unlisted allow embedding but hidden from search
              selfDeclaredMadeForKids: false,
            },
          },
          media: {
            body: fs.createReadStream(filePath),
          },
        },
        {
          // Cơ chế băm nhỏ (chunking) được hỗ trợ mặc định bởi googleapis
          onUploadProgress: (evt) => {
            const progress = (evt.bytesRead / fileSize) * 100;
            process.stdout.write(`\r🚀 YouTube Uploading: ${Math.round(progress)}% complete`);
          },
        }
      );

      console.log(`\n✅ Upload thành công! Link: https://www.youtube.com/watch?v=${res.data.id}`);

      return {
        videoId: res.data.id,
        url: `https://www.youtube.com/watch?v=${res.data.id}`,
        data: res.data
      };
    } catch (error: any) {
      console.error("❌ YouTube API Error Detail:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    } finally {
      // Đảm bảo xóa file tạm dù upload thành công hay thất bại để tránh đầy ổ cứng
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Xóa video khỏi YouTube
   * @param videoId ID của video cần xóa
   */
  async deleteVideo(videoId: string) {
    try {
      await this.youtube.videos.delete({
        id: videoId,
      });
      console.log(`✅ Đã xóa video bài học trên YouTube: ${videoId}`);
      return true;
    } catch (error: any) {
      console.error("❌ Lỗi khi xóa video YouTube:", error.message);
      return false;
    }
  }
}

export default new YouTubeService();
