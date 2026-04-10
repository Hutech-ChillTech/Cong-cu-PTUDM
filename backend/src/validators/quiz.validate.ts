import Joi from "joi";

export const createQuizSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required().messages({
    "string.empty": "Tiêu đề quiz không được để trống.",
    "string.min": "Tiêu đề quiz phải có ít nhất 3 ký tự.",
    "string.max": "Tiêu đề quiz không được vượt quá 255 ký tự.",
    "any.required": "Tiêu đề quiz là bắt buộc.",
  }),

  description: Joi.string().allow(null, "").max(1000).messages({
    "string.max": "Mô tả không được vượt quá 1000 ký tự.",
  }),

  chapterId: Joi.string().uuid().required().messages({
    "string.empty": "ID chương không được để trống.",
    "string.uuid": "ID chương phải là UUID hợp lệ.",
    "any.required": "ID chương là bắt buộc.",
  }),
});

export const updateQuizSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).messages({
    "string.min": "Tiêu đề quiz phải có ít nhất 3 ký tự.",
    "string.max": "Tiêu đề quiz không được vượt quá 255 ký tự.",
  }),

  description: Joi.string().allow(null, "").max(1000).messages({
    "string.max": "Mô tả không được vượt quá 1000 ký tự.",
  }),
});

export const createQuestionSchema = Joi.object({
  questionText: Joi.string().trim().min(5).max(1000).required().messages({
    "string.empty": "Nội dung câu hỏi không được để trống.",
    "string.min": "Nội dung câu hỏi phải có ít nhất 5 ký tự.",
    "string.max": "Nội dung câu hỏi không được vượt quá 1000 ký tự.",
    "any.required": "Nội dung câu hỏi là bắt buộc.",
  }),

  questionType: Joi.string()
    .valid("multiple_choice", "true_false", "short_answer", "essay")
    .required()
    .messages({
      "string.empty": "Loại câu hỏi không được để trống.",
      "any.only":
        "Loại câu hỏi phải là: multiple_choice, true_false, short_answer, hoặc essay.",
      "any.required": "Loại câu hỏi là bắt buộc.",
    }),

  chapterQuizId: Joi.string().uuid().required().messages({
    "string.empty": "ID quiz không được để trống.",
    "string.uuid": "ID quiz phải là UUID hợp lệ.",
    "any.required": "ID quiz là bắt buộc.",
  }),
});

export const updateQuestionSchema = Joi.object({
  questionText: Joi.string().trim().min(5).max(1000).messages({
    "string.min": "Nội dung câu hỏi phải có ít nhất 5 ký tự.",
    "string.max": "Nội dung câu hỏi không được vượt quá 1000 ký tự.",
  }),

  questionType: Joi.string()
    .valid("multiple_choice", "true_false", "short_answer", "essay")
    .messages({
      "any.only":
        "Loại câu hỏi phải là: multiple_choice, true_false, short_answer, hoặc essay.",
    }),
});

export const createOptionSchema = Joi.object({
  optionText: Joi.string().trim().min(1).max(500).required().messages({
    "string.empty": "Nội dung đáp án không được để trống.",
    "string.min": "Nội dung đáp án phải có ít nhất 1 ký tự.",
    "string.max": "Nội dung đáp án không được vượt quá 500 ký tự.",
    "any.required": "Nội dung đáp án là bắt buộc.",
  }),

  isCorrect: Joi.boolean().required().messages({
    "boolean.base": "isCorrect phải là giá trị boolean.",
    "any.required": "isCorrect là bắt buộc.",
  }),

  quizQuestionId: Joi.string().uuid().required().messages({
    "string.empty": "ID câu hỏi không được để trống.",
    "string.uuid": "ID câu hỏi phải là UUID hợp lệ.",
    "any.required": "ID câu hỏi là bắt buộc.",
  }),
});

export const updateOptionSchema = Joi.object({
  optionText: Joi.string().trim().min(1).max(500).messages({
    "string.min": "Nội dung đáp án phải có ít nhất 1 ký tự.",
    "string.max": "Nội dung đáp án không được vượt quá 500 ký tự.",
  }),

  isCorrect: Joi.boolean().messages({
    "boolean.base": "isCorrect phải là giá trị boolean.",
  }),
});
