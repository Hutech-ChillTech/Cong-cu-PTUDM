import { CertificateRepository } from "../repositories/certificate.repository";
import { SubmissionRepository } from "../repositories/submission.repository";
import EnrollmentRepository from "../repositories/enrollment.repository";
import prisma from "../configs/prismaClient";
import { PDFGenerator } from "../utils/pdfGenerator";

export class CertificateService {
  private certificateRepository: CertificateRepository;
  private submissionRepository: SubmissionRepository;
  private enrollmentRepository: EnrollmentRepository;

  constructor() {
    this.certificateRepository = new CertificateRepository(prisma);
    this.submissionRepository = new SubmissionRepository(prisma);
    this.enrollmentRepository = new EnrollmentRepository(prisma, "enrollmentId");
  }

  /**
   * Helper: Normalize certificate URL
   * Converts legacy certificateURL to proper format
   */
  private normalizeCertificateURL(cert: any): any {
    if (!cert) return cert;

    // Nếu đã có pdfUrl (Cloudinary) → Dùng luôn
    if (cert.pdfUrl && cert.pdfUrl.startsWith('http')) {
      return cert;
    }

    // Nếu chỉ có certificateURL (legacy local path)
    if (cert.certificateURL && !cert.pdfUrl) {
      // Extract filename từ path /certificates/filename.pdf
      const filename = cert.certificateURL.split('/').pop();
      // Tạo URL view endpoint (KHÔNG có /api/ prefix để frontend tự thêm)
      cert.viewUrl = `/certificates/view/${filename}`;
    }

    return cert;
  }

  /**
   * 🎯 Kiểm tra điều kiện cấp chứng chỉ
   * Điều kiện:
   * 1. Đã mua khóa học (có enrollment)
   * 2. Hoàn thành 100% bài học
   * 3. Hoàn thành quiz cuối khóa (nếu có)
   */
  async checkEligibility(userId: string, courseId: string): Promise<{
    eligible: boolean;
    reason?: string;
    progress?: number;
    quizCompletion?: number;
  }> {
    // 1. Kiểm tra đã mua khóa học
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (!enrollment) {
      return {
        eligible: false,
        reason: "Bạn chưa đăng ký khóa học này"
      };
    }

    // 2. Kiểm tra hoàn thành 100% bài học
    const courseProgress = await prisma.course.findUnique({
      where: { courseId },
      include: {
        chapters: {
          include: {
            lessons: {
              include: {
                lessonsProgress: {
                  where: { userId }
                }
              }
            }
          }
        }
      }
    });

    if (!courseProgress) {
      return {
        eligible: false,
        reason: "Không tìm thấy khóa học"
      };
    }

    // Tính tổng số bài học và số bài đã hoàn thành
    let totalLessons = 0;
    let completedLessons = 0;

    courseProgress.chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.lessonsProgress.some(p => p.isCompleted)) {
          completedLessons++;
        }
      });
    });

    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    if (progress < 100) {
      return {
        eligible: false,
        reason: `Bạn cần hoàn thành 100% bài học. Hiện tại: ${progress.toFixed(1)}%`,
        progress
      };
    }

    // 3. Kiểm tra quiz cuối khóa (nếu có)
    const allQuizzes = await prisma.chapterQuiz.findMany({
      where: {
        chapter: { courseId }
      }
    });

    if (allQuizzes.length > 0) {
      const submissions = await this.submissionRepository.getSubmissionsByUserAndCourse(userId, courseId);
      
      const passedQuizzes = submissions.filter(s => s.isPassed).length;
      const quizCompletion = (passedQuizzes / allQuizzes.length) * 100;

      if (passedQuizzes < allQuizzes.length) {
        return {
          eligible: false,
          reason: `Bạn cần hoàn thành tất cả quiz. Hiện tại: ${passedQuizzes}/${allQuizzes.length}`,
          quizCompletion
        };
      }
    }

    return {
      eligible: true,
      progress: 100
    };
  }

  /**
   * 🎓 Cấp chứng chỉ cho user
   * POST /api/certificates/issue
   */
  async issueCertificate(userId: string, courseId: string) {
    // 1. Kiểm tra đã có certificate chưa
    const existingCert = await this.certificateRepository.getCertificateByUserAndCourse(userId, courseId);
    if (existingCert) {
      // Trả về certificate hiện có thay vì throw error
      console.log(`ℹ️ User ${userId} đã có certificate cho course ${courseId}, trả về certificate hiện có`);
      return {
        success: true,
        certificateId: existingCert.certificateId,
        certificateCode: existingCert.certificateCode,
        pdfUrl: existingCert.pdfUrl,
        qrCodeUrl: existingCert.qrCodeUrl,
        message: `Bạn đã nhận certificate này rồi! Điểm: ${existingCert.averageScore?.toFixed(2)}%`,
        alreadyIssued: true
      };
    }

    // 2. Kiểm tra điều kiện
    const eligibility = await this.checkEligibility(userId, courseId);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || "Bạn chưa đủ điều kiện nhận certificate");
    }

    // 3. Lấy thông tin user và course
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userName: true }
    });

    const course = await prisma.course.findUnique({
      where: { courseId },
      select: { courseName: true }
    });

    if (!user || !course) {
      throw new Error("Không tìm thấy thông tin user hoặc course");
    }

    // 4. Tính điểm trung bình từ quiz
    const submissions = await this.submissionRepository.getSubmissionsByUserAndCourse(userId, courseId);
    
    let totalScore = 0;
    let maxScore = 0;

    submissions.forEach((sub) => {
      totalScore += sub.score || 0;
      maxScore += sub.maxScore || 0;
    });

    const averageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Debug: Log score calculation
    console.log(`📊 Score Calculation:`, {
      totalScore,
      maxScore,
      averageScore: averageScore.toFixed(2),
      submissionsCount: submissions.length
    });

    // 5. Sinh certificate code
    const certificateCode = PDFGenerator.generateCertificateCode(course.courseName);

    // 6. Sinh PDF certificate với Puppeteer (đẹp hơn)
    const { PuppeteerPDFService } = await import("../utils/puppeteerPDF.service.js");
    
    const roundedScore = Math.round(averageScore * 100) / 100;
    
    console.log(`🎨 Generating PDF with:`, {
      userName: user.userName,
      courseName: course.courseName,
      averageScore: roundedScore
    });
    
    const pdfBuffer = await PuppeteerPDFService.generateCertificatePDF({
      userName: user.userName,
      courseName: course.courseName,
      certificateCode,
      issuedAt: new Date(),
      averageScore: roundedScore,
      companyName: "HUTECH EDUCATION",
      companySubtitle: "Online Learning Platform"
    });

    // 7. Upload PDF lên Cloudinary
    const pdfUrl = await PDFGenerator.uploadPDFToCloudinary(pdfBuffer, certificateCode);

    // 8. Sinh và upload QR Code
    const qrCodeDataUrl = await PDFGenerator.generateQRCode(certificateCode);
    const qrCodeUrl = await PDFGenerator.uploadQRCodeToCloudinary(qrCodeDataUrl, certificateCode);

    // 9. Tạo certificate trong database
    const certificate = await this.certificateRepository.createCertificate({
      userId,
      courseId,
      certificateCode,
      userName: user.userName,
      courseName: course.courseName,
      certificateTitle: `Chứng chỉ hoàn thành khóa học ${course.courseName}`,
      averageScore: Math.round(averageScore * 100) / 100,
      totalScore,
      maxScore,
      pdfUrl,
      qrCodeUrl,
      status: "valid"
    });

    console.log(`🎓 Beautiful certificate generated with Puppeteer! Code: ${certificateCode}`);

    return {
      success: true,
      certificateId: certificate.certificateId,
      certificateCode: certificate.certificateCode,
      pdfUrl: certificate.pdfUrl,
      qrCodeUrl: certificate.qrCodeUrl,
      message: `Chúc mừng! Bạn đã nhận được certificate với điểm ${averageScore.toFixed(2)}%`,
      alreadyIssued: false
    };
  }

  /**
   * 📄 Lấy chứng chỉ của user trong một course
   * GET /api/certificates/:courseId
   */
  async getUserCertificateInCourse(userId: string, courseId: string) {
    const certificate = await this.certificateRepository.getCertificateByUserAndCourse(userId, courseId);

    if (!certificate) {
      throw new Error("Bạn chưa nhận certificate cho khóa học này!");
    }

    // Kiểm tra quyền sở hữu
    if (certificate.userId !== userId) {
      throw new Error("Bạn không có quyền truy cập certificate này!");
    }

    // Normalize URL cho cả legacy và modern certificates
    return this.normalizeCertificateURL(certificate);
  }

  /**
   * ✅ Xác thực chứng chỉ (public API)
   * GET /api/certificates/verify/:certificateCode
   */
  async verifyCertificate(certificateCode: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode },
      include: {
        user: {
          select: {
            userName: true
          }
        },
        course: {
          select: {
            courseName: true
          }
        }
      }
    });

    if (!certificate) {
      return {
        valid: false,
        message: "Certificate không tồn tại"
      };
    }

    if (certificate.status !== "valid") {
      return {
        valid: false,
        message: "Certificate đã bị thu hồi",
        status: certificate.status
      };
    }

    return {
      valid: true,
      certificateCode: certificate.certificateCode,
      userName: certificate.userName,
      courseName: certificate.courseName,
      issuedAt: certificate.issuedAt,
      averageScore: certificate.averageScore,
      pdfUrl: certificate.pdfUrl
    };
  }

  /**
   * 📋 Lấy tất cả certificates của user
   * GET /api/certificates/my-certificates
   */
  async getUserCertificates(userId: string) {
    const certificates = await this.certificateRepository.getCertificatesByUser(userId);
    // Normalize URLs cho tất cả certificates
    return certificates.map(cert => this.normalizeCertificateURL(cert));
  }

  /**
   * 🔍 Lấy certificate theo ID
   */
  async getCertificateById(certificateId: string) {
    const certificate = await this.certificateRepository.getCertificateById(certificateId);

    if (!certificate) {
      throw new Error("Không tìm thấy certificate!");
    }

    return certificate;
  }

  /**
   * 🔄 Cập nhật URL sau khi generate PDF certificate (Legacy)
   * @deprecated Use issueCertificate instead
   */
  async updateCertificateURL(certificateId: string, certificateURL: string) {
    return this.certificateRepository.updateCertificateURL(certificateId, certificateURL);
  }

  /**
   * 🗑️ Thu hồi certificate (Admin only)
   */
  async revokeCertificate(certificateId: string) {
    const certificate = await this.certificateRepository.getCertificateById(certificateId);
    
    if (!certificate) {
      throw new Error("Không tìm thấy certificate!");
    }

    await prisma.certificate.update({
      where: { certificateId },
      data: { status: "revoked" }
    });

    return { message: "Thu hồi certificate thành công!" };
  }

  /**
   * 📊 Lấy danh sách certificates của course (dành cho admin/creator)
   */
  async getCourseCertificates(courseId: string) {
    return this.certificateRepository.getCertificatesByCourse(courseId);
  }

  /**
   * 🗑️ Xóa certificate (dành cho admin)
   */
  async deleteCertificate(certificateId: string) {
    await this.certificateRepository.deleteCertificate(certificateId);
    return { message: "Xóa certificate thành công!" };
  }

  /**
   * 📈 Thống kê certificate
   */
  async getCertificateStats(userId: string) {
    const totalCertificates = await this.certificateRepository.countCertificatesByUser(userId);
    const certificates = await this.certificateRepository.getCertificatesByUser(userId);

    const avgScore =
      certificates.length > 0
        ? certificates.reduce((sum, cert) => sum + (cert.averageScore || 0), 0) / certificates.length
        : 0;

    return {
      totalCertificates,
      averageScore: Math.round(avgScore * 100) / 100,
      certificates,
    };
  }

  /**
   * ⚠️ Legacy method - Kiểm tra và cấp certificate (Old version)
   * @deprecated Use issueCertificate instead
   */
  async checkAndIssueCertificate(userId: string, courseId: string) {
    return this.issueCertificate(userId, courseId);
  }
}
