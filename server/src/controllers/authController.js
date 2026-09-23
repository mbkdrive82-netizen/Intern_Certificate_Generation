const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');
const Student = require('../models/Student');

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const cleanInput = username.trim();

    // Find user by username or studentId
    let user = await User.findOne({ username: cleanInput.toLowerCase() }).select('+passwordHash');
    
    if (!user) {
      const studentRec = await Student.findOne({ studentId: new RegExp(`^${cleanInput}$`, 'i') });
      if (studentRec && studentRec.userId) {
        user = await User.findById(studentRec.userId).select('+passwordHash');
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your username or Student ID.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Check password with bcrypt, or fallback to temporary password / standard default
    let isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch && user.role === 'STUDENT') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        if (student.tempPassword && student.tempPassword === password) {
          isMatch = true;
        } else if (password === 'Password@123' || password === student.studentId) {
          isMatch = true;
        }
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password is incorrect.' });
    }

    // Generate JWT token
    const payload = {
      userId: user._id,
      role: user.role,
      collegeId: user.collegeId,
      studentId: user.studentId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'tnskills_super_secret_jwt_key_2026_master', {
      expiresIn: '7d'
    });

    // Additional info based on role
    let collegeDetails = null;
    let studentDetails = null;

    if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
      collegeDetails = await College.findById(user.collegeId).select('name code');
    }

    if (user.role === 'STUDENT' && user.studentId) {
      studentDetails = await Student.findById(user.studentId).populate('collegeId', 'name code');
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        collegeId: user.collegeId,
        studentId: user.studentId,
        college: collegeDetails,
        student: studentDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    
    let collegeDetails = null;
    let studentDetails = null;

    if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
      collegeDetails = await College.findById(user.collegeId);
    }

    if (user.role === 'STUDENT' && user.studentId) {
      studentDetails = await Student.findById(user.studentId).populate('collegeId', 'name code');
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        collegeId: user.collegeId,
        studentId: user.studentId,
        college: collegeDetails,
        student: studentDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe
};
