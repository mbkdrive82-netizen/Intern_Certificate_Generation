const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const connectDB = async () => {
  const defaultAtlasUri = 'mongodb+srv://thesmgroups43_db_user:fJuUt90QnQX9SV0n@cluster0.bohnbd6.mongodb.net/tnskills_db?retryWrites=true&w=majority&appName=Cluster0';
  
  let primaryUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim().replace(/^["']|["']$/g, '') : defaultAtlasUri;

  if (!primaryUri || (!primaryUri.startsWith('mongodb://') && !primaryUri.startsWith('mongodb+srv://'))) {
    console.warn(`[MongoDB Notice]: Provided URI is invalid, using default MongoDB Atlas Cluster...`);
    primaryUri = defaultAtlasUri;
  }

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (primaryError) {
    console.warn(`[MongoDB Primary Connection Warning]: ${primaryError.message}`);
    console.log(`[MongoDB Retrying]: Connecting to default Atlas Cluster...`);
    try {
      const conn = await mongoose.connect(defaultAtlasUri);
      console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    } catch (fallbackError) {
      console.error(`[MongoDB Connection Error]: ${fallbackError.message}`);
    }
  }
};

module.exports = connectDB;
