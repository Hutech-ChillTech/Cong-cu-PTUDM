import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.empty": "Email không được để trống",
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().required().min(6).messages({
    "string.empty": "Mật khẩu không được để trống",
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

export const createUserSchema = Joi.object({
  userName: Joi.string().required().min(3).max(100).messages({
    "string.empty": "Tên người dùng không được để trống",
    "string.min": "Tên người dùng phải có ít nhất 3 ký tự",
    "string.max": "Tên người dùng không được vượt quá 100 ký tự",
    "any.required": "Tên người dùng là bắt buộc",
  }),
  password: Joi.string().required().min(6).max(100).messages({
    "string.empty": "Mật khẩu không được để trống",
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "string.max": "Mật khẩu không được vượt quá 100 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  email: Joi.string().required().email().messages({
    "string.empty": "Email không được để trống",
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  gender: Joi.string().required().valid("MALE", "FEMALE", "OTHER").messages({
    "string.empty": "Giới tính không được để trống",
    "any.only": "Giới tính phải là MALE, FEMALE hoặc OTHER",
    "any.required": "Giới tính là bắt buộc",
  }),
  avatarURL: Joi.string().optional().uri().messages({
    "string.uri": "Avatar URL phải là một URL hợp lệ",
  }),
  region: Joi.string().optional().max(100).messages({
    "string.max": "Khu vực không được vượt quá 100 ký tự",
  }),
  dateOfBirth: Joi.date().optional().iso().messages({
    "date.base": "Ngày sinh không hợp lệ",
    "date.format": "Ngày sinh phải theo định dạng ISO (YYYY-MM-DD)",
  }),
  level: Joi.string()
    .optional()
    .valid("Basic", "Intermediate", "Advanced")
    .messages({
      "any.only": "Level phải là Basic, Intermediate hoặc Advanced",
    }),
  specialization: Joi.string().optional().allow("").max(100).messages({
    "string.max": "Ngành nghề không được vượt quá 100 ký tự",
  }),
});

export const updateUserSchema = Joi.object({
  userName: Joi.string().optional().min(3).max(100).messages({
    "string.min": "Tên người dùng phải có ít nhất 3 ký tự",
    "string.max": "Tên người dùng không được vượt quá 100 ký tự",
  }),
  password: Joi.string().optional().min(6).max(100).messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "string.max": "Mật khẩu không được vượt quá 100 ký tự",
  }),
  email: Joi.string().optional().email().messages({
    "string.email": "Email không hợp lệ",
  }),
  gender: Joi.string().optional().valid("MALE", "FEMALE", "OTHER").messages({
    "any.only": "Giới tính phải là MALE, FEMALE hoặc OTHER",
  }),
  avatarURL: Joi.string().optional().uri().messages({
    "string.uri": "Avatar URL phải là một URL hợp lệ",
  }),
  region: Joi.string().optional().max(100).messages({
    "string.max": "Khu vực không được vượt quá 100 ký tự",
  }),
  dateOfBirth: Joi.date().optional().iso().messages({
    "date.base": "Ngày sinh không hợp lệ",
    "date.format": "Ngày sinh phải theo định dạng ISO (YYYY-MM-DD)",
  }),
  level: Joi.string()
    .optional()
    .valid("Basic", "Intermediate", "Advanced")
    .messages({
      "any.only": "Level phải là Basic, Intermediate hoặc Advanced",
    }),
  specialization: Joi.string().optional().allow("").max(100).messages({
    "string.max": "Ngành nghề không được vượt quá 100 ký tự",
  }),
})
  .min(1)
  .messages({
    "object.min": "Phải có ít nhất một trường để cập nhật",
  });

export const changePasswordSchema = Joi.object({
  newPassword: Joi.string().required().min(6).max(100).messages({
    "string.empty": "Mật khẩu mới không được để trống",
    "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
    "string.max": "Mật khẩu mới không được vượt quá 100 ký tự",
    "any.required": "Mật khẩu mới là bắt buộc",
  }),
});

export const searchUserSchema = Joi.object({
  search: Joi.string().required().min(1).max(100).messages({
    "string.empty": "Từ khóa tìm kiếm không được để trống",
    "string.min": "Từ khóa tìm kiếm phải có ít nhất 1 ký tự",
    "string.max": "Từ khóa tìm kiếm không được vượt quá 100 ký tự",
    "any.required": "Từ khóa tìm kiếm là bắt buộc",
  }),
});

export const getUserByNameSchema = Joi.object({
  userName: Joi.string().required().min(1).max(100).messages({
    "string.empty": "Tên người dùng không được để trống",
    "string.min": "Tên người dùng phải có ít nhất 1 ký tự",
    "string.max": "Tên người dùng không được vượt quá 100 ký tự",
    "any.required": "Tên người dùng là bắt buộc",
  }),
});

export const getUserByEmailSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.empty": "Email không được để trống",
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
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
