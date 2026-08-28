const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

async function fixBios() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db');

  await Doctor.findByIdAndUpdate('6a71d52c8aac83c29f94ccb4', {
    bio: 'Dr. Rajesh Sharma is a renowned Senior Cardiologist specializing in interventional cardiology, coronary angioplasty, and cardiac pacemaker implants with over 15 years of clinical excellence.'
  });

  await Doctor.findByIdAndUpdate('6a71d7200ab54e9cc0e27272', {
    bio: 'Dr. Ananya Roy is a distinguished Neurosurgeon with expertise in brain tumor resection, minimally invasive spine surgery, and neurovascular procedures.'
  });

  await Doctor.findByIdAndUpdate('6a8f5c7af52398c910fb997e', {
    bio: 'Dr. Keya Ghosh is a leading specialist in Hematology and Thalassaemia management, dedicated to comprehensive hemoglobinopathy care and blood disease therapy.'
  });

  const doctors = await Doctor.find().lean();
  let withBio = 0;
  doctors.forEach(d => {
    if (d.bio && d.bio.trim().length > 0) withBio++;
  });

  console.log(`UPDATED SUCCESS! TOTAL DOCTORS: ${doctors.length} | WITH BIO: ${withBio}`);
  await mongoose.disconnect();
  process.exit(0);
}

fixBios();
