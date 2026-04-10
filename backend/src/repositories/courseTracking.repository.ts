import { BaseRepository } from "./baseRepository";
import prisma from "../configs/prismaClient";
import { Enrollment, Prisma } from "@prisma/client";

class CourseTrackingRepository extends BaseRepository<
  "enrollment",
  typeof prisma.enrollment,
  Prisma.EnrollmentCreateInput,
  Prisma.EnrollmentUpdateInput
> {
  constructor() {
    super(prisma, "enrollment", "enrollmentId");
  }

  /**
   * Lấy enrollment với tracking info
   */
  async getEnrollmentWithTracking(userId: string, courseId: string) {
    return await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            avatarURL: true,
            estimatedDuration: true,
          },
        },
      },
    });
  }

  /**
   * Bắt đầu tracking (set firstAccessAt nếu chưa có)
   */
  async startTracking(userId: string, courseId: string) {
    const enrollment = await this.getEnrollmentWithTracking(userId, courseId);

    if (!enrollment) {
      return null;
    }

    const now = new Date();
    const updateData: any = {
      isCurrentlyActive: true,
      lastAccessAt: now,
    };

    // Nếu chưa có firstAccessAt, set nó
    if (!enrollment.firstAccessAt) {
      updateData.firstAccessAt = now;
    }

    return await prisma.enrollment.update({
      where: { enrollmentId: enrollment.enrollmentId },
      data: updateData,
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
          },
        },
      },
    });
  }

  /**
   * Update heartbeat (cộng thời gian và update lastAccessAt)
   */
  async updateHeartbeat(userId: string, courseId: string) {
    const enrollment = await this.getEnrollmentWithTracking(userId, courseId);

    if (!enrollment || !enrollment.isCurrentlyActive) {
      return null;
    }

    const now = new Date();
    const lastAccess =
      enrollment.lastAccessAt || enrollment.firstAccessAt || now;

    // Tính thời gian elapsed (giây)
    const elapsedSeconds = Math.floor(
      (now.getTime() - lastAccess.getTime()) / 1000
    );

    // Chỉ cộng thời gian nếu elapsed < 300 giây (5 phút)
    const timeToAdd = elapsedSeconds < 300 ? elapsedSeconds : 0;

    return await prisma.enrollment.update({
      where: { enrollmentId: enrollment.enrollmentId },
      data: {
        totalCompletionTime: enrollment.totalCompletionTime + timeToAdd,
        lastAccessAt: now,
      },
    });
  }

  /**
   * Pause tracking
   */
  async pauseTracking(userId: string, courseId: string) {
    const enrollment = await this.getEnrollmentWithTracking(userId, courseId);

    if (!enrollment) {
      return null;
    }

    const now = new Date();
    const lastAccess =
      enrollment.lastAccessAt || enrollment.firstAccessAt || now;

    // Tính thời gian elapsed (giây)
    const elapsedSeconds = Math.floor(
      (now.getTime() - lastAccess.getTime()) / 1000
    );

    // Chỉ cộng thời gian nếu elapsed < 300 giây (5 phút)
    const timeToAdd = elapsedSeconds < 300 ? elapsedSeconds : 0;

    return await prisma.enrollment.update({
      where: { enrollmentId: enrollment.enrollmentId },
      data: {
        totalCompletionTime: enrollment.totalCompletionTime + timeToAdd,
        isCurrentlyActive: false,
        lastAccessAt: now,
      },
    });
  }

  /**
   * Complete course (set completedAt)
   */
  async completeCourse(userId: string, courseId: string) {
    const enrollment = await this.getEnrollmentWithTracking(userId, courseId);

    if (!enrollment || enrollment.completedAt) {
      return null; // Đã hoàn thành rồi
    }

    const now = new Date();
    const lastAccess =
      enrollment.lastAccessAt || enrollment.firstAccessAt || now;

    // Tính thời gian elapsed (giây)
    const elapsedSeconds = Math.floor(
      (now.getTime() - lastAccess.getTime()) / 1000
    );
    const timeToAdd = elapsedSeconds < 300 ? elapsedSeconds : 0;

    return await prisma.enrollment.update({
      where: { enrollmentId: enrollment.enrollmentId },
      data: {
        completedAt: now,
        totalCompletionTime: enrollment.totalCompletionTime + timeToAdd,
        isCurrentlyActive: false,
        lastAccessAt: now,
      },
    });
  }

  /**
   * Lấy thông tin completion time
   */
  async getCompletionTime(userId: string, courseId: string) {
    const enrollment = await this.getEnrollmentWithTracking(userId, courseId);

    if (!enrollment) {
      return null;
    }

    // Tính các metrics
    const totalHours = enrollment.totalCompletionTime / 3600;

    let totalDays = 0;
    if (enrollment.firstAccessAt && enrollment.completedAt) {
      totalDays = Math.ceil(
        (enrollment.completedAt.getTime() -
          enrollment.firstAccessAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

    const isCompleted = !!enrollment.completedAt;

    return {
      enrollmentId: enrollment.enrollmentId,
      courseId: enrollment.courseId,
      courseName: enrollment.course.courseName,
      firstAccessAt: enrollment.firstAccessAt,
      lastAccessAt: enrollment.lastAccessAt,
      completedAt: enrollment.completedAt,
      totalCompletionTime: enrollment.totalCompletionTime,
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalDays,
      isCompleted,
      isCurrentlyActive: enrollment.isCurrentlyActive,
    };
  }

  /**
   * Lấy tất cả courses với completion time của user
   */
  async getAllCompletionTimes(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            avatarURL: true,
            estimatedDuration: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return enrollments.map((enrollment) => {
      const totalHours = enrollment.totalCompletionTime / 3600;

      let totalDays = 0;
      if (enrollment.firstAccessAt && enrollment.completedAt) {
        totalDays = Math.ceil(
          (enrollment.completedAt.getTime() -
            enrollment.firstAccessAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
      }

      return {
        enrollmentId: enrollment.enrollmentId,
        courseId: enrollment.courseId,
        courseName: enrollment.course.courseName,
        courseAvatar: enrollment.course.avatarURL,
        estimatedDuration: enrollment.course.estimatedDuration,
        enrolledAt: enrollment.createdAt,
        firstAccessAt: enrollment.firstAccessAt,
        lastAccessAt: enrollment.lastAccessAt,
        completedAt: enrollment.completedAt,
        totalCompletionTime: enrollment.totalCompletionTime,
        totalHours: parseFloat(totalHours.toFixed(2)),
        totalDays,
        isCompleted: !!enrollment.completedAt,
        isCurrentlyActive: enrollment.isCurrentlyActive,
      };
    });
  }
}

export default CourseTrackingRepository;
