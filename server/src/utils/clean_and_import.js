const path = require('path');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { processStudentExcel } = require('../services/excelService');

async function main() {
  await connectDB();
  console.log('Cleaning database...');
  await Student.deleteMany({});
  await User.deleteMany({ role: 'STUDENT' });
  await Certificate.deleteMany({});

  const excelPath = path.join(__dirname, '../../../56_students_ready_for_upload.xlsx');
  console.log(`Processing file: ${excelPath}`);

  const res = await processStudentExcel(excelPath, { createMissingColleges: true });
  console.log('IMPORT RESULT:', {
    totalRows: res.totalRows,
    successful: res.successful,
    duplicates: res.duplicates,
    failed: res.failed,
    failedRows: res.failedRows
  });

  const finalCount = await Student.countDocuments();
  console.log(`TOTAL STUDENTS IN DB NOW: ${finalCount}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
