import Joi from "joi";

/**
 * Schema validation cho create comment
 */
export const createCommentSchema = Joi.object({
  courseId: Joi.string().uuid().required().messages({
    "string.empty": "ID khóa học không được để trống",
    "string.uuid": "ID khóa học không hợp lệ",
    "any.required": "ID khóa học là bắt buộc",
  }),

  content: Joi.string().trim().min(1).max(2000).required().messages({
    "string.empty": "Nội dung comment không được để trống",
    "string.min": "Nội dung comment phải có ít nhất 1 ký tự",
    "string.max": "Nội dung comment không được vượt quá 2000 ký tự",
    "any.required": "Nội dung comment là bắt buộc",
  }),

  rating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.base": "Rating phải là số",
    "number.integer": "Rating phải là số nguyên",
    "number.min": "Rating phải từ 1 đến 5 sao",
    "number.max": "Rating phải từ 1 đến 5 sao",
  }),
});

/**
 * Schema validation cho update comment
 */
export const updateCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).optional().messages({
    "string.empty": "Nội dung comment không được để trống",
    "string.min": "Nội dung comment phải có ít nhất 1 ký tự",
    "string.max": "Nội dung comment không được vượt quá 2000 ký tự",
  }),

  rating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.base": "Rating phải là số",
    "number.integer": "Rating phải là số nguyên",
    "number.min": "Rating phải từ 1 đến 5 sao",
    "number.max": "Rating phải từ 1 đến 5 sao",
  }),
})
  .min(1)
  .messages({
    "object.min": "Phải có ít nhất một trường để cập nhật",
  });

/**
 * Schema validation cho create reply
 */
export const createReplySchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required().messages({
    "string.empty": "Nội dung reply không được để trống",
    "string.min": "Nội dung reply phải có ít nhất 1 ký tự",
    "string.max": "Nội dung reply không được vượt quá 2000 ký tự",
    "any.required": "Nội dung reply là bắt buộc",
  }),
});
