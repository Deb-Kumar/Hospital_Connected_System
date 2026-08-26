const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

async function checkDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('--- DATABASE INSPECTION REPORT ---');

  const totalDepts = await Department.countDocuments({});
  const totalDoctors = await Doctor.countDocuments({});

  console.log(`TOTAL DEPARTMENTS IN DATABASE: ${totalDepts}`);
  console.log(`TOTAL DOCTORS IN DATABASE: ${totalDoctors}\n`);

  const departments = await Department.find({}).sort({ name: 1 });

  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    const docCount = await Doctor.countDocuments({ department: dept._id });
    console.log(`${i + 1}. [${dept.name}] -> ${docCount} Doctor(s)`);
  }

  console.log('----------------------------------');
  await mongoose.disconnect();
  process.exit(0);
}

checkDatabase().catch((err) => {
  console.error('Error querying DB:', err);
  process.exit(1);
});
