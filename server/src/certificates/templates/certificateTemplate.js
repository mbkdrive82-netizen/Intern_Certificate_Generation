const fs = require('fs');
const path = require('path');

const fileCache = new Map();

// Helper to convert local file or Data URI to base64 Data URI for reliable Puppeteer rendering with memory cache
const fileToDataUri = (filePath) => {
  if (!filePath) return '';
  if (typeof filePath === 'string' && filePath.startsWith('data:')) return filePath;
  if (fileCache.has(filePath)) return fileCache.get(filePath);

  let resolvedPath = filePath;
  if (!path.isAbsolute(resolvedPath)) {
    const candidates = [
      path.resolve(resolvedPath),
      path.join(__dirname, '../../../', resolvedPath),
      path.join(__dirname, '../../', resolvedPath),
      path.join(__dirname, '../', resolvedPath),
      path.join(process.cwd(), resolvedPath),
      path.join(process.cwd(), 'server', resolvedPath)
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        resolvedPath = cand;
        break;
      }
    }
  }

  if (!fs.existsSync(resolvedPath)) return '';
  const ext = path.extname(resolvedPath).toLowerCase().replace('.', '');
  const mimeType = ext === 'png' ? 'image/png' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'application/octet-stream';
  const buffer = fs.readFileSync(resolvedPath);
  const uri = `data:${mimeType};base64,${buffer.toString('base64')}`;
  fileCache.set(filePath, uri);
  return uri;
};

let cachedHtmlTemplate = null;
let cachedCssStyles = null;

const getTemplateHtml = () => {
  if (!cachedHtmlTemplate) {
    const htmlPath = path.join(__dirname, 'certificateTemplate.html');
    cachedHtmlTemplate = fs.readFileSync(htmlPath, 'utf8');
  }
  return cachedHtmlTemplate;
};

const getTemplateCss = () => {
  if (!cachedCssStyles) {
    const cssPath = path.join(__dirname, 'certificateTemplate.css');
    cachedCssStyles = fs.readFileSync(cssPath, 'utf8');
  }
  return cachedCssStyles;
};

/**
 * Build certificate data object from models
 * (Satisfies Section 94)
 */
const buildCertificateData = (student, college, company, course, certificateId) => {
  const currentYear = new Date().getFullYear();
  const certDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const academicYear = (student.year && student.year.includes('-'))
    ? student.year
    : `${currentYear - 1}–${currentYear}`;

  const compName = company ? company.name : (student.company || 'SRITECH');
  const compStyle = (company && company.templateStyle) ? company.templateStyle : '';

  let companyTheme = 'theme-sritech';
  if (compStyle === 'sritech' || /sri\s*tech/i.test(compName)) {
    companyTheme = 'theme-sritech';
  } else if (compStyle === 'mbk' || /mbk/i.test(compName)) {
    companyTheme = 'theme-mbk';
  } else if (compStyle === 'venthulir' || /venthulir/i.test(compName)) {
    companyTheme = 'theme-venthulir';
  } else if (compStyle === 'pavech' || /pavech/i.test(compName)) {
    companyTheme = 'theme-pavech';
  } else if (compStyle && compStyle !== 'default') {
    companyTheme = `theme-${compStyle.toLowerCase()}`;
  }

  const issueDateFormatted = student.issueDate ? student.issueDate : certDate;

  return {
    studentName: student.name || 'Student',
    studentId: student.studentId || 'N/A',
    collegeName: college ? college.name : (student.collegeId?.name || 'Affiliated College'),
    department: student.department || 'General',
    year: student.year || 'III',
    academicYear: academicYear,
    companyName: compName,
    courseName: course ? course.name : (student.course || 'Advanced Technical Training'),
    subCompanyName: compName,
    companyTheme: companyTheme,
    certificateId: certificateId,
    certificateDate: issueDateFormatted,
    fromDate: student.fromDate || '',
    endDate: student.endDate || '',
    tnSkillLogoPath: '', // Common TNSkill master logo for top center
    smLogoPath: '', // Provided from template if configured
    subLogoPath: company ? company.logoPath : '',
    bgImagePath: company ? company.bgImagePath : ''
  };
};

/**
 * Render HTML certificate string with embedded CSS and dynamic data
 */
const renderCertificateHtml = (data) => {
  let html = getTemplateHtml();
  const css = getTemplateCss();

  // Fixed TNSkill Logo (Common for all certificates top center)
  const fixedTnSkillLogoPath = path.join(__dirname, '../assets/tnskill_logo.png');
  const actualTnSkillLogoPath = (data.tnSkillLogoPath && fs.existsSync(data.tnSkillLogoPath))
    ? data.tnSkillLogoPath
    : (fs.existsSync(fixedTnSkillLogoPath) ? fixedTnSkillLogoPath : '');

  // Fixed SM GROUPS Logo (Provided by Admin as permanent master logo)
  const fixedSmLogoPath = path.join(__dirname, '../assets/sm_groups_logo.png');
  const actualSmLogoPath = (data.smLogoPath && fs.existsSync(data.smLogoPath))
    ? data.smLogoPath
    : (fs.existsSync(fixedSmLogoPath) ? fixedSmLogoPath : '');

  // Convert logos to base64 Data URIs
  const tnSkillLogoDataUri = actualTnSkillLogoPath ? fileToDataUri(actualTnSkillLogoPath) : '';
  const smLogoDataUri = actualSmLogoPath ? fileToDataUri(actualSmLogoPath) : '';
  const subLogoDataUri = data.subLogoPath ? fileToDataUri(data.subLogoPath) : '';

  // Inject CSS and Theme
  html = html.replace('{{certificate_styles}}', css);
  html = html.replace(/{{company_theme}}/g, data.companyTheme || 'theme-sritech');

  // Replace placeholders
  html = html.replace(/{{student_name}}/g, data.studentName);
  html = html.replace(/{{student_id}}/g, data.studentId);
  html = html.replace(/{{college_name}}/g, data.collegeName);
  html = html.replace(/{{department}}/g, data.department);
  html = html.replace(/{{year}}/g, data.year);
  html = html.replace(/{{company}}/g, data.companyName);
  html = html.replace(/{{course}}/g, data.courseName);
  html = html.replace(/{{sub_company_name}}/g, data.subCompanyName);
  html = html.replace(/{{certificate_id}}/g, data.certificateId);
  html = html.replace(/{{certificate_date}}/g, data.certificateDate);
  html = html.replace(/{{academic_year}}/g, data.academicYear || '2025–2026');

  // Authentic TNSDC Signature on the Left (from official government sample)
  const tnsdcSigPath = path.join(__dirname, '../assets/tnsdc_signature.png');
  const tnsdcSigDataUri = fileToDataUri(tnsdcSigPath);
  html = html.replace(/{{tnsdc_sig_src}}/g, tnsdcSigDataUri);

  // Authentic Executive / Authorized Signatory Signature on the Right
  const authSigPath = path.join(__dirname, '../assets/authorized_signatory.png');
  const authSigDataUri = fileToDataUri(authSigPath);
  html = html.replace(/{{authorized_sig_src}}/g, authSigDataUri);

  // Official Certificate Background Image (Sub-Company custom background or official default)
  const defaultBgPath = path.join(__dirname, '../assets/official_cert_bg.png');
  const bgImageDataUri = (data.bgImagePath && fileToDataUri(data.bgImagePath))
    ? fileToDataUri(data.bgImagePath)
    : fileToDataUri(defaultBgPath);
  html = html.replace(/{{bg_image_src}}/g, bgImageDataUri);

  // Handle Date range conditionals:
  if (data.fromDate && data.endDate) {
    html = html.replace('{{#if_dates}}', '');
    html = html.replace('{{/if_dates}}', '');
    html = html.replace(/{{from_date}}/g, data.fromDate);
    html = html.replace(/{{end_date}}/g, data.endDate);
  } else {
    html = html.replace(/{{#if_dates}}[\s\S]*?{{\/if_dates}}/, '');
  }

  // Logo conditionals:
  // 1. TNSkill Master Logo (Top-Center - Common for all certificates)
  if (tnSkillLogoDataUri) {
    html = html.replace('{{#if_tnskill_logo}}', '');
    html = html.replace('{{tnskill_logo_src}}', tnSkillLogoDataUri);
    html = html.replace(/{{else_tnskill_logo}}[\s\S]*?{{\/if_tnskill_logo}}/, '');
  } else {
    html = html.replace(/{{#if_tnskill_logo}}[\s\S]*?{{else_tnskill_logo}}/, '');
    html = html.replace('{{/if_tnskill_logo}}', '');
  }

  // 2. Sub Company on Top-Left
  if (subLogoDataUri) {
    html = html.replace('{{#if_sub_logo}}', '');
    html = html.replace('{{sub_logo_src}}', subLogoDataUri);
    html = html.replace(/{{else_sub_logo}}[\s\S]*?{{\/if_sub_logo}}/, '');
  } else {
    html = html.replace(/{{#if_sub_logo}}[\s\S]*?{{else_sub_logo}}/, '');
    html = html.replace('{{/if_sub_logo}}', '');
  }

  if (smLogoDataUri) {
    html = html.replace('{{#if_sm_logo}}', '');
    html = html.replace('{{sm_logo_src}}', smLogoDataUri);
    html = html.replace(/{{else_sm_logo}}[\s\S]*?{{\/if_sm_logo}}/, '');
  } else {
    html = html.replace(/{{#if_sm_logo}}[\s\S]*?{{else_sm_logo}}/, '');
    html = html.replace('{{/if_sm_logo}}', '');
  }

  return html;
};

module.exports = {
  buildCertificateData,
  renderCertificateHtml
};
