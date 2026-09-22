const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tnskills_db').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ username: String, role: String }));
  const College = mongoose.model('College', new mongoose.Schema({ name: String }));

  const admin = await User.findOne({ username: 'smadmin' });
  const avs = await College.findOne({ name: /AVS/i });
  const paavai = await College.findOne({ name: /Paavai/i });

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    'tnskills_super_secret_jwt_key_2026_master',
    { expiresIn: '1d' }
  );

  // 1. Test AVS Filter
  const reqAvs = http.request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/certificates?collegeId=${avs._id}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const json = JSON.parse(body);
      console.log('--- AVS Filter Result ---');
      console.log('Success:', json.success);
      console.log('Total:', json.pagination?.total);
      console.log('First student college:', json.certificates?.[0]?.studentId?.collegeId?.name);

      // 2. Test Paavai Filter
      const reqPaavai = http.request({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/certificates?collegeId=${paavai._id}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res2) => {
        let body2 = '';
        res2.on('data', chunk => body2 += chunk);
        res2.on('end', () => {
          const json2 = JSON.parse(body2);
          console.log('--- Paavai Filter Result ---');
          console.log('Success:', json2.success);
          console.log('Total:', json2.pagination?.total);
          process.exit(0);
        });
      });
      reqPaavai.end();
    });
  });

  reqAvs.end();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
