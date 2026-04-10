import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export interface PuppeteerCertificateData {
  userName: string;
  courseName: string;
  certificateCode: string;
  issuedAt: Date;
  averageScore?: number;
  companyName?: string;
  companySubtitle?: string;
}

export class PuppeteerPDFService {
  private static templatePath = path.join(__dirname, '../templates/certificate.template.html');

  /**
   * Generate QR Code as base64 data URL
   */
  private static async generateQRCode(certificateCode: string): Promise<string> {
    try {
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certificateCode}`;
      return await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  }

  /**
   * Replace template placeholders with actual data
   */
  private static async prepareHTML(data: PuppeteerCertificateData): Promise<string> {
    // Read template
    let html = fs.readFileSync(this.templatePath, 'utf-8');

    // Generate QR Code
    const qrCode = await this.generateQRCode(data.certificateCode);

    // Format date
    const formattedDate = new Date(data.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Replace placeholders
    const replacements: Record<string, string> = {
      '{{COMPANY_NAME}}': data.companyName || 'HUTECH EDUCATION',
      '{{COMPANY_SUBTITLE}}': data.companySubtitle || 'Online Learning Platform',
      '{{USER_NAME}}': data.userName,
      '{{COURSE_NAME}}': data.courseName,
      '{{CERTIFICATE_CODE}}': data.certificateCode,
      '{{ISSUE_DATE}}': formattedDate,
      '{{YEAR}}': new Date(data.issuedAt).getFullYear().toString(),
      '{{QR_CODE}}': qrCode,
      '{{SCORE}}': data.averageScore ? data.averageScore.toFixed(2) : ''
    };

    // Replace all placeholders
    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replace(new RegExp(key, 'g'), value);
    });

    // Handle conditional rendering
    if (data.averageScore) {
      html = html.replace(/{{#if SCORE}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if SCORE}}[\s\S]*?{{\/if}}/g, '');
    }

    if (qrCode) {
      html = html.replace(/{{#if QR_CODE}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if QR_CODE}}[\s\S]*?{{\/if}}/g, '');
    }

    return html;
  }

  /**
   * Generate PDF certificate using Puppeteer
   */
  static async generateCertificatePDF(data: PuppeteerCertificateData): Promise<Buffer> {
    let browser;
    
    try {
      // Prepare HTML with data
      const html = await this.prepareHTML(data);

      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      });

      console.log('✅ Certificate PDF generated successfully with Puppeteer');
      
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('❌ Error generating PDF with Puppeteer:', error);
      throw new Error('Failed to generate certificate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate and save PDF to local file (for testing)
   */
  static async generateAndSavePDF(
    data: PuppeteerCertificateData,
    outputPath: string
  ): Promise<void> {
    const pdfBuffer = await this.generateCertificatePDF(data);
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`📄 PDF saved to: ${outputPath}`);
  }
}
