import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { LearningSessionService } from "../services/learningSession.service";
import { sendSuccess, sendError } from "../utils/responseHelper";

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

const prisma = new PrismaClient();
const learningSessionService = new LearningSessionService(prisma);

/**
 * @route POST /api/learning-sessions/start
 * @desc Bắt đầu hoặc resume session học
 */
export const startSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { courseId, lessonId } = req.body;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    if (!courseId || !lessonId) {
      return sendError(res, "courseId và lessonId là bắt buộc", 400);
    }

    const result = await learningSessionService.startOrResumeSession(
      userId,
      courseId,
      lessonId
    );

    return sendSuccess(
      res,
      result.session,
      result.message,
      result.isNew ? 201 : 200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/learning-sessions/:sessionId/pause
 * @desc Tạm dừng session
 */
export const pauseSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await learningSessionService.pauseSession(sessionId, userId);

    return sendSuccess(res, result.session, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/learning-sessions/:sessionId/resume
 * @desc Tiếp tục session
 */
export const resumeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await learningSessionService.resumeSession(
      sessionId,
      userId
    );

    return sendSuccess(res, result.session, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/learning-sessions/:sessionId/end
 * @desc Kết thúc session
 */
export const endSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await learningSessionService.endSession(sessionId, userId);

    return sendSuccess(
      res,
      {
        session: result.session,
        statistics: result.statistics,
      },
      result.message
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/learning-sessions/:sessionId/activity
 * @desc Ghi nhận hoạt động trong session
 */
export const recordActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { sessionId } = req.params;
    const { activityType, metadata } = req.body;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    if (!activityType) {
      return sendError(res, "activityType là bắt buộc", 400);
    }

    const result = await learningSessionService.recordActivity(
      sessionId,
      userId,
      activityType,
      metadata
    );

    return sendSuccess(res, result.activity, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/learning-sessions/active
 * @desc Lấy session đang học hiện tại
 */
export const getActiveSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { lessonId } = req.query;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    if (!lessonId || typeof lessonId !== "string") {
      return sendError(res, "lessonId là bắt buộc", 400);
    }

    const result = await learningSessionService.getActiveSession(
      userId,
      lessonId
    );

    return sendSuccess(res, result.session, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/learning-sessions/history
 * @desc Lấy lịch sử session
 */
export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { courseId, lessonId, limit, offset } = req.query;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await learningSessionService.getSessionHistory(userId, {
      courseId: courseId as string,
      lessonId: lessonId as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return sendSuccess(
      res,
      {
        sessions: result.sessions,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      },
      result.message
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/learning-sessions/stats/:courseId
 * @desc Lấy thống kê thời gian học
 */
export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { courseId } = req.params;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await learningSessionService.getSessionStats(
      userId,
      courseId
    );

    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/learning-sessions/course/:courseId
 * @desc Lấy tất cả session của một khóa học
 */
export const getCourseSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { courseId } = req.params;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await learningSessionService.getSessionHistory(userId, {
      courseId,
    });

    return sendSuccess(res, result.sessions, result.message);
  } catch (error) {
    next(error);
  }
};
