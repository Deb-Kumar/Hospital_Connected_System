const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

async function ensure44() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);

  const deptName = 'Reproductive Medicine & IVF';
  let dept = await Department.findOne({ name: deptName });
  if (!dept) {
    dept = await Department.create({
      name: deptName,
      description: 'Fertility Treatment, Reproductive Health & IVF Therapy',
      consultationFee: 900,
      active: true,
    });
    console.log(`Created 44th Department: ${dept.name}`);

    const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
    await Doctor.create({
      fullName: 'Dr. Reena Sen',
      email: 'dr.reena.sen@brainwarehospital.edu.in',
      phone: '9830440001',
      password: defaultPasswordHash,
      role: 'DOCTOR',
      department: dept._id,
      qualification: 'MD (OB-GYN), Fellowship IVF',
      specialization: 'Reproductive Medicine & Infertility',
      experienceYears: 12,
      consultationFee: 900,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400',
      profileImage: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400',
      bio: 'Fertility Specialist expert in IVF, IUI, and reproductive endocrinology.',
      availabilitySchedule: 'MON:10:00-14:00,WED:10:00-14:00,FRI:10:00-14:00',
      approvalStatus: 'APPROVED',
      active: true,
    });

    await Doctor.create({
      fullName: 'Dr. Soumyajit Paul',
      email: 'dr.soumyajit.paul@brainwarehospital.edu.in',
      phone: '9830440002',
      password: defaultPasswordHash,
      role: 'DOCTOR',
      department: dept._id,
      qualification: 'MS (OB-GYN), DNB',
      specialization: 'Clinical Embryology & Reproductive Health',
      experienceYears: 10,
      consultationFee: 900,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      bio: 'Reproductive Medicine Specialist focused on male & female infertility care.',
      availabilitySchedule: 'TUE:09:00-13:00,THU:09:00-13:00,SAT:09:00-13:00',
      approvalStatus: 'APPROVED',
      active: true,
    });
  }

  const finalDepts = await Department.find({}).sort({ name: 1 });
  console.log(`\n========================================`);
  console.log(`EXACT TOTAL ACTIVE DEPARTMENTS: ${finalDepts.length}`);
  console.log(`========================================`);

  await mongoose.disconnect();
  process.exit(0);
}

ensure44().catch(console.error);
