const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const College = require('../src/models/College');

const candidatePasswords = ['adminpass', 'tnskillspass', 'collegepass', 'Password@123', 'College@123', 'admin123', 'admin', 'password'];

async function testPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ role: { $ne: 'STUDENT' } }).select('+passwordHash').populate('collegeId').lean();

    for (const u of users) {
      console.log(`\nTesting user: ${u.username} (${u.role})`);
      let found = false;
      for (const pass of candidatePasswords) {
        const match = await bcrypt.compare(pass, u.passwordHash);
        if (match) {
          console.log(`  -> Password MATCH: "${pass}"`);
          found = true;
          break;
        }
      }
      if (!found) {
        console.log(`  -> Password not in candidates list`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testPasswords();
