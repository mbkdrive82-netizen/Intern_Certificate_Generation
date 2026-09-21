const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/tnskills_db';

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (primaryError) {
    console.warn(`[MongoDB Primary Connection Warning]: ${primaryError.message}`);
    console.log(`[MongoDB Fallback]: Connecting to local MongoDB instance...`);
    try {
      const conn = await mongoose.connect(fallbackUri);
      console.log(`[MongoDB Fallback Connected]: ${conn.connection.host}/${conn.connection.name}`);
    } catch (fallbackError) {
      console.error(`[MongoDB Connection Error]: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
