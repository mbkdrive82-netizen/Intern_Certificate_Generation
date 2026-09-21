const College = require('../models/College');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');

// GET /api/college/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'User is not assigned to any college' });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College record not found' });
    }

    const totalStudents = await Student.countDocuments({ collegeId });
    const departments = await Student.distinct('department', { collegeId });
    
    // Certificates generated for students of this college
    const collegeStudentIds = await Student.find({ collegeId }).distinct('_id');
    const generatedCertificates = await Certificate.countDocuments({
      studentId: { $in: collegeStudentIds },
      status: 'GENERATED'
    });

    const pendingCertificates = Math.max(0, totalStudents - generatedCertificates);

    res.json({
      success: true,
      college: {
        _id: college._id,
        name: college.name,
        code: college.code
      },
      stats: {
        totalStudents,
        totalDepartments: departments.length,
        generatedCertificates,
        pendingCertificates
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/college/profile
const getProfile = async (req, res, next) => {
  try {
    const college = await College.findById(req.user.collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College profile not found' });
    }
    res.json({ success: true, college });
  } catch (error) {
    next(error);
  }
};

// GET /api/college/departments
const getDepartments = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    const departments = await Student.distinct('department', { collegeId });

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const count = await Student.countDocuments({ collegeId, department: dept });
        return { department: dept, count };
      })
    );

    res.json({ success: true, departments: departmentStats });
  } catch (error) {
    next(error);
  }
};

// GET /api/college/students
const getStudents = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    const { department, year, company, course, certificateStatus, search, page = 1, limit = 20 } = req.query;

    // MANDATORY SECURITY SCOPING
    const query = { collegeId };

    if (department) query.department = department;
    if (year) query.year = year;
    if (company) query.company = company;
    if (course) query.course = course;

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('collegeId', 'name code')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const studentsWithCert = await Promise.all(
      students.map(async (st) => {
        const cert = await Certificate.findOne({ studentId: st._id });
        return {
          ...st.toObject(),
          certificateStatus: cert ? cert.status : 'PENDING'
        };
      })
    );

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

// GET /api/college/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    const student = await Student.findOne({ _id: req.params.id, collegeId })
      .populate('collegeId', 'name code')
      .populate('userId', 'username');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or does not belong to your college'
      });
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

module.exports = {
  getDashboard,
  getProfile,
  getDepartments,
  getStudents,
  getStudentById
};
