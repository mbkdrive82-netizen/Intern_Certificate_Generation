const fs = require('fs');
const path = require('path');

// Helper to convert local file to base64 Data URI for reliable Puppeteer rendering
const fileToDataUri = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mimeType = ext === 'png' ? 'image/png' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/svg+xml';
  const buffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

/**
 * Build certificate data object from models
 * (Satisfies Section 94)
 */
const buildCertificateData = (student, college, company, course, certificateId) => {
  const certDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    studentName: student.name || 'Student',
    studentId: student.studentId || 'N/A',
    collegeName: college ? college.name : (student.collegeId?.name || 'Affiliated College'),
    department: student.department || 'General',
    year: student.year || 'III',
    companyName: company ? company.name : (student.company || 'Partner Enterprise'),
    courseName: course ? course.name : (student.course || 'Advanced Technical Training'),
    subCompanyName: company ? company.name : (student.company || 'Partner Enterprise'),
    certificateId: certificateId,
    certificateDate: certDate,
    smLogoPath: '', // Provided from template if configured
    subLogoPath: company ? company.logoPath : ''
  };
};

/**
 * Render HTML certificate string with embedded CSS and dynamic data
 */
const renderCertificateHtml = (data) => {
  const htmlPath = path.join(__dirname, 'certificateTemplate.html');
  const cssPath = path.join(__dirname, 'certificateTemplate.css');

  let html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');

  // Fixed SM GROUPS Logo (Provided by Admin as permanent master logo)
  const fixedSmLogoPath = path.join(__dirname, '../assets/sm_groups_logo.png');
  const actualSmLogoPath = (data.smLogoPath && fs.existsSync(data.smLogoPath))
    ? data.smLogoPath
    : (fs.existsSync(fixedSmLogoPath) ? fixedSmLogoPath : '');

  // Convert logos to base64 Data URIs
  const smLogoDataUri = actualSmLogoPath ? fileToDataUri(actualSmLogoPath) : '';
  const subLogoDataUri = data.subLogoPath ? fileToDataUri(data.subLogoPath) : '';

  // Inject CSS
  html = html.replace('{{certificate_styles}}', css);

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

  // Logo conditionals (Sub Company on Top-Left, SM Groups on Top-Right)
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
