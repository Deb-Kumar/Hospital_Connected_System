const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

async function inspectDoctorPhotos() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);

  const doctors = await Doctor.find().lean();
  console.log(`Inspecting ${doctors.length} doctors...`);

  const imageCounts = new Map();
  doctors.forEach((d) => {
    const img = d.profileImage || d.avatarUrl || 'NONE';
    imageCounts.set(img, (imageCounts.get(img) || 0) + 1);
  });

  console.log('--- Image Frequency Map ---');
  for (const [img, count] of imageCounts.entries()) {
    console.log(`Count: ${count} ➔ ${img}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

inspectDoctorPhotos();
