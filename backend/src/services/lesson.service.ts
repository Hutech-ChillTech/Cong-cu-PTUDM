import { Prisma } from "@prisma/client";
import LessonRepository from "../repositories/lesson.repository";

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
      return this.lessonRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}

export default LessonService;
