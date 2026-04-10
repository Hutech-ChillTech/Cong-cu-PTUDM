import Joi from "joi";

export const createLessonSchema = Joi.object({
  lessonName: Joi.string().trim().min(3).max(255).required().messages({
    "string.empty": "Tên bài học không được để trống.",
    "string.min": "Tên bài học phải có ít nhất 3 ký tự.",
    "string.max": "Tên bài học không được vượt quá 255 ký tự.",
    "any.required": "Tên bài học là bắt buộc.",
  }),

  videoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "URL video phải là một URL hợp lệ.",
  }),

  content: Joi.string().allow(null, "").max(5000).messages({
    "string.max": "Nội dung không được vượt quá 5000 ký tự.",
  }),

  isPreview: Joi.boolean().default(false).messages({
    "boolean.base": "isPreview phải là giá trị boolean.",
  }),

  chapterId: Joi.string().uuid().required().messages({
    "string.empty": "ID chương không được để trống.",
    "string.uuid": "ID chương phải là UUID hợp lệ.",
    "any.required": "ID chương là bắt buộc.",
  }),

  // Extra fields from frontend (not in Prisma schema, will be stripped)
  publicId: Joi.string().optional().allow(null, "").messages({
    "string.base": "Public ID phải là chuỗi.",
  }),

  lessonType: Joi.string().optional().allow(null, "").messages({
    "string.base": "Lesson type phải là chuỗi.",
  }),
}).options({ stripUnknown: true });

export const updateLessonSchema = Joi.object({
  lessonName: Joi.string().trim().min(3).max(255).messages({
    "string.min": "Tên bài học phải có ít nhất 3 ký tự.",
    "string.max": "Tên bài học không được vượt quá 255 ký tự.",
  }),

  videoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "URL video phải là một URL hợp lệ.",
  }),

  content: Joi.string().allow(null, "").max(5000).messages({
    "string.max": "Nội dung không được vượt quá 5000 ký tự.",
  }),

  isPreview: Joi.boolean().messages({
    "boolean.base": "isPreview phải là giá trị boolean.",
  }),
});
