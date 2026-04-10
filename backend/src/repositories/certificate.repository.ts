import { PrismaClient, Certificate, Prisma } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class CertificateRepository extends BaseRepository<
  "certificate",
  PrismaClient["certificate"],
  Prisma.CertificateCreateInput,
  Prisma.CertificateUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "certificate", "certificateId");
  }

  /**
   * Tạo certificate mới cho user
   */
  async createCertificate(data: {
    userId: string;
    courseId: string;
    certificateCode: string;
    userName: string;
    courseName: string;
    certificateTitle?: string;
    averageScore: number;
    totalScore: number;
    maxScore: number;
    certificateURL?: string;
    pdfUrl?: string;
    qrCodeUrl?: string;
    status?: string;
  }): Promise<Certificate> {
    return this.prisma.certificate.create({
      data,
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            email: true,
          },
        },
        course: {
          select: {
            courseId: true,
            courseName: true,
            courseDescription: true,
          },
        },
      },
    });
  }

  /**
   * Lấy certificate của user cho một course cụ thể
   */
  async getCertificateByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<Certificate | null> {
    return this.prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            email: true,
          },
        },
        course: {
          select: {
            courseId: true,
            courseName: true,
            courseDescription: true,
          },
        },
      },
    });
  }

  /**
   * Lấy tất cả certificates của user
   */
  async getCertificatesByUser(userId: string): Promise<Certificate[]> {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            courseId: true,
            courseName: true,
            courseDescription: true,
            avatarURL: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });
  }

  /**
   * Lấy certificate theo ID
   */
  async getCertificateById(certificateId: string): Promise<Certificate | null> {
    return this.prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            email: true,
          },
        },
        course: {
          select: {
            courseId: true,
            courseName: true,
            courseDescription: true,
          },
        },
      },
    });
  }

  /**
   * Kiểm tra xem user đã có certificate cho course này chưa
   */
  async hasUserReceivedCertificate(
    userId: string,
    courseId: string
  ): Promise<boolean> {
    const certificate = await this.prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    return !!certificate;
  }

  /**
   * Đếm tổng số certificates của user
   */
  async countCertificatesByUser(userId: string): Promise<number> {
    return this.prisma.certificate.count({
      where: { userId },
    });
  }

  /**
   * Cập nhật certificateURL sau khi generate PDF
   */
  async updateCertificateURL(
    certificateId: string,
    certificateURL: string
  ): Promise<Certificate> {
    return this.prisma.certificate.update({
      where: { certificateId },
      data: { certificateURL },
    });
  }

  /**
   * Xóa certificate
   */
  async deleteCertificate(certificateId: string): Promise<void> {
    await this.prisma.certificate.delete({
      where: { certificateId },
    });
  }

  /**
   * Lấy danh sách certificates của course
   */
  async getCertificatesByCourse(courseId: string): Promise<Certificate[]> {
    return this.prisma.certificate.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            email: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });
  }
}
