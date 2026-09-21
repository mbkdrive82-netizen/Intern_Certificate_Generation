const express = require('express');
const router = express.Router();
const { requireAuth, requireRole, requireStudentAccess } = require('../middleware/auth');
const {
  getDashboard,
  getProfile,
  getCertificate,
  downloadCertificate
} = require('../controllers/studentController');

// All endpoints require STUDENT role
router.use(requireAuth, requireRole('STUDENT'), requireStudentAccess);

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.get('/certificate', getCertificate);
router.get('/certificate/download', downloadCertificate);

module.exports = router;
