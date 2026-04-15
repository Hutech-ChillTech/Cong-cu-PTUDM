import { Prisma } from "@prisma/client";
import LessonRepository from "../repositories/lesson.repository";
import youtubeService from "./youtube.service";

class LessonService {
  private readonly lessonRepository: LessonRepository;

  constructor(lessonRepository: LessonRepository) {
    this.lessonRepository = lessonRepository;
  }

  async getAllLessons() {
    try {
      return await this.lessonRepository.getAll();
    } catch (error) {
      throw error;
    }
  }

  async getLessonById(id: string) {
    try {
      return await this.lessonRepository.getById(id);
    } catch (error) {
      throw error;
    }
  }

  async createLesson(data: Prisma.LessonCreateInput) {
    try {
      return this.lessonRepository.create(data);
    } catch (error) {
      throw error;
    }
  }

  async updateLesson(id: string, data: Prisma.LessonUpdateInput) {
    try {
      return this.lessonRepository.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteLesson(id: string) {
    try {
      // 1. Get lesson detail to check for videoUrl
      const lesson = await this.lessonRepository.getById(id);
      
      if (lesson && lesson.videoUrl) {
        // 2. Extract videoId from YouTube URL formats (Robust detection)
        let videoId = "";
        const url = lesson.videoUrl.trim();
        
        console.log(`🔍 Checking lesson for video deletion: "${lesson.lessonName}" (URL: ${url})`);
        
        if (url.includes("v=")) {
          videoId = url.split("v=")[1]?.split("&")[0];
        } else if (url.includes("youtu.be/")) {
          videoId = url.split("youtu.be/")[1]?.split("?")[0];
        } else if (url.includes("embed/")) {
          videoId = url.split("embed/")[1]?.split("?")[0];
        } else if (url.length === 11 && !url.includes("/")) {
          videoId = url;
        }

        // 3. Delete from YouTube if ID found
        if (videoId) {
          console.log(`🗑 Detected videoId: ${videoId}. Sending delete request to YouTube...`);
          const isDeletedOnYouTube = await youtubeService.deleteVideo(videoId);
          if (isDeletedOnYouTube) {
             console.log("✅ YouTube confirmed deletion success.");
          } else {
             console.log("⚠️ YouTube deletion failed (video might already be gone or invalid ID).");
          }
        } else {
          console.log("ℹ️ No valid YouTube video ID found in this lesson record.");
        }
      }

      // 4. Delete from Database
      return this.lessonRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}

export default LessonService;
