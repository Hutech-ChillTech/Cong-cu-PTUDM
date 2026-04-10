import { Request, Response, NextFunction } from "express";
import { CertificateService } from "../services/certificate.service";
import { sendSuccess, sendError } from "../utils/responseHelper";
import prisma from "../configs/prismaClient";
import { PuppeteerPDFService } from "../utils/puppeteerPDF.service";
import { PDFGenerator } from "../utils/pdfGenerator";

export class CertificateRegenerationController {
  /**
   * Re-generate PDF for existing certificate
   * POST /api/certificates/regenerate/:certificateId
   * Admin only
   */
  regenerateCertificatePDF = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { certificateId } = req.params;

      // Get certificate from database
      const certificate = await prisma.certificate.findUnique({
        where: { certificateId },
        include: {
          user: { select: { userName: true } },
          course: { select: { courseName: true } }
        }
      });

      if (!certificate) {
        return sendError(res, "Certificate not found", 404);
      }

      console.log(`🔄 Re-generating PDF for certificate: ${certificate.certificateCode}`);

      // Generate PDF with Puppeteer
      const pdfBuffer = await PuppeteerPDFService.generateCertificatePDF({
        userName: certificate.userName,
        courseName: certificate.courseName,
        certificateCode: certificate.certificateCode,
        issuedAt: certificate.issuedAt,
        averageScore: certificate.averageScore || undefined,
        companyName: "HUTECH EDUCATION",
        companySubtitle: "Online Learning Platform"
      });

      console.log(`✅ PDF generated, uploading to Cloudinary...`);

      // Upload to Cloudinary
      const pdfUrl = await PDFGenerator.uploadPDFToCloudinary(
        pdfBuffer,
        certificate.certificateCode
      );

      // Generate and upload QR Code
      const qrCodeDataUrl = await PDFGenerator.generateQRCode(certificate.certificateCode);
      const qrCodeUrl = await PDFGenerator.uploadQRCodeToCloudinary(
        qrCodeDataUrl,
        certificate.certificateCode
      );

      // Update certificate record
      const updatedCertificate = await prisma.certificate.update({
        where: { certificateId },
        data: {
          pdfUrl,
          qrCodeUrl,
          certificateURL: pdfUrl
        }
      });

      console.log(`🎓 Certificate PDF regenerated successfully!`, {
        certificateCode: certificate.certificateCode,
        pdfUrl,
        qrCodeUrl
      });

      return sendSuccess(
        res,
        {
          certificateId: updatedCertificate.certificateId,
          certificateCode: updatedCertificate.certificateCode,
          pdfUrl: updatedCertificate.pdfUrl,
          qrCodeUrl: updatedCertificate.qrCodeUrl
        },
        "Certificate PDF regenerated successfully"
      );
    } catch (error) {
      console.error("❌ Error regenerating certificate PDF:", error);
      next(error);
    }
  };

  /**
   * Re-generate ALL certificates without PDF
   * POST /api/certificates/regenerate-all
   * Admin only
   */
  regenerateAllMissingPDFs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Find all certificates without pdfUrl
      const certificates = await prisma.certificate.findMany({
        where: {
          OR: [
            { pdfUrl: null },
            { pdfUrl: "" }
          ]
        },
        include: {
          user: { select: { userName: true } },
          course: { select: { courseName: true } }
        }
      });

      console.log(`🔄 Found ${certificates.length} certificates without PDF`);

      const results = [];

      for (const certificate of certificates) {
        try {
          console.log(`🎨 Generating PDF for: ${certificate.certificateCode}`);

          // Generate PDF
          const pdfBuffer = await PuppeteerPDFService.generateCertificatePDF({
            userName: certificate.userName,
            courseName: certificate.courseName,
            certificateCode: certificate.certificateCode,
            issuedAt: certificate.issuedAt,
            averageScore: certificate.averageScore || undefined,
            companyName: "HUTECH EDUCATION",
            companySubtitle: "Online Learning Platform"
          });

          // Upload to Cloudinary
          const pdfUrl = await PDFGenerator.uploadPDFToCloudinary(
            pdfBuffer,
            certificate.certificateCode
          );

          // Generate and upload QR Code
          const qrCodeDataUrl = await PDFGenerator.generateQRCode(certificate.certificateCode);
          const qrCodeUrl = await PDFGenerator.uploadQRCodeToCloudinary(
            qrCodeDataUrl,
            certificate.certificateCode
          );

          // Update certificate
          await prisma.certificate.update({
            where: { certificateId: certificate.certificateId },
            data: { pdfUrl, qrCodeUrl, certificateURL: pdfUrl }
          });

          results.push({
            certificateId: certificate.certificateId,
            certificateCode: certificate.certificateCode,
            status: "success",
            pdfUrl
          });

          console.log(`✅ Success: ${certificate.certificateCode}`);
        } catch (error) {
          console.error(`❌ Failed: ${certificate.certificateCode}`, error);
          results.push({
            certificateId: certificate.certificateId,
            certificateCode: certificate.certificateCode,
            status: "failed",
            error: (error as Error).message
          });
        }
      }

      return sendSuccess(
        res,
        {
          total: certificates.length,
          success: results.filter(r => r.status === "success").length,
          failed: results.filter(r => r.status === "failed").length,
          results
        },
        `Regenerated ${results.filter(r => r.status === "success").length}/${certificates.length} certificates`
      );
    } catch (error) {
      console.error("❌ Error regenerating certificates:", error);
      next(error);
    }
  };
}
