const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const request = (urlPath, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const bodyStr = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api' + urlPath,
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

async function auditAllFlows() {
  console.log('========================================================');
  console.log('🔍 FULL-STACK END-TO-END FLOW & CODE AUDIT STARTING');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`, details ? `-> ${details}` : '');
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details ? `-> ${details}` : '');
      failed++;
    }
  };

  // FLOW 1: SM GROUPS MASTER ADMIN
  console.log('\n--- 1. AUDITING SM GROUPS MASTER ADMIN FLOW ---');
  const smLogin = await request('/auth/login', 'POST', { username: 'smadmin', password: 'adminpass' });
  assert(smLogin.status === 200 && smLogin.data.success, 'SM Admin Login', `Role: ${smLogin.data?.user?.role}`);
  const smHeaders = { 'Authorization': `Bearer ${smLogin.data?.token}` };

  const smDash = await request('/admin/dashboard', 'GET', null, smHeaders);
  assert(smDash.status === 200 && smDash.data.success, 'Admin Dashboard Stats', `Students: ${smDash.data?.stats?.totalStudents}, Certs: ${smDash.data?.stats?.totalCertificates}`);

  const smStudents = await request('/admin/students?page=1&limit=10', 'GET', null, smHeaders);
  assert(smStudents.status === 200 && smStudents.data.students?.length > 0, 'Admin Students Pagination', `Retrieved ${smStudents.data?.students?.length} students`);

  const smCompanies = await request('/admin/companies', 'GET', null, smHeaders);
  assert(smCompanies.status === 200 && smCompanies.data.companies?.length > 0, 'Admin Sub-Companies List', `Found ${smCompanies.data?.companies?.length} companies`);

  const smGenStatus = await request('/admin/certificates/bulk-progress', 'GET', null, smHeaders);
  assert(smGenStatus.status === 200 && smGenStatus.data.success, 'Certificate Generation Bulk Progress API', `inProgress: ${smGenStatus.data?.progress?.inProgress}`);

  // FLOW 2: TNSKILLS MONITORING ADMIN
  console.log('\n--- 2. AUDITING TNSKILLS MONITORING FLOW ---');
  const tnLogin = await request('/auth/login', 'POST', { username: 'tnskillsadmin', password: 'tnskillspass' });
  assert(tnLogin.status === 200 && tnLogin.data.success, 'TNSkills Admin Login', `Role: ${tnLogin.data?.user?.role}`);
  const tnHeaders = { 'Authorization': `Bearer ${tnLogin.data?.token}` };

  const tnDash = await request('/tnskills/dashboard', 'GET', null, tnHeaders);
  assert(tnDash.status === 200 && tnDash.data.success, 'TNSkills Dashboard API', `Colleges: ${tnDash.data?.colleges?.length}, Total Students: ${tnDash.data?.stats?.totalStudents}`);

  const tnColleges = await request('/tnskills/colleges', 'GET', null, tnHeaders);
  assert(tnColleges.status === 200 && tnColleges.data.colleges?.length > 0, 'TNSkills Colleges List API', `Colleges found: ${tnColleges.data?.colleges?.length}`);

  if (tnColleges.data?.colleges?.length > 0) {
    const firstCol = tnColleges.data.colleges[0];
    const colDetail = await request(`/tnskills/colleges/${firstCol._id}`, 'GET', null, tnHeaders);
    assert(colDetail.status === 200 && colDetail.data.success, 'TNSkills College Detail API', `College: ${colDetail.data?.college?.name}`);

    const colStudents = await request(`/tnskills/colleges/${firstCol._id}/students?page=1&limit=5`, 'GET', null, tnHeaders);
    assert(colStudents.status === 200 && colStudents.data.students?.length > 0, 'TNSkills College Students API', `Students retrieved: ${colStudents.data?.students?.length}`);
  }

  // FLOW 3: COLLEGE ADMIN
  console.log('\n--- 3. AUDITING COLLEGE ADMIN FLOW ---');
  const colLogin = await request('/auth/login', 'POST', { username: 'abcadmin', password: 'collegepass' });
  assert(colLogin.status === 200 && colLogin.data.success, 'College Admin Login', `College: ${colLogin.data?.user?.college?.name}`);
  const colHeaders = { 'Authorization': `Bearer ${colLogin.data?.token}` };

  const colDash = await request('/college/dashboard', 'GET', null, colHeaders);
  assert(colDash.status === 200 && colDash.data.success, 'College Dashboard API', `Students: ${colDash.data?.stats?.totalStudents}`);

  const colDeptStudents = await request('/college/students?department=CSE', 'GET', null, colHeaders);
  assert(colDeptStudents.status === 200 && colDeptStudents.data.success, 'College Department Filter (CSE)', `Count: ${colDeptStudents.data?.students?.length}`);

  // FLOW 4: STUDENT PORTAL (DYNAMIC RETRIEVAL OF REAL STUDENT CREDENTIALS)
  console.log('\n--- 4. AUDITING STUDENT PORTAL FLOW ---');
  await mongoose.connect('mongodb://127.0.0.1:27017/tnskills_db');
  const StudentModel = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
  const UserModel = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const sampleStudent = await StudentModel.findOne({ tempPassword: { $exists: true, $ne: '' } });
  const sampleUser = await UserModel.findById(sampleStudent.userId);

  console.log(`Testing with student user: ${sampleUser.username}`);
  const stLogin = await request('/auth/login', 'POST', { username: sampleUser.username, password: sampleStudent.tempPassword });
  assert(stLogin.status === 200 && stLogin.data.success, 'Student Login', `Name: ${stLogin.data?.user?.student?.name}`);
  const stHeaders = { 'Authorization': `Bearer ${stLogin.data?.token}` };

  const stProfile = await request('/student/profile', 'GET', null, stHeaders);
  assert(stProfile.status === 200 && stProfile.data.success, 'Student Profile API', `Department: ${stProfile.data?.student?.department}`);

  const stCert = await request('/student/certificate', 'GET', null, stHeaders);
  assert(stCert.status === 200 && stCert.data.success, 'Student Certificate API', `Status: ${stCert.data?.certificate?.status || 'Has Certificate Record'}`);

  await mongoose.disconnect();

  // FLOW 5: ASSETS & TEMPLATE VALIDATION
  console.log('\n--- 5. AUDITING ASSETS & CERTIFICATE ENGINE ---');
  const smLogoPublic = fs.existsSync(path.resolve(__dirname, '../../public/assets/sm_groups_logo.png'));
  const smLogoCerts = fs.existsSync(path.resolve(__dirname, '../certificates/assets/sm_groups_logo.png'));
  assert(smLogoPublic && smLogoCerts, 'Main SM Groups Logo Files Exist', 'Public & Certificate Assets Verified');

  const certTplHtml = fs.existsSync(path.resolve(__dirname, '../certificates/templates/certificateTemplate.html'));
  const certTplCss = fs.existsSync(path.resolve(__dirname, '../certificates/templates/certificateTemplate.css'));
  assert(certTplHtml && certTplCss, 'Certificate Template HTML/CSS Files Exist', 'Template verified');

  console.log('\n========================================================');
  console.log(`🏁 FINAL AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

auditAllFlows().catch((err) => {
  console.error('Audit Script Error:', err);
  process.exit(1);
});
