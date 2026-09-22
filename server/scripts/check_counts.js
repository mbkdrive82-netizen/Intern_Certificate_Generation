const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tnskills_db').then(async () => {
  const College = mongoose.model('College', new mongoose.Schema({ name: String, code: String }));
  const Student = mongoose.model('Student', new mongoose.Schema({ name: String, collegeId: mongoose.Schema.Types.ObjectId }));
  const Certificate = mongoose.model('Certificate', new mongoose.Schema({ certificateId: String, studentId: mongoose.Schema.Types.ObjectId, status: String }));

  const colleges = await College.find();
  console.log('--- Colleges Summary ---');
  for (const c of colleges) {
    const studentCount = await Student.countDocuments({ collegeId: c._id });
    const students = await Student.find({ collegeId: c._id }).select('_id');
    const certCount = await Certificate.countDocuments({ studentId: { $in: students.map(s => s._id) } });
    console.log(`College: ${c.name} (ID: ${c._id}) -> Students: ${studentCount}, Generated Certs: ${certCount}`);
  }

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
