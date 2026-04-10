import Joi from "joi";

export const createCourseSchema = Joi.object({
  courseName: Joi.string().required().min(3).max(200).messages({
    "string.empty": "Tên khóa học không được để trống",
    "string.min": "Tên khóa học phải có ít nhất 3 ký tự",
    "string.max": "Tên khóa học không được vượt quá 200 ký tự",
    "any.required": "Tên khóa học là bắt buộc",
  }),
  courseDescription: Joi.string().optional().allow("").max(5000).messages({
    "string.max": "Mô tả khóa học không được vượt quá 5000 ký tự",
  }),
  coursePrice: Joi.number().required().min(0).messages({
    "number.base": "Giá khóa học phải là số",
    "number.min": "Giá khóa học không được âm",
    "any.required": "Giá khóa học là bắt buộc",
  }),
  discount: Joi.number().optional().min(0).max(1).messages({
    "number.base": "Giảm giá phải là số",
    "number.min": "Giảm giá không được âm",
    "number.max": "Giảm giá không được vượt quá 1 (100%)",
  }),
  avatarURL: Joi.string().optional().uri().messages({
    "string.uri": "Avatar URL phải là một URL hợp lệ",
  }),
  level: Joi.string()
    .optional()
    .valid("Basic", "Intermediate", "Advanced")
    .messages({
      "any.only": "Level phải là Basic, Intermediate hoặc Advanced",
    }),
  subLevel: Joi.string().optional().valid("Low", "Mid", "High").messages({
    "any.only": "SubLevel phải là Low, Mid hoặc High",
  }),
  estimatedDuration: Joi.number().optional().min(1).messages({
    "number.base": "Thời gian ước lượng phải là số",
    "number.min": "Thời gian ước lượng phải lớn hơn 0",
  }),
  createdBy: Joi.string().optional().uuid().messages({
    "string.guid": "CreatedBy phải là UUID hợp lệ",
  }),
});

export const updateCourseSchema = Joi.object({
  courseName: Joi.string().optional().min(3).max(200).messages({
    "string.min": "Tên khóa học phải có ít nhất 3 ký tự",
    "string.max": "Tên khóa học không được vượt quá 200 ký tự",
  }),
  courseDescription: Joi.string().optional().allow("").max(5000).messages({
    "string.max": "Mô tả khóa học không được vượt quá 5000 ký tự",
  }),
  coursePrice: Joi.number().optional().min(0).messages({
    "number.base": "Giá khóa học phải là số",
    "number.min": "Giá khóa học không được âm",
  }),
  discount: Joi.number().optional().min(0).max(1).messages({
    "number.base": "Giảm giá phải là số",
    "number.min": "Giảm giá không được âm",
    "number.max": "Giảm giá không được vượt quá 1 (100%)",
  }),
  avatarURL: Joi.string().optional().uri().messages({
    "string.uri": "Avatar URL phải là một URL hợp lệ",
  }),
  level: Joi.string()
    .optional()
    .valid("Basic", "Intermediate", "Advanced")
    .messages({
      "any.only": "Level phải là Basic, Intermediate hoặc Advanced",
    }),
  subLevel: Joi.string().optional().valid("Low", "Mid", "High").messages({
    "any.only": "SubLevel phải là Low, Mid hoặc High",
  }),
  estimatedDuration: Joi.number().optional().min(1).messages({
    "number.base": "Thời gian ước lượng phải là số",
    "number.min": "Thời gian ước lượng phải lớn hơn 0",
  }),
  createdBy: Joi.string().optional().uuid().messages({
    "string.guid": "CreatedBy phải là UUID hợp lệ",
  }),
})
  .min(1)
  .messages({
    "object.min": "Phải có ít nhất một trường để cập nhật",
  });

export const filterCourseSchema = Joi.object({
  level: Joi.string()
    .optional()
    .valid("Basic", "Intermediate", "Advanced")
    .messages({
      "any.only": "Level phải là Basic, Intermediate hoặc Advanced",
    }),
  subLevel: Joi.string().optional().valid("Low", "Mid", "High").messages({
    "any.only": "SubLevel phải là Low, Mid hoặc High",
  }),
  minPrice: Joi.number().optional().min(0).messages({
    "number.base": "Giá tối thiểu phải là số",
    "number.min": "Giá tối thiểu không được âm",
  }),
  maxPrice: Joi.number().optional().min(0).messages({
    "number.base": "Giá tối đa phải là số",
    "number.min": "Giá tối đa không được âm",
  }),
  searchTerm: Joi.string().optional().min(1).max(200).messages({
    "string.min": "Từ khóa tìm kiếm phải có ít nhất 1 ký tự",
    "string.max": "Từ khóa tìm kiếm không được vượt quá 200 ký tự",
  }),
  skip: Joi.number().optional().min(0).messages({
    "number.base": "Skip phải là số",
    "number.min": "Skip không được âm",
  }),
  take: Joi.number().optional().min(1).max(100).messages({
    "number.base": "Take phải là số",
    "number.min": "Take phải lớn hơn 0",
    "number.max": "Take không được vượt quá 100",
  }),
})
  .custom((value, helpers) => {
    if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
      return helpers.error("custom.priceRange");
    }
    return value;
  }, "Price range validation")
  .messages({
    "custom.priceRange": "Giá tối thiểu không được lớn hơn giá tối đa",
  });

export const searchCourseSchema = Joi.object({
  search: Joi.string().required().min(1).max(200).messages({
    "string.empty": "Từ khóa tìm kiếm không được để trống",
    "string.min": "Từ khóa tìm kiếm phải có ít nhất 1 ký tự",
    "string.max": "Từ khóa tìm kiếm không được vượt quá 200 ký tự",
    "any.required": "Từ khóa tìm kiếm là bắt buộc",
  }),
  limit: Joi.number().optional().min(1).max(100).messages({
    "number.base": "Limit phải là số",
    "number.min": "Limit phải lớn hơn 0",
    "number.max": "Limit không được vượt quá 100",
  }),
});

export const paginationSchema = Joi.object({
  skip: Joi.number().optional().min(0).messages({
    "number.base": "Skip phải là số",
    "number.min": "Skip không được âm",
  }),
  take: Joi.number().optional().min(1).max(100).messages({
    "number.base": "Take phải là số",
    "number.min": "Take phải lớn hơn 0",
    "number.max": "Take không được vượt quá 100",
  }),
});
