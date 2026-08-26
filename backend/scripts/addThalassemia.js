const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

async function seedThalassemia() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Atlas...');

  const deptName = 'Thalassaemia & Haemoglobinopathies';
  let dept = await Department.findOne({ name: { $regex: new RegExp('^' + deptName + '$', 'i') } });

  if (!dept) {
    dept = await Department.create({
      name: deptName,
      description: 'Specialized Blood Care, Thalassemia Control & Hemoglobin Disorder Therapy',
      consultationFee: 750,
      active: true,
    });
    console.log(`✓ Created Department: ${dept.name}`);
  } else {
    dept.name = deptName;
    await dept.save();
    console.log(`ℹ Department found/updated: ${dept.name}`);
  }

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  const doctors = [
    {
      fullName: 'Dr. Sourav Sengupta',
      qualification: 'MD (Pediatrics), DM (Pediatric Hematology-Oncology)',
      specialization: 'Thalassemia & Hemoglobinopathy Management',
      experienceYears: 14,
      consultationFee: 800,
      phone: '9830366001',
      email: 'dr.sourav.sengupta@brainwarehospital.edu.in',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      bio: 'Pediatric Hematologist specializing in iron overload chelation, thalassemia transfusion protocols, and bone marrow transplantation.',
      availabilitySchedule: 'MON:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00',
    },
    {
      fullName: 'Dr. Tanushree Roy',
      qualification: 'MD (Internal Medicine), DNB (Clinical Hematology)',
      specialization: 'Adult Thalassemia & Sickle Cell Care',
      experienceYears: 11,
      consultationFee: 750,
      phone: '9830366002',
      email: 'dr.tanushree.roy@brainwarehospital.edu.in',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400',
      bio: 'Clinical Hematologist dedicated to sickle cell anemia therapy, hemoglobinopathy screening, and prenatal counseling.',
      availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00',
    },
  ];

  for (const docData of doctors) {
    let doc = await Doctor.findOne({ email: docData.email });
    if (!doc) {
      doc = await Doctor.create({
        fullName: docData.fullName,
        email: docData.email,
        phone: docData.phone,
        password: defaultPasswordHash,
        role: 'DOCTOR',
        department: dept._id,
        qualification: docData.qualification,
        specialization: docData.specialization,
        experienceYears: docData.experienceYears,
        consultationFee: docData.consultationFee,
        avatarUrl: docData.avatarUrl,
        profileImage: docData.avatarUrl,
        bio: docData.bio,
        availabilitySchedule: docData.availabilitySchedule,
        approvalStatus: 'APPROVED',
        active: true,
        emailVerified: true,
        phoneVerified: true,
      });
      console.log(`   + Added Doctor: ${doc.fullName} (${dept.name})`);
    } else {
      doc.department = dept._id;
      doc.avatarUrl = docData.avatarUrl;
      doc.profileImage = docData.avatarUrl;
      doc.approvalStatus = 'APPROVED';
      doc.active = true;
      await doc.save();
      console.log(`   ~ Updated Doctor: ${doc.fullName}`);
    }
  }

  const totalDepts = await Department.countDocuments({});
  const totalDoctors = await Doctor.countDocuments({});
  console.log(`\n🎉 Success! Added ${dept.name} with 2 Doctors.`);
  console.log(`📊 Total Departments: ${totalDepts} | Total Doctors: ${totalDoctors}`);

  await mongoose.disconnect();
  process.exit(0);
}

seedThalassemia().catch((err) => {
  console.error('Error adding department:', err);
  process.exit(1);
});
