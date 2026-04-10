import Joi from "joi";

export const createChapterSchema = Joi.object({
  chapterName: Joi.string().trim().min(3).max(255).required().messages({
    "string.empty": "Tên chương không được để trống.",
    "string.min": "Tên chương phải có ít nhất 3 ký tự.",
    "string.max": "Tên chương không được vượt quá 255 ký tự.",
    "any.required": "Tên chương là bắt buộc.",
  }),

  totalLesson: Joi.number().integer().min(1).required().messages({
    "number.base": "Tổng số bài học phải là số.",
    "number.min": "Tổng số bài học phải lớn hơn hoặc bằng 1.",
    "number.integer": "Tổng số bài học phải là số nguyên.",
    "any.required": "Tổng số bài học là bắt buộc.",
  }),

  courseId: Joi.string().uuid().required().messages({
    "string.empty": "ID khóa học không được để trống.",
    "string.guid": "ID khóa học phải là UUID hợp lệ.",
    "any.required": "ID khóa học là bắt buộc.",
  }),
});

export const updateChapterSchema = Joi.object({
  chapterName: Joi.string().trim().min(3).max(255).messages({
    "string.min": "Tên chương phải có ít nhất 3 ký tự.",
    "string.max": "Tên chương không được vượt quá 255 ký tự.",
  }),
  totalLesson: Joi.number().integer().min(1).messages({
    "number.min": "Tổng số bài học phải lớn hơn hoặc bằng 1.",
    "number.integer": "Tổng số bài học phải là số nguyên.",
  }),
});
