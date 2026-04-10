import Joi from "joi";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createTestCaseSchema = Joi.object({
  lessonId: Joi.string().pattern(uuidPattern).required().messages({
    "string.pattern.base": "lessonId không hợp lệ",
    "any.required": "lessonId là bắt buộc",
  }),

  description: Joi.string().required().max(5000).messages({
    "string.empty": "Mô tả không được để trống",
    "any.required": "Mô tả là bắt buộc",
  }),

  input: Joi.string().optional().allow(null, "").max(5000),
  expectedOutput: Joi.string().optional().allow(null, "").max(5000),

  testCodes: Joi.string().optional().allow(null, ""),
})
  .custom((value, helpers) => {
    const hasTestCodes = value.testCodes && value.testCodes.trim() !== "";

    return value;
  })
  .unknown(true);

export const updateTestCaseSchema = Joi.object({
  testCaseId: Joi.string().pattern(uuidPattern).required(),
  description: Joi.string().max(5000).optional().allow(null, ""),
  input: Joi.string().max(5000).optional().allow(null, ""),
  expectedOutput: Joi.string().max(5000).optional().allow(null, ""),
  testCodes: Joi.string().optional().allow(null, ""),
}).unknown(true);
