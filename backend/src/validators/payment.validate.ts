import Joi from "joi";

export const createPaymentSchema = Joi.object({
  courseId: Joi.string().uuid().required().messages({
    "string.empty": "courseId không được để trống",
    "string.guid": "courseId phải là UUID hợp lệ",
    "any.required": "courseId là bắt buộc",
  }),
  paymentMethod: Joi.string()
    .valid("MOMO", "VNPAY", "momo", "vnpay")
    .required()
    .messages({
      "string.empty": "paymentMethod không được để trống",
      "any.only": "paymentMethod phải là MOMO hoặc VNPAY",
      "any.required": "paymentMethod là bắt buộc",
    }),
  bankCode: Joi.string().optional().messages({
    "string.empty": "bankCode không hợp lệ",
  }),
});
