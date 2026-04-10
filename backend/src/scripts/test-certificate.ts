/**
 * Test script for Puppeteer PDF Certificate Generation
 * Run: npx ts-node src/scripts/test-certificate.ts
 */

import { PuppeteerPDFService } from '../utils/puppeteerPDF.service';
import path from 'path';

async function testCertificateGeneration() {
  console.log('🧪 Testing Puppeteer Certificate Generation...\n');

  const testData = {
    userName: 'Nguyễn Văn A',
    courseName: 'Full Stack Web Development with React & Node.js',
    certificateCode: 'CERT-FSWD-2025-123456',
    issuedAt: new Date(),
    averageScore: 95.5,
    companyName: 'HUTECH EDUCATION',
    companySubtitle: 'Online Learning Platform'
  };

  try {
    console.log('📝 Certificate Data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n🚀 Generating PDF...\n');

    const outputPath = path.join(__dirname, '../../public/certificates/test-certificate.pdf');
    
    await PuppeteerPDFService.generateAndSavePDF(testData, outputPath);

    console.log('\n✅ SUCCESS! Certificate generated successfully!');
    console.log(`📄 File saved to: ${outputPath}`);
    console.log('\n💡 You can now open the PDF file to view the certificate.');
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

// Run test
testCertificateGeneration()
  .then(() => {
    console.log('\n✨ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
