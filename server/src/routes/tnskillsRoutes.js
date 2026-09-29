const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getDashboard,
  getColleges,
  getCollegeById,
  getCollegeDepartments,
  getCollegeStudents,
  getStudentDetail,
  downloadCollegeCertificatesZip
} = require('../controllers/tnskillsController');

const { getCertificates } = require('../controllers/adminController');

// Requires TNSKILLS_ADMIN or SM_GROUPS_ADMIN
router.use(requireAuth, requireRole('TNSKILLS_ADMIN', 'SM_GROUPS_ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/colleges', getColleges);
router.get('/colleges/:id', getCollegeById);
router.get('/colleges/:id/departments', getCollegeDepartments);
router.get('/colleges/:id/students', getCollegeStudents);
router.get('/colleges/:id/download-certificates-zip', downloadCollegeCertificatesZip);
router.get('/students/:id', getStudentDetail);
router.get('/certificates', getCertificates);

module.exports = router;
