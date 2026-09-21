const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
const requireAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tnskills_super_secret_jwt_key_2026_master');
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User account not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

// Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'Guest'}' lacks required access permission`
      });
    }
    next();
  };
};

// Strict College Security Access
const requireCollegeAccess = (req, res, next) => {
  if (req.user.role === 'SM_GROUPS_ADMIN' || req.user.role === 'TNSKILLS_ADMIN') {
    return next();
  }

  if (req.user.role === 'COLLEGE_ADMIN') {
    const requestedCollegeId = req.params.collegeId || req.params.id || req.query.collegeId || req.body.collegeId;
    if (requestedCollegeId && req.user.collegeId && requestedCollegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: College Admins can only access their own college data'
      });
    }
    return next();
  }

  return res.status(403).json({ success: false, message: 'Access denied to college resource' });
};

// Strict Student Security Access
const requireStudentAccess = (req, res, next) => {
  if (req.user.role === 'SM_GROUPS_ADMIN' || req.user.role === 'TNSKILLS_ADMIN') {
    return next();
  }

  if (req.user.role === 'COLLEGE_ADMIN') {
    // Verified further in controller via college scope
    return next();
  }

  if (req.user.role === 'STUDENT') {
    const requestedStudentId = req.params.studentId || req.params.id || req.query.studentId;
    if (requestedStudentId && req.user.studentId && requestedStudentId.toString() !== req.user.studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Students can only access their own profile and certificate'
      });
    }
    return next();
  }

  return res.status(403).json({ success: false, message: 'Access denied' });
};

module.exports = {
  requireAuth,
  requireRole,
  requireCollegeAccess,
  requireStudentAccess
};
