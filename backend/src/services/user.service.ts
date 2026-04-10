import { Prisma } from "@prisma/client";
import UserRepository from "../repositories/user.repository";
import PrismaClient from "../configs/prismaClient";
import { UserRoles } from "../constants/roles";
import createHttpError from "http-errors";
import argon2 from "argon2";
import FirebaseService from "./firebase.service";
import jwt from "jsonwebtoken";

class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async verifyPassword(hash: string, plain: string) {
    const valid = await this.userRepository.verifyPassword(hash, plain);
    if (!valid) {
      throw new Error("Mật khẩu không hợp lệ hoặc dữ liệu mật khẩu bị lỗi.");
    }
    return true;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.getUserByEmailWithRoles(email);

    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    try {
      await this.verifyPassword(user.password, password);
    } catch (err) {
      throw new Error(
        (err as Error).message || "Email hoặc mật khẩu không đúng"
      );
    }

    const roles = user.roles.map((userRole) => userRole.role.name);

    const { password: _, ...userData } = user;
    return {
      ...userData,
      roles,
    };
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      return null;
    }
    const { password: _, ...userData } = user;
    return userData;
  }

  async getUserWithRelations(userId: string) {
    const user = await this.userRepository.getUserWithRelations(userId);
    if (!user) {
      return null;
    }
    const { password: _, ...userData } = user;
    return userData;
  }

  async getUserByName(userName: string) {
    return this.userRepository.getUserByName(userName);
  }

  async searchUserByName(searchTerm: string) {
    return this.userRepository.searchUserByName(searchTerm);
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      return null;
    }
    const { password: _, ...userData } = user;
    return userData;
  }

  async getAllUser(skip = 0, take = 0) {
    const users = await this.userRepository.getAll({ skip, take });
    return users.map((user: any) => {
      const { password, ...userData } = user;
      return userData;
    });
  }

  async changePasswordUser(userId: string, newPassword: string) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }
    return this.userRepository.changePasswordUser(userId, newPassword);
  }

  async createUser(user: Prisma.UserCreateInput) {
    const existing = await this.userRepository.getUserByEmail(user.email);
    if (existing) {
      throw new Error("Email đã tồn tại");
    }

    const newUser = await this.userRepository.create(user);

    const userRole = await PrismaClient.role.findUnique({
      where: { name: UserRoles.USER },
    });

    if (userRole) {
      await PrismaClient.userRole.create({
        data: {
          userId: newUser.userId,
          roleId: userRole.roleId,
        },
      });
    }

    const { password: _, ...userData } = newUser;
    return userData;
  }

  async updateUser(user: Prisma.UserUpdateInput, userId: string) {
    const existingUser = await this.userRepository.getById(userId);
    if (!existingUser) {
      throw new Error("Người dùng không tồn tại");
    }
    if (user.email && user.email !== existingUser.email) {
      const emailUser = await this.userRepository.getUserByEmail(
        user.email as string
      );
      if (emailUser) {
        throw new Error("Email đã tồn tại");
      }
    }
    const updatedUser = await this.userRepository.update(userId, user);
    const { password: _, ...userData } = updatedUser;
    return userData;
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }
    return this.userRepository.delete(userId);
  }

  async getUserEnrolledCourses(userId: string) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }
    return this.userRepository.getUserEnrolledCourses(userId);
  }

  async isUserEnrolledInCourse(userId: string, courseId: string) {
    return this.userRepository.isUserEnrolledInCourse(userId, courseId);
  }

  // ============================================
  // FIREBASE AUTHENTICATION METHODS
  // ============================================

  /**
   * Đăng nhập với Firebase Authentication
   * Sử dụng Firebase REST API để xác thực
   */
  async loginWithFirebase(email: string, password: string) {
    // 1. Gọi Firebase Service để xác thực
    const { idToken, refreshToken } =
      await FirebaseService.signInWithEmailPassword(email, password);

    // 2. Verify token
    const decodedToken = await FirebaseService.verifyIdToken(idToken);

    // 3. Tìm user trong database theo firebaseUid
    const user = await this.userRepository.findUserByFirebaseUid(
      decodedToken.uid
    );

    if (!user) {
      throw createHttpError(404, "Người dùng chưa đăng ký tài khoản");
    }

    // 4. Extract roles
    const roles = user.roles.map((ur) => ur.role.name);

    // 5. Trả về token + user info
    return {
      token: idToken,
      refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        userName: user.userName,
        avatarURL: user.avatarURL,
        roles,
      },
    };
  }

  /**
   * Đăng ký với Firebase Authentication
   * Tạo user trong Firebase và đồng bộ vào PostgreSQL
   */
  async registerWithFirebase(userData: Prisma.UserCreateInput) {
    const result = await PrismaClient.$transaction(async (tx) => {
      // 1. Kiểm tra email đã tồn tại chưa
      const existingUser = await tx.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw createHttpError(400, "Email đã được đăng ký");
      }

      // 2. Tạo user trong Firebase Authentication
      const firebaseUser = await FirebaseService.createUser({
        email: userData.email,
        password: userData.password!,
        displayName: userData.userName,
      });

      console.log("✅ Firebase account created:", firebaseUser.uid);

      // 3. Hash password và lưu vào PostgreSQL
      const hashedPassword = await argon2.hash(userData.password!);

      const newUser = await tx.user.create({
        data: {
          userName: userData.userName,
          password: hashedPassword,
          email: userData.email,
          gender: userData.gender,
          level: userData.level,
          firebaseUid: firebaseUser.uid, // ⭐ Link với Firebase
        },
      });

      // 4. Gán role User mặc định
      const defaultRole = await tx.role.findUnique({
        where: { name: UserRoles.USER },
      });

      if (!defaultRole) {
        throw new Error("Role mặc định 'User' chưa được khởi tạo");
      }

      await tx.userRole.create({
        data: {
          userId: newUser.userId,
          roleId: defaultRole.roleId,
        },
      });

      return newUser;
    });

    const { password: _, ...userDataWithoutPassword } = result;
    return userDataWithoutPassword;
  }

  /**
   * Verify Firebase token và lấy thông tin user
   */
  async verifyFirebaseToken(idToken: string) {
    const decodedToken = await FirebaseService.verifyIdToken(idToken);
    const user = await this.userRepository.findUserByFirebaseUid(
      decodedToken.uid
    );

    if (!user) {
      throw createHttpError(404, "Người dùng không tồn tại");
    }

    const { password: _, ...userData } = user;
    return userData;
  }

  /**
   * Google Login - Verify Firebase token và tạo/update user, trả về JWT
   * Xử lý cả user mới (auto-register) và user đã tồn tại
   */
  async googleLogin(idToken: string) {
    // 1. Verify Firebase token
    const decodedToken = await FirebaseService.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      throw createHttpError(400, "Email không tồn tại trong Google account");
    }

    // 2. Tìm user theo firebaseUid hoặc email
    let user = await this.userRepository.findUserByFirebaseUid(uid);

    if (!user) {
      // Kiểm tra user đã tồn tại với email này chưa (login bằng cách khác trước đó)
      const existingUser = await this.userRepository.getUserByEmail(email);

      if (existingUser) {
        // User tồn tại nhưng chưa link Firebase - update firebaseUid
        await this.userRepository.update(existingUser.userId, {
          firebaseUid: uid,
          avatarURL: picture || existingUser.avatarURL,
        });
        // Lấy lại user với roles sau khi update
        user = await this.userRepository.findUserByFirebaseUid(uid);
      } else {
        // User hoàn toàn mới - tạo account
        await PrismaClient.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              userName: name || email.split("@")[0],
              email: email,
              firebaseUid: uid,
              avatarURL: picture,
              password: "", // Google users không cần password
              gender: "OTHER" as const, // Giá trị mặc định
            },
          });

          // Gán role User mặc định
          const defaultRole = await tx.role.findUnique({
            where: { name: UserRoles.USER },
          });

          if (!defaultRole) {
            throw new Error("Role mặc định 'User' chưa được khởi tạo");
          }

          await tx.userRole.create({
            data: {
              userId: newUser.userId,
              roleId: defaultRole.roleId,
            },
          });
        });

        // Lấy user với roles sau khi tạo mới
        user = await this.userRepository.findUserByFirebaseUid(uid);
      }
    } else {
      // User đã tồn tại - update thông tin mới nhất từ Google
      await this.userRepository.update(user.userId, {
        avatarURL: picture || user.avatarURL,
        userName: name || user.userName,
      });
      // Lấy lại user sau khi update
      user = await this.userRepository.findUserByFirebaseUid(uid);
    }

    // 3. Kiểm tra user có tồn tại không
    if (!user) {
      throw createHttpError(500, "Lỗi khi lấy thông tin user");
    }

    // 4. Extract roles
    const roles = user.roles.map((ur: any) => ur.role.name);

    // 5. Tạo JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        roles,
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" }
    );

    // 6. Trả về token + user info
    return {
      token,
      user: {
        userId: user.userId,
        email: user.email,
        userName: user.userName,
        avatarURL: user.avatarURL,
        roles,
      },
    };
  }
}

export default UserService;
