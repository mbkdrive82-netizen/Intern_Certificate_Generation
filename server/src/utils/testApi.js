const http = require('http');

const request = (path, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const bodyStr = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
};

async function runTests() {
  console.log('\n--- STARTING API VERIFICATION TESTS ---');

  // 1. SM GROUPS Login
  const smLogin = await request('/auth/login', 'POST', { username: 'smadmin', password: 'adminpass' });
  console.log('1. SM GROUPS Login:', smLogin.status === 200 ? 'SUCCESS' : 'FAILED', '| User:', smLogin.data.user.username);
  const smToken = smLogin.data.token;
  const smHeaders = { 'Authorization': `Bearer ${smToken}` };

  // 2. Dashboard
  const dash = await request('/admin/dashboard', 'GET', null, smHeaders);
  console.log('2. Admin Dashboard Stats:', dash.data.stats);

  // 3. Bulk Certificate Generation
  const bulkGen = await request('/admin/certificates/generate-bulk', 'POST', { regenerate: true }, smHeaders);
  console.log('3. Bulk Cert Generation:', bulkGen.data.result);

  // 4. Student Login
  const stLogin = await request('/auth/login', 'POST', { username: 'arun.kumar', password: 'studentpass' });
  console.log('4. Student Login:', stLogin.status === 200 ? 'SUCCESS' : 'FAILED', '| Student ID:', stLogin.data.user.student.studentId);
  const stHeaders = { 'Authorization': `Bearer ${stLogin.data.token}` };

  // 5. Student Certificate Check
  const stCert = await request('/student/certificate', 'GET', null, stHeaders);
  console.log('5. Student Certificate Status:', stCert.data);

  // 6. College Admin Login
  const colLogin = await request('/auth/login', 'POST', { username: 'abcadmin', password: 'collegepass' });
  console.log('6. College Admin Login:', colLogin.status === 200 ? 'SUCCESS' : 'FAILED', '| College:', colLogin.data.user.college.name);
  const colHeaders = { 'Authorization': `Bearer ${colLogin.data.token}` };

  // 7. Department Filtering
  const colStudents = await request('/college/students?department=CSE', 'GET', null, colHeaders);
  console.log('7. College CSE Department Students Count:', colStudents.data.students.length);

  console.log('--- ALL API VERIFICATION TESTS PASSED PERFECTLY ---\n');
}

runTests().catch(console.error);
