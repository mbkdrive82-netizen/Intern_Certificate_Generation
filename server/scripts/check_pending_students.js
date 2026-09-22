const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tnskills_db').then(async () => {
  const Student = mongoose.model('Student', new mongoose.Schema({
    name: String,
    studentId: String,
    collegeId: mongoose.Schema.Types.ObjectId,
    certificateGenerated: Boolean
  }));
  const College = mongoose.model('College', new mongoose.Schema({ name: String }));
  const Certificate = mongoose.model('Certificate', new mongoose.Schema({
    studentId: mongoose.Schema.Types.ObjectId,
    status: String
  }));

  const colleges = await College.find();
  for (const col of colleges) {
    const students = await Student.find({ collegeId: col._id });
    const certs = await Certificate.find({ studentId: { $in: students.map(s => s._id) } });
    const certStudentIds = new Set(certs.map(c => c.studentId.toString()));
    const missing = students.filter(s => !certStudentIds.has(s._id.toString()));

    console.log(`\nCollege: ${col.name}`);
    console.log(`Total Students: ${students.length}`);
    console.log(`Certificates in DB: ${certs.length}`);
    console.log(`Students pending generation: ${missing.length}`);
    missing.forEach(m => console.log(` - ${m.name} (${m.studentId})`));
  }

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
