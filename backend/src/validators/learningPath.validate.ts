import Joi from "joi";

/**
 * Validation cho tạo Learning Path
 */
export const createLearningPathSchema = Joi.object({
  title: Joi.string().required().min(3).max(200).messages({
    "string.empty": "Tiêu đề không được để trống",
    "string.min": "Tiêu đề phải có ít nhất 3 ký tự",
    "string.max": "Tiêu đề không được vượt quá 200 ký tự",
    "any.required": "Tiêu đề là bắt buộc",
  }),

  description: Joi.string().max(2000).optional().allow("").messages({
    "string.max": "Mô tả không được vượt quá 2000 ký tự",
  }),

  level: Joi.string()
    .valid("Basic", "Intermediate", "Advanced")
    .required()
    .messages({
      "any.only": "Level phải là Basic, Intermediate hoặc Advanced",
      "any.required": "Level là bắt buộc",
    }),

  estimatedHours: Joi.number().integer().positive().optional().messages({
    "number.base": "Thời gian ước tính phải là số",
    "number.integer": "Thời gian ước tính phải là số nguyên",
    "number.positive": "Thời gian ước tính phải là số dương",
  }),

  isPublished: Joi.boolean().optional().messages({
    "boolean.base": "isPublished phải là boolean",
  }),
});

/**
 * Validation cho cập nhật Learning Path
 */
export const updateLearningPathSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional().messages({
    "string.min": "Tiêu đề phải có ít nhất 3 ký tự",
    "string.max": "Tiêu đề không được vượt quá 200 ký tự",
  }),

  description: Joi.string().max(2000).optional().allow("").messages({
    "string.max": "Mô tả không được vượt quá 2000 ký tự",
  }),

  level: Joi.string()
    .valid("Basic", "Intermediate", "Advanced")
    .optional()
    .messages({
      "any.only": "Level phải là Basic, Intermediate hoặc Advanced",
    }),

  estimatedHours: Joi.number().integer().positive().optional().messages({
    "number.base": "Thời gian ước tính phải là số",
    "number.integer": "Thời gian ước tính phải là số nguyên",
    "number.positive": "Thời gian ước tính phải là số dương",
  }),

  isPublished: Joi.boolean().optional().messages({
    "boolean.base": "isPublished phải là boolean",
  }),
});

/**
 * Validation cho thêm khóa học vào Learning Path
 */
export const addCourseToPathSchema = Joi.object({
  courseId: Joi.string().required().messages({
    "string.empty": "Course ID không được để trống",
    "any.required": "Course ID là bắt buộc",
  }),

  orderIndex: Joi.number().integer().positive().optional().messages({
    "number.base": "Thứ tự phải là số",
    "number.integer": "Thứ tự phải là số nguyên",
    "number.positive": "Thứ tự phải là số dương",
  }),

  isRequired: Joi.boolean().optional().messages({
    "boolean.base": "isRequired phải là boolean",
  }),
});

/**
 * Validation cho sắp xếp lại thứ tự khóa học
 */
export const reorderCoursesSchema = Joi.object({
  courseOrders: Joi.array()
    .items(
      Joi.object({
        courseId: Joi.string().required().messages({
          "string.empty": "Course ID không được để trống",
          "any.required": "Course ID là bắt buộc",
        }),
        orderIndex: Joi.number().integer().positive().required().messages({
          "number.base": "Thứ tự phải là số",
          "number.integer": "Thứ tự phải là số nguyên",
          "number.positive": "Thứ tự phải là số dương",
          "any.required": "Thứ tự là bắt buộc",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Phải có ít nhất 1 khóa học để sắp xếp",
      "any.required": "Danh sách khóa học là bắt buộc",
    }),
});

/**
 * Validation cho cập nhật progress
 */
export const updateProgressSchema = Joi.object({
  completedCourseIds: Joi.array().items(Joi.string()).required().messages({
    "array.base": "Danh sách khóa học phải là một mảng",
    "any.required": "Danh sách khóa học đã hoàn thành là bắt buộc",
  }),
});
