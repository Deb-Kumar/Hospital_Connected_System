const mongoose = require('mongoose');
const dns = require('dns');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_db';
  const isAtlas = uri.includes('mongodb.net') || uri.startsWith('mongodb+srv');
  
  if (isAtlas) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {
      // Ignore if DNS server setting fails
    }
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected (${isAtlas ? 'Atlas Cloud ☁️' : 'Local 💻'}  )...✅🚀`);
  } catch (err) {
    console.warn('Primary MongoDB connection failed:', err.message);
    console.log('Starting in-memory MongoDB server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { launchTimeout: 60000 }
      });
      const mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected to In-Memory instance:', mongoUri);
    } catch (memErr) {
      console.error('In-memory MongoDB fallback also failed:', memErr.message);
      process.exit(1);
    }
  }
}

module.exports = connectDB;

