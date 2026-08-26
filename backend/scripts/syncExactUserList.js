const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

// User's exact 34 department list mapping with clean titles & doctor definitions
const USER_LIST = [
  { slug: 'CARDIO-THORACIC-SURGERY', title: 'Cardio Thoracic Surgery', aliases: ['Cardiothoracic Surgery'] },
  { slug: 'CARDIOLOGY', title: 'Cardiology', aliases: ['Cardiology'] },
  { slug: 'CHILD-GUIDANCE-CLINIC', title: 'Child Guidance Clinic', aliases: ['Child Guidance Clinic'] },
  { slug: 'DENTAL', title: 'Dental', aliases: ['Dentistry', 'Dentistry & Maxillofacial Surgery'] },
  { slug: 'DERMATOLOGY', title: 'Dermatology', aliases: ['Dermatology'] },
  { slug: 'DIABETOLOGY-ENDOCRINOLOGY', title: 'Diabetology & Endocrinology', aliases: ['Endocrinology'] },
  { slug: 'ENT', title: 'ENT', aliases: ['ENT (Otolaryngology)'] },
  { slug: 'GASTRO-SURGERY', title: 'Gastro Surgery', aliases: ['Gastroenterology'] },
  { slug: 'GASTROENTEROLOGY', title: 'Gastroenterology', aliases: ['Gastroenterology'] },
  { slug: 'GENERAL-MEDICINE', title: 'General Medicine', aliases: ['General Medicine'] },
  { slug: 'GENERAL-SURGERY', title: 'General Surgery', aliases: ['General Surgery'] },
  { slug: 'GYNAE-ONCOLOGY', title: 'Gynae Oncology', aliases: ['Gynae Oncology'] },
  { slug: 'GYNAECOLOGY', title: 'Gynaecology', aliases: ['Gynecology & Obstetrics'] },
  { slug: 'HAEMATOLOGY', title: 'Haematology', aliases: ['Hematology'] },
  { slug: 'NEPHROLOGY', title: 'Nephrology', aliases: ['Nephrology'] },
  { slug: 'NEURO-MEDICINE', title: 'Neuro Medicine', aliases: ['Neurology'] },
  { slug: 'NEURO-SURGERY', title: 'Neuro Surgery', aliases: ['Neurosurgery'] },
  { slug: 'NUCLEAR-MEDICINE', title: 'Nuclear Medicine', aliases: ['Nuclear Medicine & PET Scan'] },
  { slug: 'ONCO-SURGERY', title: 'Onco Surgery', aliases: ['Surgical Oncology'] },
  { slug: 'ONCOLOGY', title: 'Oncology', aliases: ['Oncology & Cancer Care'] },
  { slug: 'ONCOLOGY-TEAM', title: 'Oncology Team', aliases: ['Oncology & Cancer Care'] },
  { slug: 'ORTHOPAEDICS', title: 'Orthopaedics', aliases: ['Orthopedics'] },
  { slug: 'PAEDIATRIC-NEPHROLOGY', title: 'Paediatric Nephrology', aliases: ['Pediatric Nephrology'] },
  { slug: 'PAEDIATRIC-ORTHOPAEDICS', title: 'Paediatric Orthopaedics', aliases: ['Pediatric Orthopedics'] },
  { slug: 'PAEDIATRIC-SURGERY', title: 'Paediatric Surgery', aliases: ['Pediatric Surgery'] },
  { slug: 'PAEDIATRICS', title: 'Paediatrics', aliases: ['Pediatrics'] },
  { slug: 'PHYSICAL-MEDICINE', title: 'Physical Medicine', aliases: ['Physical Medicine & Rehabilitation'] },
  { slug: 'PLASTIC-SURGERY', title: 'Plastic Surgery', aliases: ['Plastic & Reconstructive Surgery'] },
  { slug: 'PSYCHIATRY', title: 'Psychiatry', aliases: ['Psychiatry & Mental Health'] },
  { slug: 'RADIATION-ONCOLOGY', title: 'Radiation Oncology', aliases: ['Radiation Oncology'] },
  { slug: 'RESP-MEDICINE-ALLERGY', title: 'Respiratory Medicine & Allergy', aliases: ['Pulmonology'] },
  { slug: 'RHEUMATOLOGY', title: 'Rheumatology', aliases: ['Rheumatology'] },
  { slug: 'THALASSAEMIA-HAEMOGLOBINOPATHIES', title: 'Thalassaemia & Haemoglobinopathies', aliases: ['Thalassaemia & Haemoglobinopathies'] },
  { slug: 'UROLOGY', title: 'Urology', aliases: ['Urology'] }
];

async function syncDepartments() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('--- SYNCING USER SPECIFIED DEPARTMENTS & DOCTORS ---');

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  let existingCount = 0;
  let newlyAddedDepts = 0;
  let newlyAddedDocs = 0;

  for (let i = 0; i < USER_LIST.length; i++) {
    const item = USER_LIST[i];
    
    // Find if department exists under title or any aliases
    let dept = await Department.findOne({
      $or: [
        { name: new RegExp('^' + item.title + '$', 'i') },
        ...item.aliases.map(a => ({ name: new RegExp('^' + a + '$', 'i') }))
      ]
    });

    if (!dept) {
      dept = await Department.create({
        name: item.title,
        description: `Specialized ${item.title} Clinical Department`,
        consultationFee: 700,
        active: true
      });
      newlyAddedDepts++;
      console.log(`[NEW DEPT] Created (${i + 1}/34): ${dept.name}`);
    }

    // Check doctor count for this department
    let docs = await Doctor.find({ department: dept._id });
    if (docs.length >= 2) {
      existingCount++;
      console.log(`[OK] (${i + 1}/34) ${dept.name} -> ${docs.length} Doctor(s) present`);
    } else {
      // Seed missing doctors so at least 2 are present
      const needed = 2 - docs.length;
      console.log(`[SEEDING] (${i + 1}/34) ${dept.name} needs ${needed} doctor(s)...`);
      
      const docTemplates = [
        {
          name: `Dr. ${item.title.split(' ')[0]} Specialist A`,
          email: `dr.${item.slug.toLowerCase().replace(/[^a-z0-9]/g, '')}.a@brainwarehospital.edu.in`,
          phone: `983${String(i + 10).padStart(2, '0')}00101`,
          qual: `MD, DM (${item.title})`,
          spec: `${item.title} Care & Surgery`,
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'
        },
        {
          name: `Dr. ${item.title.split(' ')[0]} Specialist B`,
          email: `dr.${item.slug.toLowerCase().replace(/[^a-z0-9]/g, '')}.b@brainwarehospital.edu.in`,
          phone: `983${String(i + 10).padStart(2, '0')}00102`,
          qual: `MS, DNB (${item.title})`,
          spec: `Advanced ${item.title} Diagnostics`,
          avatar: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400'
        }
      ];

      for (let k = docs.length; k < 2; k++) {
        const template = docTemplates[k];
        await Doctor.create({
          fullName: template.name,
          email: template.email,
          phone: template.phone,
          password: defaultPasswordHash,
          role: 'DOCTOR',
          department: dept._id,
          qualification: template.qual,
          specialization: template.spec,
          experienceYears: 10 + k * 3,
          consultationFee: 700,
          avatarUrl: template.avatar,
          profileImage: template.avatar,
          bio: `Specialist in ${item.title} at Brainware Medical College & Hospital.`,
          availabilitySchedule: 'MON:09:00-14:00,WED:09:00-14:00,FRI:09:00-14:00',
          approvalStatus: 'APPROVED',
          active: true,
          emailVerified: true,
          phoneVerified: true
        });
        newlyAddedDocs++;
        console.log(`   + Added Doctor: ${template.name}`);
      }
    }
  }

  const finalDeptsCount = await Department.countDocuments({});
  const finalDocsCount = await Doctor.countDocuments({});

  console.log('\n========================================');
  console.log(`TOTAL USER LIST ITEMS CHECKED: ${USER_LIST.length}`);
  console.log(`ALREADY HAD 2+ DOCTORS: ${existingCount}`);
  console.log(`NEW DEPARTMENTS CREATED: ${newlyAddedDepts}`);
  console.log(`NEW DOCTORS CREATED: ${newlyAddedDocs}`);
  console.log(`TOTAL DEPARTMENTS IN DB: ${finalDeptsCount}`);
  console.log(`TOTAL DOCTORS IN DB: ${finalDocsCount}`);
  console.log('========================================');

  await mongoose.disconnect();
  process.exit(0);
}

syncDepartments().catch((err) => {
  console.error('Error syncing user list:', err);
  process.exit(1);
});
