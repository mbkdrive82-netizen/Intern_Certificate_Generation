const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const College = require('../models/College');
const Student = require('../models/Student');
const User = require('../models/User');
const Company = require('../models/Company');
const Course = require('../models/Course');
const CertificateTemplate = require('../models/CertificateTemplate');
const Certificate = require('../models/Certificate');
const Setting = require('../models/Setting');
const { processStudentExcel, generateCredentialExcelBuffer } = require('../services/excelService');
const { generateStudentCertificate, generateBulkCertificates: bulkGenCertService, getBulkProgress } = require('../services/certificateService');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const totalColleges = await College.countDocuments({ isActive: true });
    const totalStudents = await Student.countDocuments();
    const totalCertificates = await Certificate.countDocuments({ status: 'GENERATED' });
    const totalPendingCertificates = await Student.countDocuments() - totalCertificates;
    const totalCourses = await Course.countDocuments();
    const totalCompanies = await Company.countDocuments();

    const recentColleges = await College.find().sort({ createdAt: -1 }).limit(5);
    const recentStudents = await Student.find()
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentCertificates = await Certificate.find({ status: 'GENERATED' })
      .populate({
        path: 'studentId',
        populate: { path: 'collegeId', select: 'name' }
      })
      .sort({ generatedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalColleges,
        totalStudents,
        totalCertificates,
        totalPendingCertificates: Math.max(0, totalPendingCertificates),
        totalCourses,
        totalCompanies
      },
      recentColleges,
      recentStudents,
      recentCertificates
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/colleges
const getColleges = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await College.countDocuments(query);
    const colleges = await College.find(query)
      .populate('adminUserId', 'username')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Append department & student stats for each college
    const collegesWithStats = await Promise.all(
      colleges.map(async (col) => {
        const studentCount = await Student.countDocuments({ collegeId: col._id });
        const departments = await Student.distinct('department', { collegeId: col._id });
        const certCount = await Certificate.countDocuments({
          studentId: { $in: await Student.find({ collegeId: col._id }).distinct('_id') },
          status: 'GENERATED'
        });

        return {
          ...col.toObject(),
          studentCount,
          departments,
          certCount,
          pendingCount: Math.max(0, studentCount - certCount)
        };
      })
    );

    res.json({
      success: true,
      colleges: collegesWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/colleges
const createCollege = async (req, res, next) => {
  try {
    const { name, code, adminUsername, adminPassword } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'College name and code are required' });
    }

    const existingCode = await College.findOne({ code: code.toUpperCase().trim() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: `College code '${code}' already exists` });
    }

    const college = new College({
      name: name.trim(),
      code: code.toUpperCase().trim()
    });
    await college.save();

    // Create College Admin user if credentials provided
    if (adminUsername && adminPassword) {
      const existingUser = await User.findOne({ username: adminUsername.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: `Username '${adminUsername}' already taken` });
      }

      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const adminUser = new User({
        username: adminUsername.toLowerCase().trim(),
        passwordHash,
        role: 'COLLEGE_ADMIN',
        collegeId: college._id
      });
      await adminUser.save();

      college.adminUserId = adminUser._id;
      await college.save();
    }

    res.status(201).json({
      success: true,
      message: 'College created successfully',
      college
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/colleges/:id
const updateCollege = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    if (name) college.name = name.trim();
    if (code) college.code = code.toUpperCase().trim();

    await college.save();
    res.json({ success: true, message: 'College updated successfully', college });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/students
const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      collegeId,
      department,
      year,
      company,
      course,
      certificateStatus,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (collegeId) query.collegeId = collegeId;
    if (department) query.department = department;
    if (year) query.year = year;
    if (company) query.company = company;
    if (course) query.course = course;

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
        { course: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('collegeId', 'name code')
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Map certificates status
    const studentsWithCert = await Promise.all(
      students.map(async (st) => {
        const cert = await Certificate.findOne({ studentId: st._id });
        const certStatus = cert ? cert.status : 'PENDING';
        return {
          ...st.toObject(),
          certificateStatus: certStatus,
          certificateId: cert ? cert._id : null
        };
      })
    );

    // Filter by certificateStatus if requested
    let finalStudents = studentsWithCert;
    if (certificateStatus) {
      finalStudents = studentsWithCert.filter(s => s.certificateStatus === certificateStatus);
    }

    res.json({
      success: true,
      students: finalStudents,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('collegeId', 'name code')
      .populate('userId', 'username');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const certificate = await Certificate.findOne({ studentId: student._id });

    res.json({
      success: true,
      student: {
        ...student.toObject(),
        certificateStatus: certificate ? certificate.status : 'PENDING',
        certificate
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/students/upload
const uploadStudentsExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file (.xlsx or .xls)' });
    }

    const createMissingColleges = req.body.createMissingColleges === 'true' || req.body.createMissingColleges === true;

    const result = await processStudentExcel(req.file.path, { createMissingColleges });

    res.json({
      success: true,
      message: `Excel processed: ${result.successful} imported, ${result.failed} failed, ${result.duplicates} duplicates.`,
      result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/students/credentials/export
const exportStudentCredentials = async (req, res, next) => {
  try {
    const { collegeId, department } = req.query;
    const query = {};
    if (collegeId) query.collegeId = collegeId;
    if (department) query.department = department;

    const students = await Student.find(query)
      .populate('collegeId', 'name')
      .populate('userId', 'username');

    const buffer = generateCredentialExcelBuffer(students);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Student_Credentials.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Companies & Courses
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const { name } = req.body;
    let logoPath = '';
    if (req.file) {
      logoPath = `uploads/${path.basename(req.file.path)}`;
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const company = await Company.create({ name: name.trim(), logoPath });
    res.status(201).json({ success: true, message: 'Company created', company });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (req.file) {
      updateData.logoPath = `uploads/${path.basename(req.file.path)}`;
    }

    const company = await Company.findByIdAndUpdate(id, updateData, { new: true });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, message: 'Company updated successfully', company });
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('companyId', 'name').sort({ name: 1 });
    res.json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { name, companyId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Course name is required' });
    }
    const course = await Course.create({ name: name.trim(), companyId: companyId || null });
    res.status(201).json({ success: true, message: 'Course created', course });
  } catch (error) {
    next(error);
  }
};

// Certificate Templates
const getCertificateTemplates = async (req, res, next) => {
  try {
    const templates = await CertificateTemplate.find().sort({ createdAt: -1 });
    res.json({ success: true, templates });
  } catch (error) {
    next(error);
  }
};

const createCertificateTemplate = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Template name is required' });
    }

    let filePath = '';
    let smLogoPath = '';

    if (req.files) {
      if (req.files.templateFile && req.files.templateFile[0]) {
        filePath = req.files.templateFile[0].path;
      }
      if (req.files.smLogoFile && req.files.smLogoFile[0]) {
        smLogoPath = req.files.smLogoFile[0].path;
      }
    }

    const template = await CertificateTemplate.create({
      name: name.trim(),
      filePath,
      smLogoPath,
      isActive: true
    });

    res.status(201).json({ success: true, message: 'Template created', template });
  } catch (error) {
    next(error);
  }
};

// Certificate Generation
const generateSingleCertificate = async (req, res, next) => {
  try {
    const { studentId, templateId, regenerate } = req.body;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const result = await generateStudentCertificate(studentId, {
      templateId,
      regenerate: regenerate === true || regenerate === 'true'
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

const generateBulkCertificatesController = async (req, res, next) => {
  try {
    const { collegeId, department, year, company, course, templateId, regenerate } = req.body;

    const filter = {};
    if (collegeId) filter.collegeId = collegeId;
    if (department) filter.department = department;
    if (year) filter.year = year;
    if (company) filter.company = company;
    if (course) filter.course = course;

    const result = await bulkGenCertService(filter, {
      templateId,
      regenerate: regenerate === true || regenerate === 'true'
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/certificates/bulk-progress
const getBulkGenerationProgress = (req, res) => {
  const progress = getBulkProgress();
  res.json({ success: true, progress });
};

// GET /api/admin/certificates
const getCertificates = async (req, res, next) => {
  try {
    const { status, company, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    if (company) {
      const matchingStudents = await Student.find({ company: new RegExp(`^${company.trim()}$`, 'i') }).select('_id');
      query.studentId = { $in: matchingStudents.map(s => s._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Certificate.countDocuments(query);

    const certificates = await Certificate.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'collegeId', select: 'name code' }
      })
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      certificates,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/students/sample-excel
const downloadSampleExcel = (req, res) => {
  const filePath = path.join(__dirname, '../../../students_150_companies.xlsx');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="students_150_companies.xlsx"');
    return res.sendFile(filePath);
  }

  const clientPath = path.join(__dirname, '../../../client/public/sample_students.xlsx');
  if (fs.existsSync(clientPath)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="students_150_companies.xlsx"');
    return res.sendFile(clientPath);
  }

  res.status(404).send('Sample file not found');
};

// GET /api/admin/sm-logo
const getSmLogo = async (req, res, next) => {
  try {
    const setting = await Setting.findOne({ key: 'sm_groups_logo' });
    res.json({ success: true, smLogoPath: setting ? setting.value : '' });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/sm-logo
const uploadSmLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file (.png, .jpg)' });
    }

    const relativePath = req.file.path.replace(/\\/g, '/');
    await Setting.findOneAndUpdate(
      { key: 'sm_groups_logo' },
      { value: relativePath },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'SM GROUPS Master Logo updated successfully!',
      smLogoPath: relativePath
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
