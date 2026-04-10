import { Request, Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";
import QuizService from "../services/quiz.service";
import { sendEmpty, sendNotFound, sendSuccess } from "../utils/responseHelper";

class QuizController {
  private readonly quizService: QuizService;

  constructor(quizService: QuizService) {
    this.quizService = quizService;
  }

  async getAllQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const quizzes = await this.quizService.getAllQuizzes();

      if (!quizzes || quizzes.length === 0) {
        sendEmpty(res, "Dữ liệu quiz đang rỗng");
        return;
      }
      return sendSuccess(res, quizzes, "Lấy tất cả quiz thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getQuizById(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterQuizId } = req.params;
      if (!isUUID(chapterQuizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      const quiz = await this.quizService.getQuizById(chapterQuizId);
      if (!quiz) {
        sendNotFound(res, "Không tìm thấy quiz cần tìm");
        return;
      }
      return sendSuccess(res, quiz, "Lấy dữ liệu quiz thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getQuizzesByChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterId } = req.params;

      // If not UUID, return empty instead of error (for public read endpoint)
      if (!isUUID(chapterId)) {
        return sendEmpty(res, "Chương này chưa có quiz nào");
      }

      const quizzes = await this.quizService.getQuizzesByChapter(chapterId);

      if (!quizzes || quizzes.length === 0) {
        sendEmpty(res, "Chương này chưa có quiz nào");
        return;
      }
      return sendSuccess(
        res,
        quizzes,
        "Lấy danh sách quiz của chương thành công."
      );
    } catch (error) {
      return next(error);
    }
  }

  async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const quiz = await this.quizService.createQuiz(data);
      return sendSuccess(res, quiz, "Thêm mới quiz thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async updateQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterQuizId } = req.params;
      if (!isUUID(chapterQuizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      const data = req.body;

      const quiz = await this.quizService.updateQuiz(chapterQuizId, data);

      if (!quiz) {
        sendNotFound(res, "Không tìm thấy quiz cần cập nhật");
        return;
      }
      return sendSuccess(res, quiz, "Cập nhật dữ liệu quiz thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async deleteQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterQuizId } = req.params;

      if (!isUUID(chapterQuizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      const quiz = await this.quizService.deleteQuiz(chapterQuizId);

      if (!quiz) {
        sendNotFound(res, "Không tìm thấy quiz cần xóa");
        return;
      }
      return sendSuccess(res, quiz, "Xóa thành công quiz.");
    } catch (error) {
      return next(error);
    }
  }

  async getQuestionsByQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterQuizId } = req.params;
      if (!isUUID(chapterQuizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      const questions = await this.quizService.getQuestionsByQuiz(
        chapterQuizId
      );

      if (!questions || questions.length === 0) {
        sendEmpty(res, "Quiz này chưa có câu hỏi nào");
        return;
      }
      return sendSuccess(res, questions, "Lấy danh sách câu hỏi thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getQuestionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizQuestionId } = req.params;
      if (!isUUID(quizQuestionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const question = await this.quizService.getQuestionById(quizQuestionId);
      if (!question) {
        sendNotFound(res, "Không tìm thấy câu hỏi cần tìm");
        return;
      }
      return sendSuccess(res, question, "Lấy dữ liệu câu hỏi thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async createQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const question = await this.quizService.createQuestion(data);
      return sendSuccess(res, question, "Thêm mới câu hỏi thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async updateQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizQuestionId } = req.params;
      if (!isUUID(quizQuestionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      const data = req.body;

      const question = await this.quizService.updateQuestion(
        quizQuestionId,
        data
      );

      if (!question) {
        sendNotFound(res, "Không tìm thấy câu hỏi cần cập nhật");
        return;
      }
      return sendSuccess(res, question, "Cập nhật câu hỏi thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizQuestionId } = req.params;

      if (!isUUID(quizQuestionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const question = await this.quizService.deleteQuestion(quizQuestionId);

      if (!question) {
        sendNotFound(res, "Không tìm thấy câu hỏi cần xóa");
        return;
      }
      return sendSuccess(res, question, "Xóa thành công câu hỏi.");
    } catch (error) {
      return next(error);
    }
  }

  async getOptionsByQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizQuestionId } = req.params;
      if (!isUUID(quizQuestionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const options = await this.quizService.getOptionsByQuestion(
        quizQuestionId
      );

      if (!options || options.length === 0) {
        sendEmpty(res, "Câu hỏi này chưa có đáp án nào");
        return;
      }
      return sendSuccess(res, options, "Lấy danh sách đáp án thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async getOptionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizOptionId } = req.params;
      if (!isUUID(quizOptionId)) {
        return res.status(400).json({ message: "Invalid option ID" });
      }

      const option = await this.quizService.getOptionById(quizOptionId);
      if (!option) {
        sendNotFound(res, "Không tìm thấy đáp án cần tìm");
        return;
      }
      return sendSuccess(res, option, "Lấy dữ liệu đáp án thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async createOption(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const option = await this.quizService.createOption(data);
      return sendSuccess(res, option, "Thêm mới đáp án thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async updateOption(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizOptionId } = req.params;
      if (!isUUID(quizOptionId)) {
        return res.status(400).json({ message: "Invalid option ID" });
      }
      const data = req.body;

      const option = await this.quizService.updateOption(quizOptionId, data);

      if (!option) {
        sendNotFound(res, "Không tìm thấy đáp án cần cập nhật");
        return;
      }
      return sendSuccess(res, option, "Cập nhật đáp án thành công.");
    } catch (error) {
      return next(error);
    }
  }

  async deleteOption(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizOptionId } = req.params;

      if (!isUUID(quizOptionId)) {
        return res.status(400).json({ message: "Invalid option ID" });
      }

      const option = await this.quizService.deleteOption(quizOptionId);

      if (!option) {
        sendNotFound(res, "Không tìm thấy đáp án cần xóa");
        return;
      }
      return sendSuccess(res, option, "Xóa thành công đáp án.");
    } catch (error) {
      return next(error);
    }
  }
}

export default QuizController;
