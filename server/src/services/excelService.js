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

  const totalRows = rawData.length;
  const sampleRow = rawData[0] || {};
  const keys = Object.keys(sampleRow);

  // Smart Synonyms Dictionary for effortless Excel uploads
  const synonyms = {
    name: ['name', 'full name', 'student name', 'candidate name', 'student_name', 'candidate', 'student'],
    college: ['college', 'college name', 'institution', 'college_name', 'institute', 'clg name'],
    department: ['department', 'dept', 'branch', 'department name', 'stream', 'discipline', 'course branch'],
    year: ['year', 'year of study', 'semester', 'sem', 'class', 'academic year'],
    company: ['company', 'company name', 'sub company', 'partner', 'partner company', 'training partner', 'sub-company'],
    course: ['course', 'course name', 'internship domain', 'domain', 'training topic', 'topic', 'training module'],
    fromDate: ['from date', 'start date', 'from_date', 'start_date', 'internship from', 'from', 'joining date', 'start'],
    endDate: ['end date', 'to date', 'end_date', 'to_date', 'internship to', 'to', 'completion date', 'end'],
    issueDate: ['issue date', 'certificate date', 'date of issue', 'issue_date', 'cert date', 'date', 'issued on']
  };

  const getFieldKey = (fieldName) => {
    const list = synonyms[fieldName.toLowerCase()] || [fieldName.toLowerCase()];
    // 1. Exact normalized match first
    for (const k of keys) {
      const cleanK = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (list.some(syn => cleanK === syn.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
        return k;
      }
    }
    // 2. Starts with / includes specific target keyword only
    for (const k of keys) {
      const cleanK = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (fieldName === 'college' && (cleanK.includes('college') || cleanK.includes('institution') || cleanK.includes('institute'))) {
        return k;
      }
      if (fieldName === 'name' && (cleanK.includes('fullname') || cleanK.includes('studentname') || cleanK.includes('candidatename') || cleanK === 'name')) {
        return k;
      }
      if (fieldName === 'department' && (cleanK.includes('department') || cleanK.includes('branch') || cleanK === 'dept')) {
        return k;
      }
      if (fieldName === 'year' && (cleanK.includes('semester') || cleanK.includes('academic') || cleanK === 'year' || cleanK === 'sem')) {
        return k;
      }
      if (fieldName === 'company' && (cleanK.includes('company') || cleanK.includes('partner') || cleanK.includes('subcomp'))) {
        return k;
      }
      if (fieldName === 'course' && (cleanK.includes('course') || cleanK.includes('topic') || cleanK.includes('domain'))) {
        return k;
      }
      if (fieldName.toLowerCase() === 'fromdate' && (cleanK.includes('from') || cleanK.includes('start'))) {
        return k;
      }
      if (fieldName.toLowerCase() === 'enddate' && (cleanK.includes('end') || cleanK.includes('to') || cleanK.includes('completion'))) {
        return k;
      }
      if (fieldName.toLowerCase() === 'issuedate' && (cleanK.includes('issue') || cleanK.includes('certdate') || cleanK === 'date')) {
        return k;
      }
    }
    return null;
  };

  const getVal = (row, fieldName) => {
    const matchedKey = getFieldKey(fieldName);
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      let val = String(row[matchedKey]).trim();
      // Auto-convert semester number to Year roman numerals if checking 'Year'
      if (fieldName.toLowerCase() === 'year') {
        const semNum = parseInt(val, 10);
        if (semNum === 1 || semNum === 2) return 'I';
        if (semNum === 3 || semNum === 4) return 'II';
        if (semNum === 5 || semNum === 6) return 'III';
        if (semNum === 7 || semNum === 8) return 'IV';
        if (/^[1-4]$/.test(val)) {
          const romans = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV' };
          return romans[val] || val;
        }
      }
      return val;
    }
    return '';
  };

  const requiredCols = ['name', 'department', 'year'];
  const missingCols = requiredCols.filter(col => !getFieldKey(col));

  if (missingCols.length > 0) {
    throw new Error(`Excel sheet missing required columns for: ${missingCols.join(', ')}. Please include Name, Department/Branch, Year/Semester.`);
  }

  // 1. Pre-fetch in-memory caches to avoid N+1 DB roundtrips
  const currentYear = new Date().getFullYear();
  const prefix = `TNS-${currentYear}-`;

  // Cache existing students and calculate true max numerical sequence
  const allExistingStudents = await Student.find({}, 'studentId name collegeId department').lean();
  const existingStudentIds = new Set(allExistingStudents.map(s => s.studentId).filter(Boolean));

  let maxSeq = 0;
  allExistingStudents.forEach(s => {
    if (s.studentId && s.studentId.startsWith(prefix)) {
      const numStr = s.studentId.replace(prefix, '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  });

  let nextSeq = maxSeq + 1;

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

  // Batch duplicate tracker
  const batchStudentsSet = new Set();

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
    let collegeName = getVal(row, 'College');
    let department = getVal(row, 'Department') || 'ECE';
    let year = getVal(row, 'Year') || 'IV';
    let companyName = getVal(row, 'Company');
    let courseName = getVal(row, 'Course') || 'IoT Application (ESP32)';
    let fromDate = getVal(row, 'fromDate');
    let endDate = getVal(row, 'endDate');
    let issueDate = getVal(row, 'issueDate');

    // Smart fallback if company or college is empty
    if (!companyName) {
      const defaultComp = allCompanies.length > 0 ? allCompanies[0].name : 'SRI TECH';
      companyName = defaultComp;
    }
    if (!collegeName) {
      const defaultCol = allColleges.length > 0 ? allColleges[0].name : 'AVS Engineering College';
      collegeName = defaultCol;
    }

    // Row validation
    if (!name) {
      failed++;
      failedRows.push({
        rowNumber,
        studentName: 'N/A',
        reason: 'Student Name is required'
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

      // Check Duplicate Student within current batch
      const dupKey = `${name.toLowerCase().trim()}_${college._id}_${department.toLowerCase().trim()}_${fromDate || ''}_${companyName.toLowerCase().trim()}`;
      if (batchStudentsSet.has(dupKey)) {
        duplicates++;
        failed++;
        failedRows.push({
          rowNumber,
          studentName: name,
          reason: `Duplicate row in upload sheet: ${name} (${college.name} - ${department})`
        });
        continue;
      }
      batchStudentsSet.add(dupKey);

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

      // Generate guaranteed unique student credentials
      let studentId;
      do {
        studentId = `${prefix}${String(nextSeq).padStart(5, '0')}`;
        nextSeq++;
      } while (existingStudentIds.has(studentId));
      existingStudentIds.add(studentId);

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
        fromDate,
        endDate,
        issueDate,
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
        course: course.name,
        fromDate,
        endDate,
        issueDate
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
    'From Date': s.fromDate || '',
    'End Date': s.endDate || '',
    'Issue Date': s.issueDate || '',
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
