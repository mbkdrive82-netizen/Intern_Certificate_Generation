const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const client = new MongoClient('mongodb://127.0.0.1:27017');
client.connect().then(async () => {
  const db = client.db('tnskills_db');

  // Reset GENERATED → PENDING
  const result = await db.collection('certificates').updateMany(
    { status: 'GENERATED' },
    { $set: { status: 'PENDING', filePath: null, previewImagePath: null, generatedAt: null } }
  );
  console.log('Reset count:', result.modifiedCount);

  // Delete certificate PDF and preview files
  const certDir = path.join(__dirname, 'certificates');
  let deleted = 0;
  if (fs.existsSync(certDir)) {
    fs.readdirSync(certDir).forEach(f => {
      const fp = path.join(certDir, f);
      if (fs.statSync(fp).isFile()) {
        fs.unlinkSync(fp);
        deleted++;
      }
    });
    const previews = path.join(certDir, 'previews');
    if (fs.existsSync(previews)) {
      fs.readdirSync(previews).forEach(f => {
        const fp = path.join(previews, f);
        if (fs.statSync(fp).isFile()) {
          fs.unlinkSync(fp);
          deleted++;
        }
      });
    }
  }
  console.log('Deleted files:', deleted);
  await client.close();
  console.log('Done!');
}).catch(e => console.error(e));
