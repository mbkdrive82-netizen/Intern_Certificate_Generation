const http = require('http');

async function testFilter() {
  const loginData = JSON.stringify({ username: 'smadmin', password: 'password123' });
  
  const loginReq = http.request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      const data = JSON.parse(raw);
      const token = data.token;
      console.log('Login success:', !!token);

      // Fetch colleges
      http.get({
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/admin/colleges',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (colRes) => {
        let colRaw = '';
        colRes.on('data', c => colRaw += c);
        colRes.on('end', () => {
          const colData = JSON.parse(colRaw);
          console.log('Colleges:', colData.colleges?.map(c => ({ id: c._id, name: c.name })));
          const avs = colData.colleges?.find(c => c.name.includes('AVS'));
          if (avs) {
            console.log('Testing filter for AVS ID:', avs._id);
            http.get({
              hostname: '127.0.0.1',
              port: 5000,
              path: `/api/admin/certificates?collegeId=${avs._id}`,
              headers: { 'Authorization': `Bearer ${token}` }
            }, (certRes) => {
              let certRaw = '';
              certRes.on('data', c => certRaw += c);
              certRes.on('end', () => {
                const certData = JSON.parse(certRaw);
                console.log('Filtered Certificates count:', certData.certificates?.length, 'Total:', certData.pagination?.total);
                if (certData.certificates?.length > 0) {
                  console.log('First cert student college:', certData.certificates[0].studentId?.collegeId?.name);
                }
              });
            });
          }
        });
      });
    });
  });

  loginReq.write(loginData);
  loginReq.end();
}

testFilter();
