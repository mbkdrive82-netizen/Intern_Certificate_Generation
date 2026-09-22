const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tnskills_db').then(async () => {
  const Student = mongoose.model('Student', new mongoose.Schema({ collegeId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId }));
  const User = mongoose.model('User', new mongoose.Schema({ collegeId: mongoose.Schema.Types.ObjectId, role: String }));
  const College = mongoose.model('College', new mongoose.Schema({ name: String }));
  const Certificate = mongoose.model('Certificate', new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId }));

  const paavai = await College.findOne({ name: /Paavai/i });
  if (paavai) {
    const students = await Student.find({ collegeId: paavai._id });
    const studentUserIds = students.map(s => s.userId).filter(Boolean);
    const studentIds = students.map(s => s._id);

    await Certificate.deleteMany({ studentId: { $in: studentIds } });
    await User.deleteMany({ _id: { $in: studentUserIds }, role: 'STUDENT' });
    const delRes = await Student.deleteMany({ collegeId: paavai._id });
    console.log('Cleaned Paavai students for fresh upload by user. Total removed:', delRes.deletedCount);
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
