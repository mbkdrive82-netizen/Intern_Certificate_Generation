const College = require('../models/College');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');

// GET /api/tnskills/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const totalColleges = await College.countDocuments({ isActive: true });
    const totalStudents = await Student.countDocuments();
    const totalCertificates = await Certificate.countDocuments({ status: 'GENERATED' });
    const certificatesPending = Math.max(0, totalStudents - totalCertificates);

    const departmentsList = await Student.distinct('department');

    // List all colleges with statistics
    const colleges = await College.find({ isActive: true }).sort({ name: 1 });
    const collegeListWithStats = await Promise.all(
      colleges.map(async (col) => {
        const studentCount = await Student.countDocuments({ collegeId: col._id });
        const deptNames = await Student.distinct('department', { collegeId: col._id });
        const departments = await Promise.all(
          deptNames.map(async (d) => {
            const count = await Student.countDocuments({ collegeId: col._id, department: d });
            return { name: d, count };
          })
        );
        const certCount = await Certificate.countDocuments({
          studentId: { $in: await Student.find({ collegeId: col._id }).distinct('_id') },
          status: 'GENERATED'
        });

        return {
          _id: col._id,
          name: col.name,
          code: col.code,
          studentCount,
          departments,
          deptCount: departments.length,
          certCount,
          pendingCount: Math.max(0, studentCount - certCount)
        };
      })
    );

    const companyBreakdown = await Student.aggregate([
      { $match: { company: { $exists: true, $ne: '' } } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const departmentBreakdown = await Student.aggregate([
      { $match: { department: { $exists: true, $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalColleges,
        totalStudents,
        totalDepartments: departmentsList.length,
        totalCertificates,
        certificatesPending,
        completionRate: totalStudents > 0 ? Math.round((totalCertificates / totalStudents) * 100) : 0
      },
      colleges: collegeListWithStats,
      analytics: {
        companies: companyBreakdown,
        departments: departmentBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tnskills/colleges
const getColleges = async (req, res, next) => {
  try {
    const colleges = await College.find({ isActive: true }).sort({ name: 1 });
    
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

    res.json({ success: true, colleges: collegesWithStats });
  } catch (error) {
    next(error);
  }
};

// GET /api/tnskills/colleges/:id
const getCollegeById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const totalStudents = await Student.countDocuments({ collegeId: college._id });
    const departments = await Student.distinct('department', { collegeId: college._id });

    // Count students per department
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const count = await Student.countDocuments({ collegeId: college._id, department: dept });
        return { department: dept, count };
      })
    );

    res.json({
      success: true,
      college: {
        ...college.toObject(),
        totalStudents,
        departments: departmentStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tnskills/colleges/:id/departments
const getCollegeDepartments = async (req, res, next) => {
  try {
    const collegeId = req.params.id;
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

// GET /api/tnskills/colleges/:id/students
const getCollegeStudents = async (req, res, next) => {
  try {
    const collegeId = req.params.id;
    const { department, year, course, company, certificateStatus, search, page = 1, limit = 20 } = req.query;

    const query = { collegeId };
    if (department) query.department = department;
    if (year) query.year = year;
    if (course) query.course = course;
    if (company) query.company = company;

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
          certificateStatus: cert ? cert.status : 'PENDING',
          certificateId: cert ? cert.certificateId : null,
          certificateFilePath: cert ? cert.filePath : null,
          certificatePreviewPath: cert ? cert.previewImagePath : null
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

// GET /api/tnskills/students/:id
const getStudentDetail = async (req, res, next) => {
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

module.exports = {
  getDashboard,
  getColleges,
  getCollegeById,
  getCollegeDepartments,
  getCollegeStudents,
  getStudentDetail
};
