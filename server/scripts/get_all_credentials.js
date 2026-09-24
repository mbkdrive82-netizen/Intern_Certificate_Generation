const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const College = require('../src/models/College');

async function getCredentials() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Atlas DB');

    const users = await User.find({ role: { $ne: 'STUDENT' } }).populate('collegeId').lean();
    console.log('\n=== ADMIN / STAFF USERS IN DATABASE ===');
    console.log(JSON.stringify(users.map(u => ({
      username: u.username,
      role: u.role,
      college: u.collegeId ? u.collegeId.name : 'N/A',
      collegeCode: u.collegeId ? u.collegeId.code : 'N/A',
      active: u.active
    })), null, 2));

    const colleges = await College.find().populate('adminUserId').lean();
    console.log('\n=== COLLEGES & ASSOCIATED ADMINS ===');
    console.log(JSON.stringify(colleges.map(c => ({
      collegeName: c.name,
      code: c.code,
      adminUsername: c.adminUserId?.username || 'N/A'
    })), null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getCredentials();
