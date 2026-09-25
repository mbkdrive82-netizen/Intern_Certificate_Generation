const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { buildCertificateData, renderCertificateHtml } = require('../certificates/templates/certificateTemplate');

const getBrowserExecutablePath = () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
  }
  try {
    return puppeteer.executablePath();
  } catch (e) {
    return undefined;
  }
};

async function main() {
  console.log('Generating sample certificate with From Date and End Date...');

  const sampleStudent = {
    name: 'ARUN KUMAR R',
    studentId: 'TNS-2026-00001',
    collegeId: { name: 'AVS Engineering College' },
    department: 'ECE',
    year: 'IV',
    company: 'SRI TECH',
    course: 'IoT Application (ESP32)',
    fromDate: '01.06.2026',
    endDate: '15.06.2026'
  };

  const sampleCollege = { name: 'AVS Engineering College' };
  const sampleCompany = { name: 'SRI TECH', templateStyle: 'sritech' };
  const sampleCourse = { name: 'IoT Application (ESP32)' };
  const certificateId = 'TNS-2026-00001';

  const data = buildCertificateData(sampleStudent, sampleCollege, sampleCompany, sampleCourse, certificateId);
  const html = renderCertificateHtml(data);

  const executablePath = getBrowserExecutablePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: ['load', 'networkidle0'], timeout: 30000 });

  const rootPngPath = path.join(__dirname, '../../../sample_certificate_preview.png');
  const rootPdfPath = path.join(__dirname, '../../../sample_certificate.pdf');
  const artifactDir = path.join('C:/Users/Lenovo/.gemini/antigravity-ide/brain/546251be-6ea7-4da5-92cf-31c024917b05');
  const artifactPngPath = path.join(artifactDir, 'sample_certificate_preview.png');

  // Screenshot PNG
  await page.screenshot({ path: rootPngPath, type: 'png', fullPage: true });
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(rootPngPath, artifactPngPath);
  }

  // PDF
  await page.pdf({
    path: rootPdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  console.log(`Sample PNG generated: ${rootPngPath}`);
  console.log(`Sample PDF generated: ${rootPdfPath}`);
}

main().catch(console.error);
