const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const College = require('../models/College');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Course = require('../models/Course');
const CertificateTemplate = require('../models/CertificateTemplate');
const Certificate = require('../models/Certificate');

const seedData = async () => {
  try {
    const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tnskills_db';
    const fallbackUri = 'mongodb://127.0.0.1:27017/tnskills_db';

    try {
      await mongoose.connect(primaryUri);
      console.log(`Connected to MongoDB: ${primaryUri}`);
    } catch (e) {
      console.warn(`Primary connection failed (${e.message}), connecting to fallback: ${fallbackUri}`);
      await mongoose.connect(fallbackUri);
      console.log(`Connected to fallback MongoDB: ${fallbackUri}`);
    }

    // Clear existing data
    await User.deleteMany({});
    await College.deleteMany({});
    await Student.deleteMany({});
    await Company.deleteMany({});
    await Course.deleteMany({});
    await CertificateTemplate.deleteMany({});
    await Certificate.deleteMany({});

    console.log('Cleared old database records.');

    // 1. Create SM GROUPS Admin
    const smAdminPassword = await bcrypt.hash('adminpass', 10);
    const smAdmin = await User.create({
      username: 'smadmin',
      passwordHash: smAdminPassword,
      role: 'SM_GROUPS_ADMIN'
    });
    console.log('Created SM GROUPS Master Admin (smadmin / adminpass)');

    // 2. Create TNSKILLS Admin
    const tnskillsAdminPassword = await bcrypt.hash('tnskillspass', 10);
    const tnskillsAdmin = await User.create({
      username: 'tnskillsadmin',
      passwordHash: tnskillsAdminPassword,
      role: 'TNSKILLS_ADMIN'
    });
    console.log('Created TNSKILLS Admin (tnskillsadmin / tnskillspass)');

    // 3. Create Companies
    const company1 = await Company.create({ name: 'TechCorp Solutions Pvt Ltd' });
    const company2 = await Company.create({ name: 'Apex Innovations' });
    console.log('Created Sample Companies');

    // 4. Create Courses
    const coursesData = [
      { name: 'Full Stack Development', companyId: company1._id },
      { name: 'Python Programming', companyId: company1._id },
      { name: 'Digital Marketing', companyId: company2._id },
      { name: 'Data Analytics', companyId: company1._id },
      { name: 'AI & Machine Learning', companyId: company2._id }
    ];
    await Course.insertMany(coursesData);
    console.log('Created Sample Courses');

    // 5. Create Colleges & College Admins
    const collegeAdminPassword = await bcrypt.hash('collegepass', 10);

    const collegesData = [
      { name: 'ABC Engineering College', code: 'ABCENG', adminUsername: 'abcadmin' },
      { name: 'XYZ College of Technology', code: 'XYZTECH', adminUsername: 'xyzadmin' },
      { name: 'DEF Institute of Engineering', code: 'DEFENG', adminUsername: 'defadmin' }
    ];

    const collegesMap = {};

    for (const cData of collegesData) {
      const college = await College.create({
        name: cData.name,
        code: cData.code
      });

      const adminUser = await User.create({
        username: cData.adminUsername,
        passwordHash: collegeAdminPassword,
        role: 'COLLEGE_ADMIN',
        collegeId: college._id
      });

      college.adminUserId = adminUser._id;
      await college.save();

      collegesMap[cData.code] = college;
    }
    console.log('Created 3 Colleges & College Admins (abcadmin, xyzadmin, defadmin / collegepass)');

    // 6. Create Sample Students
    const studentPassword = await bcrypt.hash('studentpass', 10);
    const rawStudents = [
      { name: 'Arun Kumar', collegeCode: 'ABCENG', dept: 'CSE', year: 'III', company: 'TechCorp Solutions Pvt Ltd', course: 'Full Stack Development', username: 'arun.kumar' },
      { name: 'Priya S', collegeCode: 'ABCENG', dept: 'ECE', year: 'II', company: 'TechCorp Solutions Pvt Ltd', course: 'Python Programming', username: 'priya.s' },
      { name: 'Rahul M', collegeCode: 'ABCENG', dept: 'IT', year: 'IV', company: 'Apex Innovations', course: 'Digital Marketing', username: 'rahul.m' },
      { name: 'Kavitha R', collegeCode: 'ABCENG', dept: 'CSE', year: 'III', company: 'TechCorp Solutions Pvt Ltd', course: 'Data Analytics', username: 'kavitha.r' },
      { name: 'Suresh V', collegeCode: 'XYZTECH', dept: 'CSE', year: 'IV', company: 'Apex Innovations', course: 'AI & Machine Learning', username: 'suresh.v' },
      { name: 'Ananya N', collegeCode: 'XYZTECH', dept: 'ECE', year: 'III', company: 'TechCorp Solutions Pvt Ltd', course: 'Python Programming', username: 'ananya.n' },
      { name: 'Karthik B', collegeCode: 'XYZTECH', dept: 'EEE', year: 'II', company: 'TechCorp Solutions Pvt Ltd', course: 'Full Stack Development', username: 'karthik.b' },
      { name: 'Deepak T', collegeCode: 'DEFENG', dept: 'MECH', year: 'IV', company: 'Apex Innovations', course: 'Digital Marketing', username: 'deepak.t' },
      { name: 'Divya M', collegeCode: 'DEFENG', dept: 'CSE', year: 'III', company: 'TechCorp Solutions Pvt Ltd', course: 'Full Stack Development', username: 'divya.m' },
      { name: 'Vignesh P', collegeCode: 'DEFENG', dept: 'IT', year: 'II', company: 'TechCorp Solutions Pvt Ltd', course: 'Data Analytics', username: 'vignesh.p' }
    ];

    for (let i = 0; i < rawStudents.length; i++) {
      const st = rawStudents[i];
      const college = collegesMap[st.collegeCode];
      const studentIdStr = `TNS-2026-${String(i + 1).padStart(5, '0')}`;

      const user = await User.create({
        username: st.username,
        passwordHash: studentPassword,
        role: 'STUDENT',
        collegeId: college._id
      });

      const student = await Student.create({
        studentId: studentIdStr,
        name: st.name,
        collegeId: college._id,
        department: st.dept,
        year: st.year,
        company: st.company,
        course: st.course,
        userId: user._id,
        tempPassword: 'studentpass'
      });

      user.studentId = student._id;
      await user.save();
    }
    console.log('Created 10 Sample Students (arun.kumar, etc. / studentpass)');

    // 7. Create Default Certificate Template
    const template = await CertificateTemplate.create({
      name: 'Standard Gold Border Template',
      filePath: '',
      smLogoPath: '',
      isActive: true
    });
    console.log('Created Default Certificate Template');

    console.log('\n=============================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
