const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getDashboard,
  getColleges,
  createCollege,
  updateCollege,
  getStudents,
  getStudentById,
  uploadStudentsExcel,
  downloadSampleExcel,
  exportStudentCredentials,
  getCompanies,
  createCompany,
  updateCompany,
  getCourses,
  createCourse,
  getCertificateTemplates,
  createCertificateTemplate,
  getSmLogo,
  uploadSmLogo,
  generateSingleCertificate,
  generateBulkCertificatesController,
  getBulkGenerationProgress,
  getCertificates
} = require('../controllers/adminController');

// All endpoints require SM_GROUPS_ADMIN role
router.use(requireAuth, requireRole('SM_GROUPS_ADMIN'));

router.get('/dashboard', getDashboard);

// Colleges
router.get('/colleges', getColleges);
router.post('/colleges', createCollege);
router.put('/colleges/:id', updateCollege);

// Students & Excel Upload
router.get('/students', getStudents);
router.get('/students/sample-excel', downloadSampleExcel);
router.get('/students/credentials/export', exportStudentCredentials);
router.get('/students/:id', getStudentById);
router.post('/students/upload', upload.single('excelFile'), uploadStudentsExcel);

// SM GROUPS Master Logo
router.get('/sm-logo', getSmLogo);
router.post('/sm-logo', upload.single('smLogo'), uploadSmLogo);

// Companies
router.get('/companies', getCompanies);
router.post('/companies', upload.single('logo'), createCompany);
router.put('/companies/:id', upload.single('logo'), updateCompany);

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

module.exports = router;
