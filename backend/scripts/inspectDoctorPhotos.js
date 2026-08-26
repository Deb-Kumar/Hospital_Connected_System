const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

async function inspectDoctorPhotos() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);

  const doctors = await Doctor.find().limit(10);
  console.log(`Inspecting first 10 doctors in database:`);
  doctors.forEach((d, i) => {
    console.log(`${i + 1}. ${d.fullName} ➔ avatarUrl: ${d.avatarUrl} | profileImage: ${d.profileImage}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

inspectDoctorPhotos();
