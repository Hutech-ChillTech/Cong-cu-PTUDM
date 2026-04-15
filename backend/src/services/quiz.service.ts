import { Prisma } from "@prisma/client";
import ChapterQuizRepository from "../repositories/chapterQuiz.repository";
import QuizQuestionRepository from "../repositories/quizQuestion.repository";
import QuizOptionRepository from "../repositories/quizOption.repository";

class QuizService {
  private readonly chapterQuizRepository: ChapterQuizRepository;
  private readonly quizQuestionRepository: QuizQuestionRepository;
  private readonly quizOptionRepository: QuizOptionRepository;

  constructor(
    chapterQuizRepository: ChapterQuizRepository,
    quizQuestionRepository: QuizQuestionRepository,
    quizOptionRepository: QuizOptionRepository
  ) {
    this.chapterQuizRepository = chapterQuizRepository;
    this.quizQuestionRepository = quizQuestionRepository;
    this.quizOptionRepository = quizOptionRepository;
  }

  async getAllQuizzes() {
    try {
      return await this.chapterQuizRepository.getAll();
    } catch (error) {
      throw error;
    }
  }

  async getQuizById(id: string) {
    try {
      return await this.chapterQuizRepository.findByIdWithDetails(id);
    } catch (error) {
      throw error;
    }
  }

  async getQuizzesByChapter(chapterId: string) {
    try {
      return await this.chapterQuizRepository.findByChapterId(chapterId);
    } catch (error) {
      throw error;
    }
  }

  async createQuiz(data: Prisma.ChapterQuizCreateInput) {
    try {
      return await this.chapterQuizRepository.create(data);
    } catch (error) {
      throw error;
    }
  }

  async updateQuiz(id: string, data: Prisma.ChapterQuizUpdateInput) {
    try {
      return await this.chapterQuizRepository.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteQuiz(id: string) {
    try {
      return await this.chapterQuizRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async getQuestionsByQuiz(chapterQuizId: string) {
    try {
      return await this.quizQuestionRepository.findByQuizId(chapterQuizId);
    } catch (error) {
      throw error;
    }
  }

  async getQuestionById(id: string) {
    try {
      return await this.quizQuestionRepository.findByIdWithOptions(id);
    } catch (error) {
      throw error;
    }
  }

  async createQuestion(data: Prisma.QuizQuestionCreateInput) {
    try {
      return await this.quizQuestionRepository.create(data);
    } catch (error) {
      throw error;
    }
  }

  async updateQuestion(id: string, data: Prisma.QuizQuestionUpdateInput) {
    try {
      return await this.quizQuestionRepository.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteQuestion(id: string) {
    try {
      return await this.quizQuestionRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async getOptionsByQuestion(quizQuestionId: string) {
    try {
      return await this.quizOptionRepository.findByQuestionId(quizQuestionId);
    } catch (error) {
      throw error;
    }
  }

  async getOptionById(id: string) {
    try {
      return await this.quizOptionRepository.getById(id);
    } catch (error) {
      throw error;
    }
  }

  async createOption(data: Prisma.QuizOptionCreateInput) {
    try {
      return await this.quizOptionRepository.create(data);
    } catch (error) {
      throw error;
    }
  }

  async updateOption(id: string, data: Prisma.QuizOptionUpdateInput) {
    try {
      return await this.quizOptionRepository.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteOption(id: string) {
    try {
      return await this.quizOptionRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}

export default QuizService;
