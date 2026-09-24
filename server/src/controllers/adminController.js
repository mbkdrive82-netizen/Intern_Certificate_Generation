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
const { generateStudentCertificate, generateBulkCertificates: bulkGenCertService, getBulkProgress, streamCollegeCertificatesZip } = require('../services/certificateService');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalColleges,
      totalStudents,
      totalCertificates,
      totalCourses,
      totalCompanies,
      recentColleges,
      recentStudents,
      recentCertificates
    ] = await Promise.all([
      College.countDocuments({ isActive: true }),
      Student.countDocuments(),
      Certificate.countDocuments({ status: 'GENERATED' }),
      Course.countDocuments(),
      Company.countDocuments(),
      College.find().sort({ createdAt: -1 }).limit(5).lean(),
      Student.find()
        .populate('collegeId', 'name code')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Certificate.find({ status: 'GENERATED' })
        .select('-previewImagePath')
        .populate({
          path: 'studentId',
          populate: { path: 'collegeId', select: 'name' }
        })
        .sort({ generatedAt: -1 })
        .limit(5)
        .lean()
    ]);

    const totalPendingCertificates = Math.max(0, totalStudents - totalCertificates);

    res.json({
      success: true,
      stats: {
        totalColleges,
        totalStudents,
        totalCertificates,
        totalPendingCertificates,
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

// POST /api/admin/colleges/:id/reset-credentials
const resetCollegeCredentials = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id).populate('adminUserId', 'username');

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Generate new password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    let newPassword = '';
    for (let i = 0; i < 10; i++) {
      newPassword += chars[Math.floor(Math.random() * chars.length)];
    }

    let adminUser = college.adminUserId;

    if (!adminUser) {
      // Create new admin user if none exists
      const username = college.code.toLowerCase() + '_admin';
      const passwordHash = await bcrypt.hash(newPassword, 10);
      adminUser = new User({ username, passwordHash, role: 'COLLEGE_ADMIN', collegeId: college._id });
      await adminUser.save();
      college.adminUserId = adminUser._id;
      await college.save();
    } else {
      // Update existing user's password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(adminUser._id, { passwordHash });
    }

    res.json({
      success: true,
      credentials: {
        collegeName: college.name,
        username: adminUser.username || (college.code.toLowerCase() + '_admin'),
        password: newPassword
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/colleges/:id/download-certificates-zip
const downloadCollegeCertificatesZip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department } = req.query;
    await streamCollegeCertificatesZip(id, res, { department });
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

    const [total, students] = await Promise.all([
      Student.countDocuments(query),
      Student.find(query)
        .populate('collegeId', 'name code')
        .populate('userId', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
    ]);

    // Batch map certificates status with 1 single query instead of N serial queries
    const studentIds = students.map(st => st._id);
    const certs = await Certificate.find({ studentId: { $in: studentIds } })
      .select('studentId status _id')
      .lean();

    const certMap = new Map();
    for (const c of certs) {
      if (c.studentId) certMap.set(c.studentId.toString(), c);
    }

    const studentsWithCert = students.map(st => {
      const cert = certMap.get(st._id.toString());
      return {
        ...st,
        certificateStatus: cert ? cert.status : 'PENDING',
        certificateId: cert ? cert._id : null
      };
    });

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

    const createMissingColleges = req.body.createMissingColleges !== 'false' && req.body.createMissingColleges !== false;

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
    const companies = await Company.find().sort({ name: 1 }).lean();
    res.json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const { name, templateStyle } = req.body;
    let logoPath = '';
    let bgImagePath = '';

    const logoFile = req.files?.['logo']?.[0] || (req.file?.fieldname === 'logo' ? req.file : null);
    const bgImageFile = req.files?.['bgImage']?.[0] || (req.file?.fieldname === 'bgImage' ? req.file : null);

    if (logoFile) {
      try {
        const buffer = fs.readFileSync(logoFile.path);
        const ext = path.extname(logoFile.path).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'application/octet-stream';
        logoPath = `data:${mime};base64,${buffer.toString('base64')}`;
      } catch (e) {
        logoPath = `uploads/${path.basename(logoFile.path)}`;
      }
    }
    if (bgImageFile) {
      try {
        const buffer = fs.readFileSync(bgImageFile.path);
        const ext = path.extname(bgImageFile.path).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'application/octet-stream';
        bgImagePath = `data:${mime};base64,${buffer.toString('base64')}`;
      } catch (e) {
        bgImagePath = `uploads/${path.basename(bgImageFile.path)}`;
      }
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const trimmedName = name.trim();

    // Check if company already exists
    const existing = await Company.findOne({
      name: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      if (logoPath) existing.logoPath = logoPath;
      if (bgImagePath) existing.bgImagePath = bgImagePath;
      if (templateStyle) existing.templateStyle = templateStyle;
      await existing.save();
      return res.status(200).json({
        success: true,
        message: `Company '${existing.name}' already existed — settings updated successfully!`,
        company: existing
      });
    }

    const company = await Company.create({
      name: trimmedName,
      logoPath,
      bgImagePath,
      templateStyle: templateStyle || 'default'
    });
    res.status(201).json({ success: true, message: 'Company created successfully', company });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, templateStyle } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (templateStyle) updateData.templateStyle = templateStyle;

    const logoFile = req.files?.['logo']?.[0] || (req.file?.fieldname === 'logo' ? req.file : null);
    const bgImageFile = req.files?.['bgImage']?.[0] || (req.file?.fieldname === 'bgImage' ? req.file : null);

    if (logoFile) {
      try {
        const buffer = fs.readFileSync(logoFile.path);
        const ext = path.extname(logoFile.path).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'application/octet-stream';
        updateData.logoPath = `data:${mime};base64,${buffer.toString('base64')}`;
      } catch (e) {
        updateData.logoPath = `uploads/${path.basename(logoFile.path)}`;
      }
    }
    if (bgImageFile) {
      try {
        const buffer = fs.readFileSync(bgImageFile.path);
        const ext = path.extname(bgImageFile.path).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'application/octet-stream';
        updateData.bgImagePath = `data:${mime};base64,${buffer.toString('base64')}`;
      } catch (e) {
        updateData.bgImagePath = `uploads/${path.basename(bgImageFile.path)}`;
      }
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

const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Clean up uploaded logo if not an asset
    if (company.logoPath && !company.logoPath.startsWith('assets/')) {
      const fullLogoPath = path.join(__dirname, '../../', company.logoPath);
      if (fs.existsSync(fullLogoPath)) {
        try { fs.unlinkSync(fullLogoPath); } catch (e) {}
      }
    }

    // Clean up uploaded background image if not an asset
    if (company.bgImagePath && !company.bgImagePath.startsWith('assets/')) {
      const fullBgPath = path.join(__dirname, '../../', company.bgImagePath);
      if (fs.existsSync(fullBgPath)) {
        try { fs.unlinkSync(fullBgPath); } catch (e) {}
      }
    }

    await Company.findByIdAndDelete(id);
    res.json({ success: true, message: `Company '${company.name}' deleted successfully` });
  } catch (error) {
    next(error);
  }
};

const deleteCompanyLogo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (company.logoPath && !company.logoPath.startsWith('assets/')) {
      const fullLogoPath = path.join(__dirname, '../../', company.logoPath);
      if (fs.existsSync(fullLogoPath)) {
        try { fs.unlinkSync(fullLogoPath); } catch (e) {}
      }
    }

    company.logoPath = '';
    await company.save();
    res.json({ success: true, message: `Logo removed for '${company.name}'`, company });
  } catch (error) {
    next(error);
  }
};

const deleteCompanyBgImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (company.bgImagePath && !company.bgImagePath.startsWith('assets/')) {
      const fullBgPath = path.join(__dirname, '../../', company.bgImagePath);
      if (fs.existsSync(fullBgPath)) {
        try { fs.unlinkSync(fullBgPath); } catch (e) {}
      }
    }

    company.bgImagePath = '';
    await company.save();
    res.json({ success: true, message: `Custom certificate background removed for '${company.name}' (reverted to default)`, company });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/certificates/clear-all
const clearAllCertificates = async (req, res, next) => {
  try {
    await Certificate.deleteMany({});
    
    // Also clean up certificate PDFs and previews from disk
    const certDir = path.join(__dirname, '../../certificates');
    const previewDir = path.join(certDir, 'previews');
    
    if (fs.existsSync(certDir)) {
      const pdfFiles = fs.readdirSync(certDir).filter(f => f.endsWith('.pdf'));
      pdfFiles.forEach(f => {
        try { fs.unlinkSync(path.join(certDir, f)); } catch (e) {}
      });
    }
    
    if (fs.existsSync(previewDir)) {
      const pngFiles = fs.readdirSync(previewDir).filter(f => f.endsWith('.png'));
      pngFiles.forEach(f => {
        try { fs.unlinkSync(path.join(previewDir, f)); } catch (e) {}
      });
    }

    res.json({ success: true, message: 'All student certificates and preview files removed successfully!' });
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

    // Check if bulk generation is already running
    const currentProgress = getBulkProgress();
    if (currentProgress.inProgress) {
      return res.json({
        success: true,
        inProgress: true,
        message: 'Bulk generation is already in progress.'
      });
    }

    // Launch asynchronously in background so Render/browsers never timeout or drop connection
    bulkGenCertService(filter, {
      templateId,
      regenerate: regenerate === true || regenerate === 'true'
    }).catch(err => {
      console.error('[Bulk Generation Async Engine Error]:', err);
    });

    res.json({
      success: true,
      inProgress: true,
      message: 'Bulk generation started successfully in background.'
    });
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
    const {
      status,
      company,
      collegeId,
      department,
      year,
      course,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const certQuery = {};
    if (status && status !== 'ALL') certQuery.status = status;

    const studentQuery = {};
    let filterStudents = false;

    if (collegeId && collegeId !== 'ALL' && collegeId !== 'all') {
      studentQuery.collegeId = collegeId;
      filterStudents = true;
    }
    if (department && department !== 'ALL' && department !== 'all') {
      const cleanDept = department.trim().replace(/\s+/g, '\\s*');
      studentQuery.department = new RegExp(`^${cleanDept}$`, 'i');
      filterStudents = true;
    }
    if (year && year !== 'ALL' && year !== 'all') {
      studentQuery.year = new RegExp(`^${year.trim()}$`, 'i');
      filterStudents = true;
    }
    if (company && company !== 'ALL' && company !== 'all') {
      const cleanComp = company.trim().replace(/\s+/g, '\\s*');
      studentQuery.company = new RegExp(`^${cleanComp}$`, 'i');
      filterStudents = true;
    }
    if (course && course !== 'ALL' && course !== 'all') {
      const cleanCourse = course.trim().replace(/\s+/g, '\\s*');
      studentQuery.course = new RegExp(`^${cleanCourse}$`, 'i');
      filterStudents = true;
    }

    if (status === 'PENDING') {
      const generatedStudentIds = await Certificate.find({ status: 'GENERATED' }).distinct('studentId');
      studentQuery._id = { $nin: generatedStudentIds };

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        studentQuery.$or = [
          { name: searchRegex },
          { studentId: searchRegex },
          { department: searchRegex },
          { course: searchRegex }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Student.countDocuments(studentQuery);
      const pendingStudents = await Student.find(studentQuery)
        .populate('collegeId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const certificates = pendingStudents.map(st => ({
        _id: `pending_${st._id}`,
        studentId: st,
        certificateId: 'Pending',
        certificateNumber: 'Pending',
        status: 'PENDING',
        generatedAt: null,
        filePath: null,
        previewImagePath: null
      }));

      return res.json({
        success: true,
        certificates,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const matchedStudents = await Student.find({
        ...studentQuery,
        $or: [
          { name: searchRegex },
          { studentId: searchRegex },
          { department: searchRegex },
          { course: searchRegex }
        ]
      }).select('_id');

      const studentIds = matchedStudents.map(s => s._id);

      certQuery.$or = [
        { certificateId: searchRegex },
        { certificateNumber: searchRegex },
        { studentId: { $in: studentIds } }
      ];
    } else if (filterStudents) {
      const matchingStudents = await Student.find(studentQuery).select('_id');
      certQuery.studentId = { $in: matchingStudents.map(s => s._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, certificates] = await Promise.all([
      Certificate.countDocuments(certQuery),
      Certificate.find(certQuery)
        .populate({
          path: 'studentId',
          populate: { path: 'collegeId', select: 'name code' }
        })
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    ]);

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

const safeUnlinkFile = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return;
  if (filePath.startsWith('data:') || filePath.length > 400) return;
  try {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (e) {}
};

// DELETE /api/admin/colleges/:id/students
const deleteCollegeStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const students = await Student.find({ collegeId: id });
    if (students.length === 0) {
      return res.json({ success: true, message: 'No students found for this college to delete', count: 0 });
    }

    const studentIds = students.map(s => s._id);
    const userIds = students.map(s => s.userId).filter(Boolean);

    // 1. Find certificates and safely delete files from disk
    const certs = await Certificate.find({ studentId: { $in: studentIds } });
    for (const cert of certs) {
      safeUnlinkFile(cert.filePath);
      safeUnlinkFile(cert.previewImagePath);
    }

    // 2. Delete certificates from DB
    await Certificate.deleteMany({ studentId: { $in: studentIds } });

    // 3. Delete student user logins from DB
    if (userIds.length > 0) {
      await User.deleteMany({ _id: { $in: userIds } });
    }

    // 4. Delete student records from DB
    await Student.deleteMany({ collegeId: id });

    // 5. Update College student count
    college.totalStudents = 0;
    await college.save();

    res.json({
      success: true,
      message: `Successfully deleted all ${students.length} students, logins, and certificates for ${college.name}.`,
      deletedCount: students.length
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 1. Delete associated certificates and files
    const certs = await Certificate.find({ studentId: student._id });
    for (const cert of certs) {
      safeUnlinkFile(cert.filePath);
      safeUnlinkFile(cert.previewImagePath);
    }
    await Certificate.deleteMany({ studentId: student._id });

    // 2. Delete User login account
    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }

    // 3. Delete Student record
    await Student.findByIdAndDelete(student._id);

    // 4. Update College total count
    const remainingCount = await Student.countDocuments({ collegeId: student.collegeId });
    await College.findByIdAndUpdate(student.collegeId, { totalStudents: remainingCount });

    res.json({
      success: true,
      message: `Student "${student.name}" and associated records deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/students/bulk-delete
const bulkDeleteStudents = async (req, res, next) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of student IDs to delete' });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found with provided IDs' });
    }

    const validIds = students.map(s => s._id);
    const userIds = students.map(s => s.userId).filter(Boolean);
    const affectedCollegeIds = [...new Set(students.map(s => s.collegeId.toString()))];

    // Delete cert files and documents
    const certs = await Certificate.find({ studentId: { $in: validIds } });
    for (const cert of certs) {
      safeUnlinkFile(cert.filePath);
      safeUnlinkFile(cert.previewImagePath);
    }
    await Certificate.deleteMany({ studentId: { $in: validIds } });

    // Delete user logins
    if (userIds.length > 0) {
      await User.deleteMany({ _id: { $in: userIds } });
    }

    // Delete students
    await Student.deleteMany({ _id: { $in: validIds } });

    // Update college counts
    for (const colId of affectedCollegeIds) {
      const cnt = await Student.countDocuments({ collegeId: colId });
      await College.findByIdAndUpdate(colId, { totalStudents: cnt });
    }

    res.json({
      success: true,
      message: `Successfully deleted ${students.length} students.`,
      deletedCount: students.length
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/colleges/:id
const deleteCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);

    // 1. Delete all students of this college
    const students = await Student.find({ collegeId: id });
    const studentIds = students.map(s => s._id);
    const userIds = students.map(s => s.userId).filter(Boolean);

    const certs = await Certificate.find({ studentId: { $in: studentIds } });
    for (const cert of certs) {
      safeUnlinkFile(cert.filePath);
      safeUnlinkFile(cert.previewImagePath);
    }
    await Certificate.deleteMany({ studentId: { $in: studentIds } });
    if (userIds.length > 0) {
      await User.deleteMany({ _id: { $in: userIds } });
    }
    await Student.deleteMany({ collegeId: id });

    // 2. Delete College Admin user & College document if present
    if (college) {
      if (college.adminUserId) {
        await User.findByIdAndDelete(college.adminUserId);
      }
      await College.findByIdAndDelete(id);
    }

    res.json({
      success: true,
      message: college ? `College "${college.name}" deleted successfully.` : 'College already deleted or removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  getCertificates
};
