const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });
const connectDB = require('../config/db');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const College = require('../models/College');

async function main() {
  await connectDB();
  const colleges = await College.find();
  for (const col of colleges) {
    const studentIds = await Student.find({ collegeId: col._id }).distinct('_id');
    const certCount = await Certificate.countDocuments({
      studentId: { $in: studentIds },
      status: 'GENERATED'
    });
    console.log({
      college: col.name,
      code: col.code,
      studentCount: studentIds.length,
      generatedCertificates: certCount,
      pendingCertificates: studentIds.length - certCount
    });
  }
  const totalSt = await Student.countDocuments();
  const totalCert = await Certificate.countDocuments({ status: 'GENERATED' });
  const allCertDocCount = await Certificate.countDocuments();
  console.log({ totalStudents: totalSt, totalGeneratedCertificates: totalCert, totalCertDocumentsInDB: allCertDocCount });
  process.exit(0);
}

main().catch(console.error);
