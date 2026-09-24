const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const College = require('../src/models/College');

async function setAndListStandardCredentials() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Atlas DB');

    // 1. SM Groups Master Admin
    const smPass = await bcrypt.hash('adminpass', 10);
    await User.findOneAndUpdate({ username: 'smadmin' }, { passwordHash: smPass, role: 'SM_GROUPS_ADMIN' }, { upsert: true });

    // 2. TNSkills Admin
    const tnPass = await bcrypt.hash('tnskillspass', 10);
    await User.findOneAndUpdate({ username: 'tnskillsadmin' }, { passwordHash: tnPass, role: 'TNSKILLS_ADMIN' }, { upsert: true });

    // 3. AVS Engineering College Admin (aec92_admin)
    const collegePass = await bcrypt.hash('College@123', 10);
    const avsCollege = await College.findOne({ code: 'AEC92' });
    if (avsCollege) {
      let avsAdmin = await User.findOneAndUpdate(
        { username: 'aec92_admin' },
        { passwordHash: collegePass, role: 'COLLEGE_ADMIN', collegeId: avsCollege._id, isActive: true },
        { upsert: true, new: true }
      );
      avsCollege.adminUserId = avsAdmin._id;
      await avsCollege.save();
    }

    // 4. Salem College Admin (scet_admin)
    const salemCollege = await College.findOne({ code: 'SCET' });
    if (salemCollege) {
      let scetAdmin = await User.findOneAndUpdate(
        { username: 'scet_admin' },
        { passwordHash: collegePass, role: 'COLLEGE_ADMIN', collegeId: salemCollege._id, isActive: true },
        { upsert: true, new: true }
      );
      salemCollege.adminUserId = scetAdmin._id;
      await salemCollege.save();
    }

    console.log('All admin credentials standardized successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setAndListStandardCredentials();
