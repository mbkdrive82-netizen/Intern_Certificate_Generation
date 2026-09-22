const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tnskills_db').then(async () => {
  const Student = mongoose.model('Student', new mongoose.Schema({
    name: String,
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    college: String
  }));
  const College = mongoose.model('College', new mongoose.Schema({ name: String, code: String }));

  const sample = await Student.findOne().populate('collegeId');
  console.log('Sample Student:', {
    name: sample.name,
    collegeId_ref: sample.collegeId,
    college_string: sample.college
  });

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
