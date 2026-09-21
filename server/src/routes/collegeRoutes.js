const express = require('express');
const router = express.Router();
const { requireAuth, requireRole, requireCollegeAccess } = require('../middleware/auth');
const {
  getDashboard,
  getProfile,
  getDepartments,
  getStudents,
  getStudentById
} = require('../controllers/collegeController');

// All endpoints require COLLEGE_ADMIN role & college security access
router.use(requireAuth, requireRole('COLLEGE_ADMIN'), requireCollegeAccess);

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.get('/departments', getDepartments);
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);

module.exports = router;
