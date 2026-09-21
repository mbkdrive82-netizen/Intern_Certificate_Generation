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

const cleanReset = async () => {
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

    // 1. Remove all students, certificates, companies, courses, and non-admin users
    await Student.deleteMany({});
    await Certificate.deleteMany({});
    await Company.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({ role: 'STUDENT' });

    console.log('Cleared all students, certificates, companies, and courses.');

    // 2. Clean generated files from disk
    const certDir = path.join(__dirname, '../../certificates');
    const previewDir = path.join(certDir, 'previews');

    if (fs.existsSync(certDir)) {
      const files = fs.readdirSync(certDir);
      for (const file of files) {
        const fullPath = path.join(certDir, file);
        if (fs.statSync(fullPath).isFile() && (file.endsWith('.pdf') || file.endsWith('.png'))) {
          try { fs.unlinkSync(fullPath); } catch (e) {}
        }
      }
    }

    if (fs.existsSync(previewDir)) {
      const files = fs.readdirSync(previewDir);
      for (const file of files) {
        const fullPath = path.join(previewDir, file);
        if (fs.statSync(fullPath).isFile() && (file.endsWith('.png') || file.endsWith('.jpg'))) {
          try { fs.unlinkSync(fullPath); } catch (e) {}
        }
      }
    }
    console.log('Cleaned generated certificate PDFs and PNG previews from storage.');

    // 3. Ensure Master SM GROUPS Admin exists
    let smAdmin = await User.findOne({ username: 'smadmin' });
    if (!smAdmin) {
      const smAdminPassword = await bcrypt.hash('adminpass', 10);
      smAdmin = await User.create({
        username: 'smadmin',
        passwordHash: smAdminPassword,
        role: 'SM_GROUPS_ADMIN'
      });
      console.log('Created SM GROUPS Master Admin (smadmin / adminpass)');
    } else {
      console.log('Preserved SM GROUPS Master Admin (smadmin)');
    }

    // 4. Ensure TNSKILLS State Admin exists
    let tnskillsAdmin = await User.findOne({ username: 'tnskillsadmin' });
    if (!tnskillsAdmin) {
      const tnskillsAdminPassword = await bcrypt.hash('tnskillspass', 10);
      tnskillsAdmin = await User.create({
        username: 'tnskillsadmin',
        passwordHash: tnskillsAdminPassword,
        role: 'TNSKILLS_ADMIN'
      });
      console.log('Created TNSKILLS Admin (tnskillsadmin / tnskillspass)');
    } else {
      console.log('Preserved TNSKILLS Admin (tnskillsadmin)');
    }

    // 5. Ensure Standard 3 Colleges and their Admins exist
    const collegesData = [
      { name: 'ABC Engineering College', code: 'ABCENG', adminUsername: 'abcadmin' },
      { name: 'XYZ College of Technology', code: 'XYZTECH', adminUsername: 'xyzadmin' },
      { name: 'DEF Institute of Engineering', code: 'DEFENG', adminUsername: 'defadmin' }
    ];

    const collegeAdminPassword = await bcrypt.hash('collegepass', 10);

    for (const cData of collegesData) {
      let college = await College.findOne({ code: cData.code });
      if (!college) {
        college = await College.create({
          name: cData.name,
          code: cData.code
        });
      }

      let adminUser = await User.findOne({ username: cData.adminUsername });
      if (!adminUser) {
        adminUser = await User.create({
          username: cData.adminUsername,
          passwordHash: collegeAdminPassword,
          role: 'COLLEGE_ADMIN',
          collegeId: college._id
        });
      }
      college.adminUserId = adminUser._id;
      await college.save();
    }
    console.log('Verified 3 standard Colleges ready for student onboarding: ABCENG, XYZTECH, DEFENG.');

    // 6. Ensure default Certificate Template exists and is active
    let template = await CertificateTemplate.findOne({ isActive: true });
    if (!template) {
      template = await CertificateTemplate.create({
        name: 'Standard Gold Border Template',
        filePath: '',
        smLogoPath: '',
        isActive: true
      });
      console.log('Created active Certificate Template.');
    }

    console.log('\n=============================================');
    console.log('DATABASE RESET COMPLETED SUCCESSFULLY!');
    console.log('All previous student and certificate data removed.');
    console.log('Ready for fresh Excel upload and logo testing!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

cleanReset();
