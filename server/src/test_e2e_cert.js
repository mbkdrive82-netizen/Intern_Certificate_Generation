const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { buildCertificateData, renderCertificateHtml } = require('./certificates/templates/certificateTemplate');

(async () => {
  console.log('🚀 Generating certificate test with TNSkill top-center logo...');
  const mockStudent = {
    name: 'Navaneetha Krishnan R',
    studentId: 'TNS-2026-00008',
    department: 'ECE',
    year: 'IV',
    company: 'SRITECH',
    course: 'IoT Application (ESP32)',
    collegeId: { name: 'AVS Engineering College' }
  };

  const certData = buildCertificateData(
    mockStudent,
    mockStudent.collegeId,
    { name: 'SRITECH', logoPath: 'uploads/logo-1790059069806-396359613.png' },
    { name: 'IoT Application (ESP32)' },
    'SMG-2026-000060'
  );

  const defaultFixedTnSkillLogo = path.join(__dirname, 'certificates/assets/tnskill_logo.png');
  const defaultFixedSmLogo = path.join(__dirname, 'certificates/assets/sm_groups_logo.png');
  certData.tnSkillLogoPath = defaultFixedTnSkillLogo;
  certData.smLogoPath = defaultFixedSmLogo;

  const html = renderCertificateHtml(certData);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Brief wait for layout to settle
  await new Promise(r => setTimeout(r, 2000));

  const previewPath = path.join(__dirname, '../certificates/previews/Aadhira_V_Preview_SMG-2026-000051.png');
  await page.screenshot({ path: previewPath, type: 'png' });
  console.log('✅ Successfully rendered certificate preview with TNSkill top-center logo at:');
  console.log(previewPath);

  await browser.close();
})();
