const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tnskills_db').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ username: String, role: String }));
  const users = await User.find();
  console.log('Users in DB:', users.map(u => ({ username: u.username, role: u.role })));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
