const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });
const connectDB = require('../config/db');
const Certificate = require('../models/Certificate');
const Student = require('../models/Student');

async function cleanOrphans() {
  await connectDB();
  const students = await Student.find().select('_id');
  const studentIds = students.map(s => s._id.toString());

  const allCerts = await Certificate.find();
  console.log(`Total certs in DB: ${allCerts.length}`);

  let deleted = 0;
  for (const cert of allCerts) {
    if (!cert.studentId || !studentIds.includes(cert.studentId.toString())) {
      await Certificate.findByIdAndDelete(cert._id);
      deleted++;
    }
  }

  console.log(`Deleted ${deleted} orphaned certificates.`);
  const finalCerts = await Certificate.find();
  console.log(`Remaining valid certs: ${finalCerts.length}`);
  for (const c of finalCerts) {
    console.log(`Cert ${c.certificateId}: preview isBase64 = ${c.previewImagePath ? c.previewImagePath.startsWith('data:image') : false}`);
  }

  process.exit(0);
}

cleanOrphans().catch(console.error);
