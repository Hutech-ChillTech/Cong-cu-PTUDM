import { Prisma } from "@prisma/client";
import ChapterRepository from "../repositories/chapter.repository";

class ChapterService {
  private readonly chapterRepository: ChapterRepository;
  constructor(chapterRepository: ChapterRepository) {
    this.chapterRepository = chapterRepository;
  }

  async getAllChapter() {
    try {
      return await this.chapterRepository.getAll();
    } catch (error) {
      throw error;
    }
  }

  async getChapterById(id: string) {
    try {
      return await this.chapterRepository.getById(id);
    } catch (error) {
      throw error;
    }
  }

  async createChapter(data: {
    chapterName: string;
    totalLesson: number;
    courseId: string;
  }) {
    try {
      const createData: Prisma.ChapterCreateInput = {
        chapterName: data.chapterName,
        totalLesson: data.totalLesson,
        course: {
          connect: { courseId: data.courseId },
        },
      };
      return this.chapterRepository.create(createData);
    } catch (error) {
      throw error;
    }
  }

  async updateChapter(id: string, data: Prisma.ChapterUpdateInput) {
    try {
      return this.chapterRepository.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteChapter(id: string) {
    try {
      return this.chapterRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}

export default ChapterService;
