const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

async function mergeNeuro() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);

  const neuroSurgeryTarget = await Department.findOne({ name: 'Neurosurgery' });
  const oldNeuro = await Department.findOne({ name: 'Neuro Surgery' });

  if (oldNeuro && neuroSurgeryTarget) {
    await Doctor.updateMany({ department: oldNeuro._id }, { department: neuroSurgeryTarget._id });
    await Department.findByIdAndDelete(oldNeuro._id);
    console.log('Successfully merged Neuro Surgery into Neurosurgery.');
  }

  const remainingDepts = await Department.countDocuments({});
  const totalDoctors = await Doctor.countDocuments({});
  console.log(`EXACT DEPARTMENTS IN DATABASE: ${remainingDepts}`);
  console.log(`EXACT DOCTORS IN DATABASE: ${totalDoctors}`);

  await mongoose.disconnect();
  process.exit(0);
}

mergeNeuro().catch(console.error);
