const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../server/.env') });
const connectDB = require('../../server/src/config/db');
const Student = require('../../server/src/models/Student');
const Certificate = require('../../server/src/models/Certificate');
const College = require('../../server/src/models/College');

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
