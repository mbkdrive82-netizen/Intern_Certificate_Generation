const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

async function test() {
  const uri = 'mongodb+srv://thesmgroups43_db_user:fJuUt90QnQX9SV0n@cluster0.bohnbd6.mongodb.net/tnskills_db?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  const Company = mongoose.model('Company', new mongoose.Schema({
    name: String,
    logoPath: String,
    bgImagePath: String,
    templateStyle: String
  }, { timestamps: true }));

  console.log('Testing full Company.find() with Base64...');
  let t0 = Date.now();
  const full = await Company.find().lean();
  console.log('Full find took:', Date.now() - t0, 'ms', 'Total count:', full.length);

  console.log('Testing projected Company aggregate...');
  t0 = Date.now();
  const projected = await Company.aggregate([
    {
      $project: {
        name: 1,
        templateStyle: 1,
        createdAt: 1,
        updatedAt: 1,
        hasLogo: {
          $cond: [
            { $and: [{ $ne: ['$logoPath', ''] }, { $ne: ['$logoPath', null] }] },
            true,
            false
          ]
        },
        hasBgImage: {
          $cond: [
            { $and: [{ $ne: ['$bgImagePath', ''] }, { $ne: ['$bgImagePath', null] }] },
            true,
            false
          ]
        }
      }
    },
    { $sort: { name: 1 } }
  ]);
  console.log('Projected aggregate took:', Date.now() - t0, 'ms');
  console.log('Projected result:', projected);
  process.exit(0);
}

test().catch(console.error);
