import { Request, Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";
import ChapterService from "../services/chapter.service";
import { sendEmpty, sendNotFound, sendSuccess } from "../utils/responseHelper";

class ChapterController {
    private readonly chapterService: ChapterService;
    constructor(chapterService: ChapterService) {
        this.chapterService = chapterService;
    }

    async getAllChapter(req: Request, res: Response, next: NextFunction) {
        try {
            const chapters = await this.chapterService.getAllChapter();

            if (!chapters) {
                sendEmpty(res, 'Dữ liệu chapter đang rỗng');
                return;
            }
            return sendSuccess(res, chapters, 'Lấy tất cả chapter thành công.');
        } catch (error) {
            return next(error);
        }
    }

    async getChapterById(req: Request, res: Response, next: NextFunction) {
        try {
            const { chapterId } = req.params;
            if (!isUUID(chapterId)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }
            const chapter = await this.chapterService.getChapterById(chapterId);
            if (!chapter) {
                sendNotFound(res, 'Không tìm thấy chapter cần tìm');
                return;
            }
            return sendSuccess(res, chapter, 'Lấy dữ liệu chapter thành công.');
        } catch (error) {
            return next(error);
        }
    }

    async createChapter(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;

            const chapter = await this.chapterService.createChapter(data);
            return sendSuccess(res, chapter, 'Thêm mới chapter thành công.');
        } catch (error) {
            return next(error);
        }
    }

    async updateChapter(req: Request, res: Response, next: NextFunction) {
        try {
            const { chapterId } = req.params;
            if (!isUUID(chapterId)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }
            const data = req.body;

            const chapter = await this.chapterService.updateChapter(chapterId, data);

            if (!chapter) {
                sendNotFound(res, 'Không tìm thấy chapter cần tìm');
                return;
            }
            return sendSuccess(res, chapter, 'Cập nhật dữ liệu chapter thành công. ');
        } catch (error) {
            return next(error);
        }
    }

    async deleteChapter(req: Request, res: Response, next: NextFunction) {
        try {
            const { chapterId } = req.params;

            if (!isUUID(chapterId)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }


            const chapter = await this.chapterService.deleteChapter(chapterId);

            if (!chapter) {
                sendNotFound(res, 'Không tìm thấy chapter cần tìm');
                return;
            }
            return sendSuccess(res, chapter, 'Xóa thành công chapter.');
        } catch (error) {
            return next(error);
        }
    }
}

export default ChapterController;