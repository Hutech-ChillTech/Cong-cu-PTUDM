import Joi from "joi";

export const createEnrollmentSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    "string.empty": "ID user không được để trống.",
    "string.uuid": "ID user phải là UUID hợp lệ.",
    "any.required": "ID user là bắt buộc.",
  }),

  courseId: Joi.string().uuid().required().messages({
    "string.empty": "ID khóa học không được để trống.",
    "string.uuid": "ID khóa học phải là UUID hợp lệ.",
    "any.required": "ID khóa học là bắt buộc.",
  }),
});

export const enrollMyCourseSchema = Joi.object({
  courseId: Joi.string().uuid().required().messages({
    "string.empty": "ID khóa học không được để trống.",
    "string.uuid": "ID khóa học phải là UUID hợp lệ.",
    "any.required": "ID khóa học là bắt buộc.",
  }),
});
