import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Legacy interface for backward compatibility
export interface CertificateData {
  userName: string;
  courseName: string;
  level: string;
  subLevel: string;
  totalScore: number;
  issuedDate: Date;
}

// New interface for modern certificate generation
export interface ModernCertificateData {
  certificateCode: string;
  userName: string;
  courseName: string;
  issuedAt: Date;
  averageScore?: number;
}

export class PDFGenerator {
  /**
   * Sinh QR Code từ certificate code
   */
  static async generateQRCode(certificateCode: string): Promise<string> {
    try {
      // Tạo URL xác thực certificate
      const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-certificate/${certificateCode}`;

      // Sinh QR code dạng base64
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Upload QR Code lên Cloudinary
   */
  static async uploadQRCodeToCloudinary(
    qrCodeDataUrl: string,
    certificateCode: string,
  ): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(qrCodeDataUrl, {
        folder: "certificates/qrcodes",
        public_id: `qr_${certificateCode}`,
        overwrite: true,
      });

      return result.secure_url;
    } catch (error) {
      console.error("Error uploading QR code to Cloudinary:", error);
      throw new Error("Failed to upload QR code");
    }
  }

  /**
   * Sinh PDF Certificate mới với QR Code
   */
  static async generateModernCertificatePDF(
    data: ModernCertificateData,
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Sinh QR Code
        const qrCodeDataUrl = await this.generateQRCode(data.certificateCode);

        // === HEADER ===
        // Logo (nếu có)
        const logoPath = path.join(__dirname, "../../public/logo.png");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 30, { width: 80 });
        }

        // Tiêu đề
        doc
          .fontSize(32)
          .font("Helvetica-Bold")
          .fillColor("#1a1a1a")
          .text("CERTIFICATE OF COMPLETION", 0, 100, { align: "center" });

        doc
          .fontSize(14)
          .font("Helvetica")
          .fillColor("#666666")
          .text("This is to certify that", 0, 160, { align: "center" });

        // === TÊN NGƯỜI HỌC ===
        doc
          .fontSize(36)
          .font("Helvetica-Bold")
          .fillColor("#2563eb")
          .text(data.userName, 0, 190, { align: "center" });

        doc
          .fontSize(14)
          .font("Helvetica")
          .fillColor("#666666")
          .text("has successfully completed the course", 0, 240, {
            align: "center",
          });

        // === TÊN KHÓA HỌC ===
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .fillColor("#1a1a1a")
          .text(data.courseName, 0, 270, { align: "center", width: 700 });

        // === ĐIỂM SỐ (nếu có) ===
        if (data.averageScore !== undefined && data.averageScore !== null) {
          doc
            .fontSize(16)
            .font("Helvetica")
            .fillColor("#059669")
            .text(`Score: ${data.averageScore.toFixed(2)}%`, 0, 320, {
              align: "center",
            });
        }

        // === NGÀY CẤP ===
        const formattedDate = new Date(data.issuedAt).toLocaleDateString(
          "vi-VN",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        );

        doc
          .fontSize(14)
          .font("Helvetica")
          .fillColor("#666666")
          .text(`Issued on ${formattedDate}`, 0, 360, { align: "center" });

        // === MÃ CHỨNG CHỈ ===
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .fillColor("#1a1a1a")
          .text(`Certificate Code: ${data.certificateCode}`, 0, 400, {
            align: "center",
          });

        // === QR CODE ===
        // Chuyển base64 data URL thành buffer
        const base64Data = qrCodeDataUrl.replace(
          /^data:image\/png;base64,/,
          "",
        );
        const qrBuffer = Buffer.from(base64Data, "base64");

        doc.image(qrBuffer, (doc.page.width - 120) / 2, 430, {
          width: 120,
          height: 120,
        });

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#999999")
          .text("Scan to verify", 0, 560, { align: "center" });

        // === FOOTER ===
        doc
          .fontSize(10)
          .fillColor("#cccccc")
          .text("Hutech Education Platform", 0, doc.page.height - 40, {
            align: "center",
          });

        // === BORDER DECORATION ===
        doc
          .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
          .lineWidth(2)
          .strokeColor("#2563eb")
          .stroke();

        doc
          .rect(35, 35, doc.page.width - 70, doc.page.height - 70)
          .lineWidth(1)
          .strokeColor("#93c5fd")
          .stroke();

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Upload PDF lên Cloudinary
   */
  static async uploadPDFToCloudinary(
    pdfBuffer: Buffer,
    certificateCode: string,
  ): Promise<string> {
    try {
      // Tạo file tạm
      const tempFilePath = path.join(
        __dirname,
        `../../temp_${certificateCode}.pdf`,
      );
      fs.writeFileSync(tempFilePath, pdfBuffer);

      // Upload lên Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: "certificates/pdfs",
        public_id: `cert_${certificateCode}`,
        resource_type: "raw",
        overwrite: true,
      });

      // Xóa file tạm
      fs.unlinkSync(tempFilePath);

      return result.secure_url;
    } catch (error) {
      console.error("Error uploading PDF to Cloudinary:", error);
      throw new Error("Failed to upload PDF");
    }
  }

  /**
   * Sinh mã certificate code unique
   */
  static generateCertificateCode(courseName: string): string {
    // Lấy 3-4 ký tự đầu của course name (viết hoa)
    const coursePrefix = courseName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 4);

    // Lấy năm hiện tại
    const year = new Date().getFullYear();

    // Sinh số ngẫu nhiên 6 chữ số
    const randomNum = Math.floor(100000 + Math.random() * 900000);

    return `CERT-${coursePrefix}-${year}-${randomNum}`;
  }

  /**
   * Legacy method - Tạo Certificate PDF tự động (giống mẫu Cisco)
   * @deprecated Use generateModernCertificatePDF instead
   */
  static async generateCertificatePDF(
    userId: string,
    courseId: string,
    data: CertificateData,
  ): Promise<string> {
    try {
      // Tạo folder certificates nếu chưa có
      const certificatesDir = path.join(__dirname, "../../public/certificates");
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }

      // Tên file PDF
      const fileName = `certificate_${userId}_${courseId}_${Date.now()}.pdf`;
      const filePath = path.join(certificatesDir, fileName);

      // Tạo PDF
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ===== DESIGN CERTIFICATE (Giống Cisco) =====

      // Background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f0f4f8");

      // Outer border (blue)
      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .stroke("#2563eb");

      // Inner border (light blue)
      doc
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .lineWidth(1)
        .stroke("#60a5fa");

      // Title
      doc
        .fontSize(28)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("CERTIFICATE OF COMPLETION", 0, 100, {
          align: "center",
        });

      // Subtitle
      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#64748b")
        .text("This is to certify that", 0, 150, {
          align: "center",
        });

      // User Name (lớn, đậm)
      doc
        .fontSize(36)
        .font("Helvetica-Bold")
        .fillColor("#0f172a")
        .text(data.userName, 0, 190, {
          align: "center",
        });

      // Description
      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#64748b")
        .text("has successfully completed the course", 0, 250, {
          align: "center",
        });

      // Course Name (lớn, màu xanh)
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor("#2563eb")
        .text(data.courseName, 0, 290, {
          align: "center",
        });

      // Level & Score
      doc
        .fontSize(16)
        .font("Helvetica")
        .fillColor("#475569")
        .text(
          `Level: ${data.level} - ${data.subLevel} | Score: ${data.totalScore.toFixed(1)}%`,
          0,
          340,
          {
            align: "center",
          },
        );

      // Date
      const formattedDate = data.issuedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#64748b")
        .text(`Issued on: ${formattedDate}`, 0, 400, {
          align: "center",
        });

      // Certificate ID (unique)
      const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}`;
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text(`Certificate ID: ${certificateId}`, 0, 480, {
          align: "center",
        });

      // Signature line (left) - Instructor
      doc.moveTo(150, 450).lineTo(300, 450).stroke("#cbd5e1");
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#64748b")
        .text("Instructor Signature", 150, 460, {
          width: 150,
          align: "center",
        });

      // Signature line (right) - Director
      doc
        .moveTo(doc.page.width - 300, 450)
        .lineTo(doc.page.width - 150, 450)
        .stroke("#cbd5e1");
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#64748b")
        .text("Director Signature", doc.page.width - 300, 460, {
          width: 150,
          align: "center",
        });

      // Footer
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text(
          "This certificate is issued by Hutech-Edu Platform | https://hutech-edu.com",
          0,
          doc.page.height - 40,
          {
            align: "center",
          },
        );

      // Finalize PDF
      doc.end();

      // Wait for file to be written
      await new Promise<void>((resolve, reject) => {
        stream.on("finish", () => resolve());
        stream.on("error", reject);
      });

      // Return public URL
      const certificateURL = `/certificates/${fileName}`;
      console.log(`📜 Certificate PDF created: ${certificateURL}`);

      return certificateURL;
    } catch (error) {
      console.error("Error generating certificate PDF:", error);
      throw error;
    }
  }
}
