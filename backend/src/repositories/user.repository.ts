import argon2 from "argon2";
import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository<
  "user",
  PrismaClient["user"],
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(prisma: PrismaClient, primaryKey: string) {
    super(prisma, "user", primaryKey);
  }

  async getUserByName(userName: string) {
    return await this.prisma.user.findMany({
      where: { userName },
      select: {
        userId: true,
        userName: true,
        email: true,
        gender: true,
        avatarURL: true,
        region: true,
        dateOfBirth: true,
        level: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserByEmailWithRoles(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Tìm user theo Firebase UID
   */
  async findUserByFirebaseUid(firebaseUid: string) {
    return await this.prisma.user.findFirst({
      where: { firebaseUid },
      include: {
        roles: {
          include: {
            role: {
              include: {
                roleClaims: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Cập nhật Firebase UID cho user
   */
  async updateFirebaseUid(userId: string, firebaseUid: string) {
    return await this.prisma.user.update({
      where: { userId },
      data: { firebaseUid },
    });
  }

  async searchUserByName(searchTerm: string, limit: number = 20) {
    return await this.prisma.user.findMany({
      where: {
        userName: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        userId: true,
        userName: true,
        email: true,
        avatarURL: true,
        level: true,
      },
      take: limit,
      orderBy: {
        userName: "asc",
      },
    });
  }

  async changePasswordUser(userId: string, newPassword: string) {
    const hashedPassword = await argon2.hash(newPassword);
    return await this.prisma.user.update({
      where: { userId },
      data: {
        password: hashedPassword,
      },
      select: {
        userId: true,
        userName: true,
        email: true,
        updated_at: true,
      },
    });
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    if (typeof hash !== "string" || !hash.startsWith("$")) {
      return false;
    }
    try {
      return await argon2.verify(hash, plain);
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }

  async create(data: Prisma.UserCreateInput) {
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }
    return await super.create(data);
  }

  async update(userId: string, data: Prisma.UserUpdateInput) {
    if (data.password && typeof data.password === "string") {
      data.password = await argon2.hash(data.password);
    }
    return await super.update(userId, data);
  }

  async getUserWithRelations(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        coursesCreated: {
          select: {
            courseId: true,
            courseName: true,
            coursePrice: true,
            level: true,
          },
        },
        enrollments: {
          include: {
            course: {
              select: {
                courseId: true,
                courseName: true,
                avatarURL: true,
              },
            },
          },
        },
        certificates: {
          select: {
            certificateId: true,
            certificateTitle: true,
            issuedAt: true,
            course: {
              select: {
                courseName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      roles: user.roles || [],
      coursesCreated: user.coursesCreated || [],
      enrollments: user.enrollments || [],
      certificates: user.certificates || [],
    };
  }

  async getUserEnrolledCourses(
    userId: string,
    options?: { skip?: number; take?: number }
  ) {
    const { skip = 0, take = 10 } = options || {};

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            chapters: {
              select: {
                chapterId: true,
                chapterName: true,
                totalLesson: true,
              },
              orderBy: {
                created_at: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });

    return enrollments.map((enrollment) => ({
      ...enrollment,
      course: enrollment.course
        ? {
            ...enrollment.course,
            chapters: enrollment.course.chapters || [],
          }
        : null,
    }));
  }

  async isUserEnrolledInCourse(
    userId: string,
    courseId: string
  ): Promise<boolean> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    return !!enrollment;
  }

  async countUserEnrolledCourses(userId: string): Promise<number> {
    return await this.prisma.enrollment.count({
      where: { userId },
    });
  }

  async getUserStats(userId: string) {
    const [totalEnrollments, totalCertificates, totalCoursesCreated] =
      await Promise.all([
        this.prisma.enrollment.count({ where: { userId } }),
        this.prisma.certificate.count({ where: { userId } }),
        this.prisma.course.count({ where: { createdBy: userId } }),
      ]);

    return {
      totalEnrollments,
      totalCertificates,
      totalCoursesCreated,
    };
  }
}

export default UserRepository;
