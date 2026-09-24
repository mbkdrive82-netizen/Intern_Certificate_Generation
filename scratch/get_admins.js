const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });
const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(async () => {
  const College = mongoose.model('College', new mongoose.Schema({ name: String, code: String }));
  const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    role: String,
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    active: Boolean
  }));

  const users = await User.find({ role: { $in: ['SM_GROUPS_ADMIN', 'TNSKILLS_ADMIN', 'COLLEGE_ADMIN'] } }).populate('collegeId').lean();
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
