// Interface để định nghĩa kiểu dữ liệu gửi về BE

export interface Login {
  email: string;
  password: string;
}

export interface Register {
  email: string;
  userName: string;
  password: string;
  gender: string;
  level: string;
}

// Response sử dụng cho FE do BE trả về

export interface LoginResponse {
  success: boolean;
  data: {
    uid: string;
    userId: string;
    roleId: string;
    role: string;
    email: string;
    token: string;
  };
  message: string;
}

//  Kiểu dữ liệu trong token
export interface DecodedToken {
  userId: string;
  email: string;
  name?: string;
  roles?: string[];
  role?: string;
  iat: number;
  exp: number;
}
