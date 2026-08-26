const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

async function mergeEnt() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);

  const entFull = await Department.findOne({ name: 'ENT (Otolaryngology)' });
  const entShort = await Department.findOne({ name: 'ENT' });

  if (entShort && entFull) {
    await Doctor.updateMany({ department: entShort._id }, { department: entFull._id });
    await Department.findByIdAndDelete(entShort._id);
    console.log('Successfully merged ENT into ENT (Otolaryngology).');
  }

  const finalDepts = await Department.find({}).sort({ name: 1 });
  console.log(`\nTOTAL ACTIVE DEPARTMENTS: ${finalDepts.length}`);
  finalDepts.forEach((d, i) => console.log(`${i + 1}. ${d.name}`));

  await mongoose.disconnect();
  process.exit(0);
}

mergeEnt().catch(console.error);
