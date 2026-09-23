const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const College = require('../models/College');
const Student = require('../models/Student');
const User = require('../models/User');
const Company = require('../models/Company');
const Course = require('../models/Course');

// Generate unique Student ID: TNS-2026-00001 format
const generateNextStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `TNS-${currentYear}-`;
  
  // Find latest student ID matching pattern
  const lastStudent = await Student.findOne({ studentId: new RegExp(`^${prefix}`) })
    .sort({ studentId: -1 })
    .exec();

  let nextSeq = 1;
  if (lastStudent && lastStudent.studentId) {
    const parts = lastStudent.studentId.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSeq = parsedSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSeq).padStart(5, '0');
  return `${prefix}${paddedSeq}`;
};

// Generate unique username from student name
const generateUsername = async (name) => {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
  
  let baseUsername = cleanName || 'student';
  let username = baseUsername;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

// Generate temporary password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let password = 'TNS#';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const processStudentExcel = async (filePath, options = {}) => {
  const { createMissingColleges = false } = options;

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawData || rawData.length === 0) {
    throw new Error('The uploaded Excel file is empty.');
  }

  // Normalize column names
  const sampleRow = rawData[0];
  const keys = Object.keys(sampleRow);
  
  const getVal = (row, fieldName) => {
    const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === fieldName.toLowerCase());
    return foundKey ? String(row[foundKey]).trim() : '';
  };

  const requiredCols = ['Name', 'College', 'Department', 'Year', 'Company', 'Course'];
  const missingCols = requiredCols.filter(col => {
    return !keys.some(k => k.trim().toLowerCase() === col.toLowerCase());
  });

  if (missingCols.length > 0) {
    throw new Error(`Missing required Excel columns: ${missingCols.join(', ')}. Required: Name, College, Department, Year, Company, Course`);
  }

  // 1. Pre-fetch in-memory caches to avoid N+1 DB roundtrips
  const currentYear = new Date().getFullYear();
  const prefix = `TNS-${currentYear}-`;
  
  const lastStudent = await Student.findOne({ studentId: new RegExp(`^${prefix}`) })
    .sort({ studentId: -1 })
    .lean();

  let nextSeq = 1;
  if (lastStudent && lastStudent.studentId) {
    const parts = lastStudent.studentId.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) nextSeq = parsed + 1;
    }
  }

  // Cache existing usernames
  const allUsers = await User.find({}, 'username').lean();
  const existingUsernames = new Set(allUsers.map(u => u.username.toLowerCase()));

  // Cache existing colleges
  const allColleges = await College.find({}).lean();
  const collegesMap = new Map();
  allColleges.forEach(c => {
    collegesMap.set(c.name.toLowerCase().trim(), c);
    if (c.code) collegesMap.set(c.code.toUpperCase().trim(), c);
  });

  // Cache existing companies
  const allCompanies = await Company.find({}).lean();
  const companiesMap = new Map();
  allCompanies.forEach(c => companiesMap.set(c.name.toLowerCase().trim(), c));

  // Cache existing courses
  const allCourses = await Course.find({}).lean();
  const coursesMap = new Map();
  allCourses.forEach(c => coursesMap.set(`${c.name.toLowerCase().trim()}_${c.companyId}`, c));

  // Cache existing students for duplicate check
  const allExistingStudents = await Student.find({}, 'name collegeId department').lean();
  const existingStudentsSet = new Set(
    allExistingStudents.map(s => `${s.name.toLowerCase().trim()}_${s.collegeId}_${s.department.toLowerCase().trim()}`)
  );

  let successful = 0;
  let failed = 0;
  let duplicates = 0;
  const failedRows = [];
  const createdStudents = [];

  // Helper for fast in-memory username generation
  const getFastUsername = (name) => {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '');
    
    let base = cleanName || 'student';
    let candidate = base;
    let counter = 1;
    while (existingUsernames.has(candidate)) {
      candidate = `${base}${counter}`;
      counter++;
    }
    existingUsernames.add(candidate);
    return candidate;
  };

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    const rowNumber = i + 2; // Row 1 is header

    const name = getVal(row, 'Name');
    const collegeName = getVal(row, 'College');
    const department = getVal(row, 'Department');
    const year = getVal(row, 'Year');
    const companyName = getVal(row, 'Company');
    const courseName = getVal(row, 'Course');

    // Row validation
    if (!name || !collegeName || !department || !year || !companyName || !courseName) {
      failed++;
      failedRows.push({
        rowNumber,
        studentName: name || 'N/A',
        reason: 'Missing one or more required fields (Name, College, Department, Year, Company, Course)'
      });
      continue;
    }

    try {
      // Find College from cache or create
      const colKey = collegeName.toLowerCase().trim();
      let college = collegesMap.get(colKey) || collegesMap.get(collegeName.toUpperCase().trim());

      if (!college) {
        if (createMissingColleges) {
          const code = collegeName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 6) + Math.floor(Math.random() * 100);
          const newCol = await College.create({ name: collegeName, code });
          college = newCol.toObject();
          collegesMap.set(colKey, college);
          collegesMap.set(code.toUpperCase(), college);
        } else {
          failed++;
          failedRows.push({
            rowNumber,
            studentName: name,
            reason: `College '${collegeName}' not found in system`
          });
          continue;
        }
      }

      // Check Duplicate Student via in-memory Set
      const dupKey = `${name.toLowerCase().trim()}_${college._id}_${department.toLowerCase().trim()}`;
      if (existingStudentsSet.has(dupKey)) {
        duplicates++;
        failed++;
        failedRows.push({
          rowNumber,
          studentName: name,
          reason: `Duplicate student record found in ${college.name} (${department})`
        });
        continue;
      }
      existingStudentsSet.add(dupKey);

      // Ensure Company exists
      const compKey = companyName.toLowerCase().trim();
      let company = companiesMap.get(compKey);
      if (!company) {
        const newComp = await Company.create({ name: companyName });
        company = newComp.toObject();
        companiesMap.set(compKey, company);
      }

      // Ensure Course exists
      const courseKey = `${courseName.toLowerCase().trim()}_${company._id}`;
      let course = coursesMap.get(courseKey);
      if (!course) {
        const newCourse = await Course.create({ name: courseName, companyId: company._id });
        course = newCourse.toObject();
        coursesMap.set(courseKey, course);
      }

      // Generate credentials
      const studentId = `${prefix}${String(nextSeq).padStart(5, '0')}`;
      nextSeq++;

      const tempPassword = generateTempPassword();
      const username = getFastUsername(name);
      const passwordHash = await bcrypt.hash(tempPassword, 8);

      // Create User
      const user = new User({
        username,
        passwordHash,
        role: 'STUDENT',
        collegeId: college._id
      });

      // Create Student
      const student = new Student({
        studentId,
        name,
        collegeId: college._id,
        department,
        year,
        company: company.name,
        course: course.name,
        userId: user._id,
        tempPassword
      });

      user.studentId = student._id;
      await user.save();
      await student.save();

      successful++;
      createdStudents.push({
        studentId,
        name,
        college: college.name,
        department,
        year,
        username,
        tempPassword,
        company: company.name,
        course: course.name
      });
    } catch (err) {
      failed++;
      failedRows.push({
        rowNumber,
        studentName: name,
        reason: err.message || 'Error processing row'
      });
    }
  }

  return {
    totalRows,
    successful,
    failed,
    duplicates,
    failedRows,
    createdStudents
  };
};

// Export Credential Excel Buffer
const generateCredentialExcelBuffer = (students) => {
  const data = students.map(s => ({
    'Student Name': s.name,
    'Student ID': s.studentId,
    'College': s.collegeId && s.collegeId.name ? s.collegeId.name : (s.college || 'N/A'),
    'Department': s.department,
    'Year': s.year,
    'Username': s.userId && s.userId.username ? s.userId.username : (s.username || 'N/A'),
    'Temporary Password': s.tempPassword || '******',
    'Company': s.company,
    'Course': s.course
  }));

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Credentials');

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  processStudentExcel,
  generateCredentialExcelBuffer
};
