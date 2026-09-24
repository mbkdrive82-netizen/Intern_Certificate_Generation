const dotenv = require('dotenv');
dotenv.config({ path: '../server/.env' });
const connectDB = require('../server/src/config/db');
const { generateBulkCertificates } = require('../server/src/services/certificateService');
const Certificate = require('../server/src/models/Certificate');
const Student = require('../server/src/models/Student');

async function main() {
  await connectDB();
  console.log('Connected to MongoDB Atlas');

  const count = await Student.countDocuments();
  console.log(`Total students in DB: ${count}`);

  console.log('Generating all certificates with Base64 previews...');
  const res = await generateBulkCertificates({}, { regenerate: true });
  console.log('Bulk Generation Result:', res);

  const certs = await Certificate.find({ status: 'GENERATED' });
  console.log(`Successfully generated in Atlas: ${certs.length}`);
  if (certs.length > 0) {
    const sample = certs[0];
    console.log(`Sample Cert ID: ${sample.certificateId}`);
    console.log(`Sample Preview starts with: ${sample.previewImagePath.slice(0, 35)}... (Length: ${sample.previewImagePath.length})`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
