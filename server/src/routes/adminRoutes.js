const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getDashboard,
  getColleges,
  createCollege,
  updateCollege,
  deleteCollege,
  deleteCollegeStudents,
  resetCollegeCredentials,
  downloadCollegeCertificatesZip,
  getStudents,
  getStudentById,
  deleteStudent,
  bulkDeleteStudents,
  uploadStudentsExcel,
  downloadSampleExcel,
  exportStudentCredentials,
  getCompanies,
  getCompanyLogoImage,
  getCompanyBgImage,
  createCompany,
  updateCompany,
  deleteCompany,
  deleteCompanyLogo,
  deleteCompanyBgImage,
  clearAllCertificates,
  getCourses,
  createCourse,
  getCertificateTemplates,
  createCertificateTemplate,
  getSmLogo,
  uploadSmLogo,
  generateSingleCertificate,
  generateBulkCertificatesController,
  getBulkGenerationProgress,
  getCertificates,
  getCertificateHtmlPreview,
  downloadCertificatePdf
} = require('../controllers/adminController');

// Public Streaming & Preview Endpoints (For fast browser <img> & direct PDF downloads without auth headers)
router.get('/companies/:id/logo-image', getCompanyLogoImage);
router.get('/companies/:id/bg-image', getCompanyBgImage);
router.get('/certificates/:id/preview-html', getCertificateHtmlPreview);
router.get('/certificates/:id/download-pdf', downloadCertificatePdf);

// All other endpoints require SM_GROUPS_ADMIN role
router.use(requireAuth, requireRole('SM_GROUPS_ADMIN'));

router.get('/dashboard', getDashboard);

// Colleges
router.get('/colleges', getColleges);
router.post('/colleges', createCollege);
router.put('/colleges/:id', updateCollege);
router.delete('/colleges/:id', deleteCollege);
router.delete('/colleges/:id/students', deleteCollegeStudents);
router.post('/colleges/:id/reset-credentials', resetCollegeCredentials);
router.get('/colleges/:id/download-certificates-zip', downloadCollegeCertificatesZip);

// Students & Excel Upload
router.get('/students', getStudents);
router.get('/students/sample-excel', downloadSampleExcel);
router.get('/students/credentials/export', exportStudentCredentials);
router.post('/students/bulk-delete', bulkDeleteStudents);
router.get('/students/:id', getStudentById);
router.delete('/students/:id', deleteStudent);
router.post('/students/upload', upload.single('excelFile'), uploadStudentsExcel);

// SM GROUPS Master Logo
router.get('/sm-logo', getSmLogo);
router.post('/sm-logo', upload.single('smLogo'), uploadSmLogo);

// Companies (Sub-Companies with Logo and Custom Background Image)
router.get('/companies', getCompanies);
router.post(
  '/companies',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'bgImage', maxCount: 1 }
  ]),
  createCompany
);
router.put(
  '/companies/:id',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'bgImage', maxCount: 1 }
  ]),
  updateCompany
);
router.delete('/companies/:id', deleteCompany);
router.delete('/companies/:id/logo', deleteCompanyLogo);
router.delete('/companies/:id/bg-image', deleteCompanyBgImage);

// Courses
router.get('/courses', getCourses);
router.post('/courses', createCourse);

// Certificate Templates
router.get('/certificate-templates', getCertificateTemplates);
router.post(
  '/certificate-templates',
  upload.fields([
    { name: 'templateFile', maxCount: 1 },
    { name: 'smLogoFile', maxCount: 1 }
  ]),
  createCertificateTemplate
);

// Certificates
router.post('/certificates/generate', generateSingleCertificate);
router.post('/certificates/generate-bulk', generateBulkCertificatesController);
router.get('/certificates/bulk-progress', getBulkGenerationProgress);
router.get('/certificates', getCertificates);
router.delete('/certificates/clear-all', clearAllCertificates);

module.exports = router;
