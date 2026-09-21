const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');

// Helper to get logged-in student record
const getLoggedInStudent = async (user) => {
  if (!user.studentId) {
    return await Student.findOne({ userId: user._id }).populate('collegeId', 'name code');
  }
  return await Student.findById(user.studentId).populate('collegeId', 'name code');
};

// GET /api/student/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const student = await getLoggedInStudent(req.user);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile record not found' });
    }

    const certificate = await Certificate.findOne({ studentId: student._id });

    res.json({
      success: true,
      student,
      certificateStatus: certificate ? certificate.status : 'PENDING',
      certificate: certificate ? {
        _id: certificate._id,
        certificateId: certificate.certificateId,
        filePath: certificate.filePath,
        previewImagePath: certificate.previewImagePath,
        status: certificate.status,
        generatedAt: certificate.generatedAt
      } : null
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/student/profile
const getProfile = async (req, res, next) => {
  try {
    const student = await getLoggedInStudent(req.user);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// GET /api/student/certificate
const getCertificate = async (req, res, next) => {
  try {
    const student = await getLoggedInStudent(req.user);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const certificate = await Certificate.findOne({ studentId: student._id });

    if (!certificate) {
      return res.json({
        success: true,
        hasCertificate: false,
        status: 'PENDING',
        message: 'Certificate not generated yet'
      });
    }

    res.json({
      success: true,
      hasCertificate: true,
      certificate: {
        _id: certificate._id,
        certificateId: certificate.certificateId,
        filePath: certificate.filePath,
        previewImagePath: certificate.previewImagePath,
        status: certificate.status,
        generatedAt: certificate.generatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/student/certificate/download
const downloadCertificate = async (req, res, next) => {
  try {
    const student = await getLoggedInStudent(req.user);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const certificate = await Certificate.findOne({
      studentId: student._id,
      status: 'GENERATED'
    });

    if (!certificate || !certificate.filePath) {
      return res.status(404).json({
        success: false,
        message: 'No generated certificate found for your account'
      });
    }

    const absolutePath = path.isAbsolute(certificate.filePath)
      ? certificate.filePath
      : path.join(__dirname, '../../', certificate.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate PDF file is missing on server'
      });
    }

    const sanitizedName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
    const certId = certificate.certificateId || 'ID';
    const downloadFilename = `${sanitizedName}_Certificate_${certId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);

    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getProfile,
  getCertificate,
  downloadCertificate
};
