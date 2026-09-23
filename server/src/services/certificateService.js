const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const Company = require('../models/Company');
const Course = require('../models/Course');
const { buildCertificateData, renderCertificateHtml } = require('../certificates/templates/certificateTemplate');

const certDir = path.join(__dirname, '../../certificates');
const previewDir = path.join(__dirname, '../../certificates/previews');

if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

// Locate browser executable (Chrome on Windows or dynamic search on Linux/Render)
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
  } else {
    // Linux / Render environment: search common cache locations
    const searchDirs = [
      path.join(__dirname, '../../.cache/puppeteer'),
      '/opt/render/.cache/puppeteer',
      '/root/.cache/puppeteer',
      path.join(process.cwd(), '.cache/puppeteer')
    ];

    const findChromeBinary = (dir) => {
      try {
        if (!fs.existsSync(dir)) return null;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const found = findChromeBinary(full);
            if (found) return found;
          } else if (entry.name === 'chrome' || entry.name === 'chromium') {
            return full;
          }
        }
      } catch (e) {}
      return null;
    };

    for (const base of searchDirs) {
      const found = findChromeBinary(base);
      if (found) {
        console.log(`[Puppeteer]: Found Chrome binary at: ${found}`);
        return found;
      }
    }
  }

  try {
    return puppeteer.executablePath();
  } catch (e) {
    return undefined;
  }
};

// Generate unique Certificate ID: SMG-2026-000001
const generateNextCertificateId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `SMG-${currentYear}-`;

  const lastCert = await Certificate.findOne({ certificateId: new RegExp(`^${prefix}`) })
    .sort({ certificateId: -1 })
    .exec();

  let nextSeq = 1;
  if (lastCert && lastCert.certificateId) {
    const parts = lastCert.certificateId.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) nextSeq = parsed + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
};

/**
 * Programmatically generate high-quality HTML/CSS/SVG Certificate PDF & PNG via Puppeteer
 */
const generateStudentCertificate = async (studentId, options = {}, existingBrowser = null) => {
  const { templateId, regenerate = false } = options;

  // 1. Fetch Student
  const student = await Student.findById(studentId).populate('collegeId');
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found.`);
  }

  // 2. Check existing certificate
  let existingCert = await Certificate.findOne({ studentId: student._id });
  if (existingCert && existingCert.status === 'GENERATED' && !regenerate) {
    return {
      certificate: existingCert,
      alreadyGenerated: true,
      message: 'Certificate already generated for this student.'
    };
  }

  // Helper for flexible company matching (handles "SRI TECH" <=> "SRITECH", case/spaces)
  const findMatchingCompany = async (compName) => {
    if (!compName) return null;
    const trimmed = String(compName).trim();
    let comp = await Company.findOne({ name: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (comp) return comp;

    const all = await Company.find();
    const cleanTarget = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
    comp = all.find(c => {
      const cleanName = (c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanName === cleanTarget || cleanName.includes(cleanTarget) || cleanTarget.includes(cleanName);
    });
    if (comp) return comp;
    if (all.length === 1) return all[0];
    return null;
  };

  // 3. Fetch related records
  let template = templateId ? await CertificateTemplate.findById(templateId) : await CertificateTemplate.findOne({ isActive: true });
  const company = await findMatchingCompany(student.company);
  const course = await Course.findOne({ name: new RegExp(`^${student.course.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });

  // 4. Determine Certificate ID
  let certificateId = existingCert && existingCert.certificateId ? existingCert.certificateId : await generateNextCertificateId();

  // 5. Build certificate data object
  const certData = buildCertificateData(student, student.collegeId, company, course, certificateId);

  // Fetch TNSkill Master Logo: common for all certificates top center
  const defaultFixedTnSkillLogo = path.join(__dirname, '../certificates/assets/tnskill_logo.png');
  certData.tnSkillLogoPath = defaultFixedTnSkillLogo;

  // Fetch SM GROUPS logo: default to permanent fixed logo, or setting if present
  const defaultFixedSmLogo = path.join(__dirname, '../certificates/assets/sm_groups_logo.png');
  certData.smLogoPath = defaultFixedSmLogo;

  const Setting = require('../models/Setting');
  const tnSkillSetting = await Setting.findOne({ key: 'tnskill_logo' });
  if (tnSkillSetting && tnSkillSetting.value && fs.existsSync(tnSkillSetting.value)) {
    certData.tnSkillLogoPath = tnSkillSetting.value;
  }

  const smLogoSetting = await Setting.findOne({ key: 'sm_groups_logo' });
  if (smLogoSetting && smLogoSetting.value && fs.existsSync(smLogoSetting.value)) {
    certData.smLogoPath = smLogoSetting.value;
  } else if (template && template.smLogoPath && fs.existsSync(template.smLogoPath)) {
    certData.smLogoPath = template.smLogoPath;
  }

  // Company logo (sub-company logo on top left)
  if (company && company.logoPath) {
    certData.subLogoPath = company.logoPath;
  }

  // Company custom background image (if uploaded for this sub-company)
  if (company && company.bgImagePath) {
    certData.bgImagePath = company.bgImagePath;
  }

  // 6. Render HTML
  const htmlContent = renderCertificateHtml(certData);

  // 7. Launch or Reuse Puppeteer Browser
  let browser = existingBrowser;
  let closeBrowserOnFinish = false;

  if (!browser) {
    const executablePath = getBrowserExecutablePath();
    browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    closeBrowserOnFinish = true;
  }

  const sanitizedName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
  const pdfFilename = `${sanitizedName}_Certificate_${certificateId}.pdf`;
  const pngFilename = `${sanitizedName}_Preview_${certificateId}.png`;

  const pdfFilePath = path.join(certDir, pdfFilename);
  const pngFilePath = path.join(previewDir, pngFilename);

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 800));

    // Generate High-Quality A4 Landscape PDF
    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    // Generate Real High-Resolution PNG Preview
    await page.screenshot({
      path: pngFilePath,
      type: 'png',
      fullPage: false
    });

    await page.close();

    if (closeBrowserOnFinish && browser) {
      await browser.close();
    }

    // 8. Quality check (Section 88 & 95)
    if (!fs.existsSync(pdfFilePath) || fs.statSync(pdfFilePath).size === 0) {
      throw new Error('Generated PDF file validation failed: file is missing or zero bytes');
    }

    const relativePdfPath = path.join('certificates', pdfFilename).replace(/\\/g, '/');
    const relativePngPath = path.join('certificates', 'previews', pngFilename).replace(/\\/g, '/');

    // 9. Update or Create MongoDB record
    if (!existingCert) {
      existingCert = new Certificate({
        certificateId,
        studentId: student._id,
        templateId: template ? template._id : null,
        companyId: company ? company._id : null,
        courseId: course ? course._id : null,
        filePath: relativePdfPath,
        previewImagePath: relativePngPath,
        status: 'GENERATED',
        generatedAt: new Date()
      });
    } else {
      existingCert.certificateId = certificateId;
      existingCert.filePath = relativePdfPath;
      existingCert.previewImagePath = relativePngPath;
      existingCert.status = 'GENERATED';
      existingCert.errorMessage = '';
      existingCert.generatedAt = new Date();
    }

    await existingCert.save();

    return {
      certificate: existingCert,
      alreadyGenerated: false,
      message: 'Professional HTML/CSS certificate generated successfully via Puppeteer.'
    };
  } catch (err) {
    if (closeBrowserOnFinish && browser) await browser.close();

    if (existingCert) {
      existingCert.status = 'FAILED';
      existingCert.errorMessage = err.message;
      await existingCert.save();
    }
    throw err;
  }
};

let bulkProgress = {
  inProgress: false,
  current: 0,
  total: 0,
  currentStudent: '',
  company: '',
  percent: 0,
  successCount: 0,
  skippedCount: 0,
  failedCount: 0
};

const getBulkProgress = () => {
  return { ...bulkProgress };
};

/**
 * Bulk generate individual certificates for filtered students (Fast Single-Browser Engine)
 */
const generateBulkCertificates = async (filter = {}, options = {}) => {
  const query = {};
  if (filter.collegeId) query.collegeId = filter.collegeId;
  if (filter.department) query.department = filter.department;
  if (filter.year) query.year = filter.year;
  if (filter.company) {
    const cleanComp = filter.company.trim().replace(/\s+/g, '\\s*');
    query.company = new RegExp(`^${cleanComp}$`, 'i');
  }
  if (filter.course) query.course = new RegExp(`^${filter.course.trim()}$`, 'i');

  const students = await Student.find(query);

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errors = [];

  if (students.length === 0) {
    bulkProgress = {
      inProgress: false,
      current: 0,
      total: 0,
      currentStudent: '',
      company: filter.company || 'All',
      percent: 100,
      successCount: 0,
      skippedCount: 0,
      failedCount: 0
    };
    return {
      totalTargeted: 0,
      successCount: 0,
      skippedCount: 0,
      failedCount: 0,
      errors: []
    };
  }

  bulkProgress = {
    inProgress: true,
    current: 0,
    total: students.length,
    currentStudent: 'Initializing generation engine...',
    company: filter.company || 'All',
    percent: 0,
    successCount: 0,
    skippedCount: 0,
    failedCount: 0
  };

  // Launch browser ONCE for the entire batch for maximum performance
  const executablePath = getBrowserExecutablePath();
  const batchBrowser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  try {
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      bulkProgress.current = i + 1;
      bulkProgress.currentStudent = student.name;
      bulkProgress.percent = Math.round(((i + 1) / students.length) * 100);

      try {
        const res = await generateStudentCertificate(student._id, options, batchBrowser);
        if (res.alreadyGenerated) {
          skippedCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        failedCount++;
        errors.push({
          studentId: student.studentId,
          studentName: student.name,
          error: err.message
        });
      }

      bulkProgress.successCount = successCount;
      bulkProgress.skippedCount = skippedCount;
      bulkProgress.failedCount = failedCount;
    }
  } finally {
    bulkProgress.inProgress = false;
    bulkProgress.lastResult = {
      totalTargeted: students.length,
      successCount,
      skippedCount,
      failedCount,
      errors
    };
    bulkProgress.finishedAt = new Date();
    if (batchBrowser) {
      await batchBrowser.close();
    }
  }

  return {
    totalTargeted: students.length,
    successCount,
    skippedCount,
    failedCount,
    errors
  };
};

module.exports = {
  generateStudentCertificate,
  generateBulkCertificates,
  getBulkProgress
};
