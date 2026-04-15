import { Prisma } from "@prisma/client";
import EnrollmentRepository from "../repositories/enrollment.repository";

class EnrollmentService {
  private readonly enrollmentRepository: EnrollmentRepository;

  constructor(enrollmentRepository: EnrollmentRepository) {
    this.enrollmentRepository = enrollmentRepository;
  }

  async getAllEnrollments(params?: { skip?: number; take?: number }) {
    try {
      return await this.enrollmentRepository.getAllWithDetails(params);
    } catch (error) {
      throw error;
    }
  }

  async getEnrollmentById(id: string) {
    try {
      return await this.enrollmentRepository.getById(id);
    } catch (error) {
      throw error;
    }
  }

  async getEnrollmentsByUser(userId: string) {
    try {
      return await this.enrollmentRepository.findByUserId(userId);
    } catch (error) {
      throw error;
    }
  }

  async getEnrollmentsByCourse(courseId: string) {
    try {
      return await this.enrollmentRepository.findByCourseId(courseId);
    } catch (error) {
      throw error;
    }
  }

  async checkEnrollment(userId: string, courseId: string) {
    try {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(
        userId,
        courseId
      );
      return {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      };
    } catch (error) {
      throw error;
    }
  }

  async createEnrollment(data: Prisma.EnrollmentCreateInput) {
    try {
      return await this.enrollmentRepository.create(data);
    } catch (error) {
      throw error;
    }
  }

  async deleteEnrollment(id: string) {
    try {
      return await this.enrollmentRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async getEnrollmentStats(courseId: string) {
    try {
      const count = await this.enrollmentRepository.countByCourse(courseId);
      return { courseId, totalEnrollments: count };
    } catch (error) {
      throw error;
    }
  }

  async getUserEnrollmentStats(userId: string) {
    try {
      const count = await this.enrollmentRepository.countByUser(userId);
      return { userId, totalEnrolledCourses: count };
    } catch (error) {
      throw error;
    }
  }
}

export default EnrollmentService;
