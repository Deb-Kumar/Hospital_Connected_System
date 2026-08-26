const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

async function cleanUnusedDepartments() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('--- CLEANING UNUSED / DUPLICATE DEPARTMENTS ---');

  const departments = await Department.find({});
  let removedCount = 0;

  for (const dept of departments) {
    const docCount = await Doctor.countDocuments({ department: dept._id });
    if (docCount === 0) {
      await Department.findByIdAndDelete(dept._id);
      removedCount++;
      console.log(`❌ Removed empty legacy department: ${dept.name}`);
    }
  }

  const remainingDepts = await Department.countDocuments({});
  const totalDoctors = await Doctor.countDocuments({});

  console.log(`\n✅ Cleaned up ${removedCount} empty legacy department(s).`);
  console.log(`📊 TOTAL ACTIVE DEPARTMENTS IN DATABASE: ${remainingDepts}`);
  console.log(`👨‍⚕️ TOTAL ACTIVE DOCTORS IN DATABASE: ${totalDoctors}`);
  console.log('------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

cleanUnusedDepartments().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
