const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const College = require('../models/College');
const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const Company = require('../models/Company');
const Course = require('../models/Course');
const Setting = require('../models/Setting');
const User = require('../models/User');
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
const generateStudentCertificate = async (studentId, options = {}, existingBrowser = null, existingPage = null, cachedContext = null) => {
  const { templateId, regenerate = false } = options;

  // 1. Fetch Student (use preloaded object if provided)
  const student = options.student || await Student.findById(studentId).populate('collegeId');
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found.`);
  }

  // 2. Check existing certificate
  let existingCert = (cachedContext && cachedContext.certsMap)
    ? cachedContext.certsMap.get(String(student._id))
    : await Certificate.findOne({ studentId: student._id });

  if (existingCert && existingCert.status === 'GENERATED' && !regenerate) {
    return {
      certificate: existingCert,
      alreadyGenerated: true,
      message: 'Certificate already generated for this student.'
    };
  }

  // Helper for flexible company matching
  const findMatchingCompany = async (compName) => {
    if (!compName) return null;
    if (cachedContext && cachedContext.findMatchingCompany) {
      return cachedContext.findMatchingCompany(compName);
    }
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

  // 3. Fetch related records (from cache if available)
  let template = templateId
    ? ((cachedContext && cachedContext.templatesMap) ? cachedContext.templatesMap.get(String(templateId)) : await CertificateTemplate.findById(templateId))
    : (cachedContext ? cachedContext.activeTemplate : await CertificateTemplate.findOne({ isActive: true }));

  const company = await findMatchingCompany(student.company);
  const course = (cachedContext && cachedContext.findCourse)
    ? cachedContext.findCourse(student.course)
    : await Course.findOne({ name: new RegExp(`^${(student.course || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });

  // 4. Determine Certificate ID
  let certificateId = options.assignedCertificateId || (existingCert && existingCert.certificateId ? existingCert.certificateId : await generateNextCertificateId());

  // 5. Build certificate data object
  const certData = buildCertificateData(student, student.collegeId, company, course, certificateId);

  // Fetch TNSkill Master Logo & SM Logo
  const defaultFixedTnSkillLogo = path.join(__dirname, '../certificates/assets/tnskill_logo.png');
  certData.tnSkillLogoPath = defaultFixedTnSkillLogo;
  const defaultFixedSmLogo = path.join(__dirname, '../certificates/assets/sm_groups_logo.png');
  certData.smLogoPath = defaultFixedSmLogo;

  if (cachedContext) {
    if (cachedContext.tnSkillLogoPath) certData.tnSkillLogoPath = cachedContext.tnSkillLogoPath;
    if (cachedContext.smLogoPath) certData.smLogoPath = cachedContext.smLogoPath;
  } else {
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
  }

  // Company logo & background
  if (company && company.logoPath) certData.subLogoPath = company.logoPath;
  if (company && company.bgImagePath) certData.bgImagePath = company.bgImagePath;

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
    const page = existingPage || (await browser.newPage());
    if (!existingPage) {
      await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });
    }
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 60));

    // Generate High-Quality A4 Landscape PDF
    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    let base64Preview = '';
    // Only capture heavy Base64 screenshot when not running bulk batch to save RAM & 10x speedup
    if (!options.skipPreviewScreenshot) {
      const previewBuffer = await page.screenshot({
        type: 'jpeg',
        quality: 80
      });
      base64Preview = `data:image/jpeg;base64,${previewBuffer.toString('base64')}`;
      try {
        fs.writeFileSync(pngFilePath, previewBuffer);
      } catch (e) {}
    }

    if (!existingPage) {
      await page.close();
    }

    if (closeBrowserOnFinish && browser) {
      await browser.close();
    }

    // 8. Quality check
    if (!fs.existsSync(pdfFilePath) || fs.statSync(pdfFilePath).size === 0) {
      throw new Error('Generated PDF file validation failed: file is missing or zero bytes');
    }

    const relativePdfPath = path.join('certificates', pdfFilename).replace(/\\/g, '/');

    // 9. Update or Create MongoDB record
    if (!existingCert) {
      existingCert = new Certificate({
        certificateId,
        studentId: student._id,
        templateId: template ? template._id : null,
        companyId: company ? company._id : null,
        courseId: course ? course._id : null,
        filePath: relativePdfPath,
        previewImagePath: base64Preview || undefined,
        status: 'GENERATED',
        generatedAt: new Date()
      });
    } else {
      existingCert.certificateId = certificateId;
      existingCert.filePath = relativePdfPath;
      if (base64Preview) existingCert.previewImagePath = base64Preview;
      existingCert.status = 'GENERATED';
      existingCert.errorMessage = '';
      existingCert.generatedAt = new Date();
    }

    await existingCert.save();

    return {
      certificate: existingCert,
      alreadyGenerated: false,
      message: 'Professional HTML/CSS certificate generated successfully.'
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
 * Bulk generate individual certificates for filtered students (Ultra-Fast 3-Worker Parallel Engine)
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

  const students = await Student.find(query).populate('collegeId');

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
    currentStudent: 'Initializing high-speed parallel generation engine...',
    company: filter.company || 'All',
    percent: 0,
    successCount: 0,
    skippedCount: 0,
    failedCount: 0
  };

  // Pre-load all database context in parallel (0 DB calls inside loop)
  const currentYear = new Date().getFullYear();
  const prefix = `SMG-${currentYear}-`;

  const [allCompanies, activeTemplate, allCourses, allSettings, existingCerts, lastCert] = await Promise.all([
    Company.find().lean(),
    options.templateId ? CertificateTemplate.findById(options.templateId).lean() : CertificateTemplate.findOne({ isActive: true }).lean(),
    Course.find().lean(),
    Setting.find({ key: { $in: ['tnskill_logo', 'sm_groups_logo'] } }).lean(),
    Certificate.find({ studentId: { $in: students.map(s => s._id) } }).lean(),
    Certificate.findOne({ certificateId: new RegExp(`^${prefix}`) }).sort({ certificateId: -1 }).lean()
  ]);

  const certsMap = new Map();
  existingCerts.forEach(c => certsMap.set(String(c.studentId), c));

  const cleanMap = new Map();
  allCompanies.forEach(c => {
    const clean = (c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    cleanMap.set(clean, c);
  });
  const findMatchingCompany = (compName) => {
    if (!compName) return null;
    const target = String(compName).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanMap.has(target)) return cleanMap.get(target);
    for (const [k, v] of cleanMap.entries()) {
      if (k.includes(target) || target.includes(k)) return v;
    }
    return allCompanies[0] || null;
  };

  const courseMap = new Map();
  allCourses.forEach(c => courseMap.set((c.name || '').toLowerCase().trim(), c));
  const findCourse = (courseName) => {
    if (!courseName) return null;
    return courseMap.get(String(courseName).toLowerCase().trim()) || null;
  };

  const tnSkillSetting = allSettings.find(s => s.key === 'tnskill_logo');
  const smLogoSetting = allSettings.find(s => s.key === 'sm_groups_logo');

  let nextSeq = 1;
  if (lastCert && lastCert.certificateId) {
    const parts = lastCert.certificateId.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) nextSeq = parsed + 1;
    }
  }

  const cachedContext = {
    certsMap,
    activeTemplate,
    findMatchingCompany,
    findCourse,
    tnSkillLogoPath: tnSkillSetting?.value,
    smLogoPath: smLogoSetting?.value
  };

  // Launch browser ONCE for the entire batch with ultra-lightweight flags
  const executablePath = getBrowserExecutablePath();
  const batchBrowser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--js-flags="--max-old-space-size=256"'
    ]
  });

  const CONCURRENCY = 3;
  let pages = [];

  try {
    pages = await Promise.all(
      Array.from({ length: CONCURRENCY }, () =>
        batchBrowser.newPage().then(async p => {
          await p.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });
          return p;
        })
      )
    );

    let currentIndex = 0;
    let completedCount = 0;

    const worker = async (workerPage, workerId) => {
      while (currentIndex < students.length) {
        const studentIndex = currentIndex++;
        const student = students[studentIndex];
        const assignedCertId = `${prefix}${String(nextSeq++).padStart(6, '0')}`;

        try {
          const res = await generateStudentCertificate(
            student._id,
            { ...options, skipPreviewScreenshot: true, student, assignedCertificateId: assignedCertId },
            batchBrowser,
            workerPage,
            cachedContext
          );
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

        completedCount++;
        bulkProgress.current = completedCount;
        bulkProgress.currentStudent = student.name;
        bulkProgress.percent = Math.round((completedCount / students.length) * 100);
        bulkProgress.successCount = successCount;
        bulkProgress.skippedCount = skippedCount;
        bulkProgress.failedCount = failedCount;
      }
    };

    // Run 3 workers in parallel
    await Promise.all(pages.map((p, idx) => worker(p, idx)));
  } finally {
    for (const p of pages) {
      try { await p.close(); } catch (e) {}
    }
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
      try { await batchBrowser.close(); } catch (e) {}
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

// Stream all certificates of a college as a single ZIP archive
const streamCollegeCertificatesZip = async (collegeId, res, options = {}) => {
  const archiver = require('archiver');
  const { department } = options;

  const college = await College.findById(collegeId);
  if (!college) {
    return res.status(404).json({ success: false, message: 'College not found' });
  }

  const studentQuery = { collegeId: college._id };
  if (department) {
    studentQuery.department = department;
  }

  const students = await Student.find(studentQuery).populate('collegeId').sort({ name: 1 });
  if (!students || students.length === 0) {
    return res.status(400).json({ success: false, message: 'No students enrolled in this college.' });
  }

  const cleanCollegeName = college.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const zipFilename = department
    ? `${cleanCollegeName}_${department.replace(/[^a-zA-Z0-9_\-]/g, '_')}_Certificates.zip`
    : `${cleanCollegeName}_Certificates.zip`;

  // Pre-load all database context in parallel (0 DB queries during generation)
  const [allCompanies, activeTemplate, allCourses, allSettings, existingCerts] = await Promise.all([
    Company.find().lean(),
    CertificateTemplate.findOne({ isActive: true }).lean(),
    Course.find().lean(),
    Setting.find({ key: { $in: ['tnskill_logo', 'sm_groups_logo'] } }).lean(),
    Certificate.find({ studentId: { $in: students.map(s => s._id) } }).lean()
  ]);

  const certsMap = new Map();
  existingCerts.forEach(c => certsMap.set(String(c.studentId), c));

  const cleanMap = new Map();
  allCompanies.forEach(c => {
    const clean = (c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    cleanMap.set(clean, c);
  });
  const findMatchingCompany = (compName) => {
    if (!compName) return null;
    const target = String(compName).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanMap.has(target)) return cleanMap.get(target);
    for (const [k, v] of cleanMap.entries()) {
      if (k.includes(target) || target.includes(k)) return v;
    }
    return allCompanies[0] || null;
  };

  const courseMap = new Map();
  allCourses.forEach(c => courseMap.set((c.name || '').toLowerCase().trim(), c));
  const findCourse = (courseName) => {
    if (!courseName) return null;
    return courseMap.get(String(courseName).toLowerCase().trim()) || null;
  };

  const tnSkillSetting = allSettings.find(s => s.key === 'tnskill_logo');
  const smLogoSetting = allSettings.find(s => s.key === 'sm_groups_logo');

  const cachedContext = {
    certsMap,
    activeTemplate,
    findMatchingCompany,
    findCourse,
    tnSkillLogoPath: tnSkillSetting?.value,
    smLogoPath: smLogoSetting?.value
  };

  // Identify missing PDF files on disk
  const missingStudents = [];
  for (const student of students) {
    const cert = certsMap.get(String(student._id));
    const filePath = cert && cert.filePath
      ? (path.isAbsolute(cert.filePath) ? cert.filePath : path.join(__dirname, '../../', cert.filePath))
      : null;
    if (!cert || !filePath || !fs.existsSync(filePath)) {
      missingStudents.push(student);
    }
  }

  // If any PDFs are missing from disk, generate using single reusable browser
  if (missingStudents.length > 0) {
    const executablePath = getBrowserExecutablePath();
    const browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });
      for (const student of missingStudents) {
        try {
          const res = await generateStudentCertificate(
            student._id,
            { skipPreviewScreenshot: true, student },
            browser,
            page,
            cachedContext
          );
          if (res && res.certificate) {
            certsMap.set(String(student._id), res.certificate);
          }
        } catch (e) {
          console.error(`[ZIP Generator] Error rendering for ${student.name}:`, e.message);
        }
      }
    } finally {
      await browser.close();
    }
  }

  // Stream ZIP archive to response
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

  const archive = archiver('zip', {
    zlib: { level: 6 }
  });

  archive.on('error', (err) => {
    console.error('Archiver error:', err);
  });

  archive.pipe(res);

  for (const student of students) {
    const cert = certsMap.get(String(student._id));
    const filePath = cert && cert.filePath
      ? (path.isAbsolute(cert.filePath) ? cert.filePath : path.join(__dirname, '../../', cert.filePath))
      : null;

    if (filePath && fs.existsSync(filePath)) {
      const sanitizedStudentName = student.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const regOrId = (student.studentId || '').replace(/[^a-zA-Z0-9_\-]/g, '_') || String(student._id);
      const entryName = `${sanitizedStudentName}_${regOrId}_Certificate.pdf`;
      archive.file(filePath, { name: entryName });
    }
  }

  await archive.finalize();
};

module.exports = {
  generateStudentCertificate,
  generateBulkCertificates,
  getBulkProgress,
  streamCollegeCertificatesZip
};

