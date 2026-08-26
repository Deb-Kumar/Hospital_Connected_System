const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

const DEPARTMENTS = [
  {
    name: 'Cardiology',
    description: 'Heart, Vascular Care & Interventional Cardiology',
    consultationFee: 800,
    doctors: [
      {
        fullName: 'Dr. Rajesh Sharma',
        qualification: 'MD, DM (Cardiology), FACC',
        specialization: 'Interventional Cardiology',
        experienceYears: 18,
        consultationFee: 900,
        phone: '9830011001',
        email: 'dr.rajesh.sharma@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
        bio: 'Senior Consultant Interventional Cardiologist with over 18 years of experience in angioplasty, pacemaker implantation, and cardiac care.',
        availabilitySchedule: 'MON:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00',
      },
      {
        fullName: 'Dr. Ananya Roy',
        qualification: 'MD, DNB (Cardiology)',
        specialization: 'Non-Invasive Cardiology & Echocardiography',
        experienceYears: 12,
        consultationFee: 750,
        phone: '9830011002',
        email: 'dr.ananya.roy@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400&auto=format&fit=crop&q=80',
        bio: 'Specialist in preventative cardiology, 3D echocardiography, and heart failure management.',
        availabilitySchedule: 'TUE:10:00-15:00,THU:10:00-15:00,SAT:10:00-14:00',
      },
    ],
  },
  {
    name: 'Neurology',
    description: 'Brain, Spine & Nervous System Disorders',
    consultationFee: 900,
    doctors: [
      {
        fullName: 'Dr. Vikram Malhotra',
        qualification: 'MD, DM (Neurology)',
        specialization: 'Stroke & Neuro-Critical Care',
        experienceYears: 16,
        consultationFee: 1000,
        phone: '9830022001',
        email: 'dr.vikram.malhotra@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
        bio: 'Renowned neurologist specializing in acute stroke intervention, epilepsy care, and neuro-critical medicine.',
        availabilitySchedule: 'MON:10:00-14:00,TUE:10:00-14:00,THU:10:00-14:00',
      },
      {
        fullName: 'Dr. Meera Iyer',
        qualification: 'MD, DNB (Neurology)',
        specialization: 'Movement Disorders & Parkinson Care',
        experienceYears: 11,
        consultationFee: 850,
        phone: '9830022002',
        email: 'dr.meera.iyer@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
        bio: 'Expert in deep brain stimulation monitoring, Parkinson’s disease management, and migraine therapy.',
        availabilitySchedule: 'WED:09:30-13:30,FRI:09:30-13:30,SAT:09:30-13:30',
      },
    ],
  },
  {
    name: 'Orthopedics',
    description: 'Bones, Joints, Trauma & Spine Surgery',
    consultationFee: 700,
    doctors: [
      {
        fullName: 'Dr. Suresh Menon',
        qualification: 'MS (Ortho), M.Ch (Ortho - UK)',
        specialization: 'Joint Replacement & Arthroscopy',
        experienceYears: 20,
        consultationFee: 900,
        phone: '9830033001',
        email: 'dr.suresh.menon@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
        bio: 'Chief Orthopedic Surgeon with 20+ years of expertise in robotic knee replacement and hip reconstruction.',
        availabilitySchedule: 'MON:09:00-13:00,THU:09:00-13:00,FRI:09:00-13:00',
      },
      {
        fullName: 'Dr. Priya Mukherjee',
        qualification: 'MS (Ortho), Fellowship in Spine Surgery',
        specialization: 'Spine & Trauma Surgery',
        experienceYears: 13,
        consultationFee: 800,
        phone: '9830033002',
        email: 'dr.priya.mukherjee@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
        bio: 'Specialist in minimally invasive spine surgery, complex fracture trauma, and sports injury rehabilitation.',
        availabilitySchedule: 'TUE:10:00-14:00,WED:10:00-14:00,SAT:10:00-14:00',
      },
    ],
  },
  {
    name: 'Pediatrics',
    description: 'Child Healthcare, Neonatal & Pediatric Care',
    consultationFee: 600,
    doctors: [
      {
        fullName: 'Dr. Amit Patel',
        qualification: 'MD (Pediatrics), DCH',
        specialization: 'General Pediatrics & Child Immunization',
        experienceYears: 14,
        consultationFee: 650,
        phone: '9830044001',
        email: 'dr.amit.patel@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
        bio: 'Pediatrician dedicated to newborn care, childhood growth monitoring, and routine vaccination protocols.',
        availabilitySchedule: 'MON:10:00-16:00,WED:10:00-16:00,FRI:10:00-16:00',
      },
      {
        fullName: 'Dr. Kavita Verma',
        qualification: 'MD (Pediatrics), DM (Neonatology)',
        specialization: 'Neonatal Critical Care (NICU)',
        experienceYears: 10,
        consultationFee: 700,
        phone: '9830044002',
        email: 'dr.kavita.verma@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
        bio: 'Neonatologist specializing in premature baby care, intensive neonatal care, and pediatric nutrition.',
        availabilitySchedule: 'TUE:09:00-14:00,THU:09:00-14:00,SAT:09:00-14:00',
      },
    ],
  },
  {
    name: 'Gynecology & Obstetrics',
    description: "Women's Health, Maternity & Laparoscopic Surgery",
    consultationFee: 750,
    doctors: [
      {
        fullName: 'Dr. Sunita Deshmukh',
        qualification: 'MD, DNB (Obstetrics & Gynaecology)',
        specialization: 'High-Risk Pregnancy & Infertility',
        experienceYears: 19,
        consultationFee: 850,
        phone: '9830055001',
        email: 'dr.sunita.deshmukh@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400&auto=format&fit=crop&q=80',
        bio: 'Lead Obstetrician specializing in high-risk pregnancy care, painless delivery, and laparoscopic gynecological surgery.',
        availabilitySchedule: 'MON:09:30-13:30,TUE:09:30-13:30,THU:09:30-13:30',
      },
      {
        fullName: 'Dr. Pooja Mukherjee',
        qualification: 'MS (OB-GYN), Fellowship in Reproductive Medicine',
        specialization: 'Maternal Fetal Medicine & Laparoscopy',
        experienceYears: 12,
        consultationFee: 750,
        phone: '9830055002',
        email: 'dr.pooja.mukherjee@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
        bio: 'Gynecologist focused on fetal ultrasound, minimally invasive surgery, and adolescent gynecological health.',
        availabilitySchedule: 'WED:10:00-15:00,FRI:10:00-15:00,SAT:10:00-14:00',
      },
    ],
  },
  {
    name: 'Dermatology',
    description: 'Skin, Hair, Nail Disorders & Cosmetology',
    consultationFee: 650,
    doctors: [
      {
        fullName: 'Dr. Rohan Sen',
        qualification: 'MD (Dermatology, Venereology & Leprosy)',
        specialization: 'Clinical Dermatology & Laser Therapy',
        experienceYears: 11,
        consultationFee: 700,
        phone: '9830066001',
        email: 'dr.rohan.sen@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
        bio: 'Dermatologist expert in acne treatments, psoriasis care, laser skin resurfacing, and hair loss therapies.',
        availabilitySchedule: 'MON:11:00-16:00,WED:11:00-16:00,FRI:11:00-16:00',
      },
      {
        fullName: 'Dr. Ritu Banerjee',
        qualification: 'DVD, DNB (Dermatology)',
        specialization: 'Cosmetology & Anti-Aging Treatments',
        experienceYears: 9,
        consultationFee: 650,
        phone: '9830066002',
        email: 'dr.ritu.banerjee@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
        bio: 'Cosmetologist specializing in skin pigmentation remedies, chemical peels, and aesthetic skin enhancements.',
        availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00',
      },
    ],
  },
  {
    name: 'Ophthalmology',
    description: 'Eye Care, Vision Testing & Cataract Surgery',
    consultationFee: 600,
    doctors: [
      {
        fullName: 'Dr. Arvind Singhal',
        qualification: 'MS (Ophthalmology), FICO (UK)',
        specialization: 'Cataract, LASIK & Refractive Surgery',
        experienceYears: 17,
        consultationFee: 750,
        phone: '9830077001',
        email: 'dr.arvind.singhal@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
        bio: 'Ophthalmic Surgeon specializing in micro-incision phacoemulsification cataract surgery and blade-free LASIK.',
        availabilitySchedule: 'MON:09:00-13:00,TUE:09:00-13:00,THU:09:00-13:00',
      },
      {
        fullName: 'Dr. Shalini Gupta',
        qualification: 'MS (Ophthalmology), DNB',
        specialization: 'Retina & Glaucoma Specialist',
        experienceYears: 12,
        consultationFee: 700,
        phone: '9830077002',
        email: 'dr.shalini.gupta@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400&auto=format&fit=crop&q=80',
        bio: 'Vitreoretinal surgeon treating diabetic retinopathy, macular degeneration, and complex glaucoma disorders.',
        availabilitySchedule: 'WED:10:00-15:00,FRI:10:00-15:00,SAT:09:00-13:00',
      },
    ],
  },
  {
    name: 'General Medicine',
    description: 'Primary Healthcare, Fever, Diabetes & Internal Medicine',
    consultationFee: 500,
    doctors: [
      {
        fullName: 'Dr. Alok Nath',
        qualification: 'MD (Internal Medicine)',
        specialization: 'General OPD & Metabolic Disorders',
        experienceYears: 22,
        consultationFee: 550,
        phone: '9830088001',
        email: 'dr.alok.nath@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
        bio: 'Senior Physician with 22 years of practice managing chronic hypertension, diabetes mellitus, and complex fever OPD.',
        availabilitySchedule: 'MON:08:00-14:00,TUE:08:00-14:00,WED:08:00-14:00,THU:08:00-14:00,FRI:08:00-14:00',
      },
      {
        fullName: 'Dr. Deepa Nair',
        qualification: 'MD (General Medicine)',
        specialization: 'Internal Medicine & Preventive Health',
        experienceYears: 10,
        consultationFee: 500,
        phone: '9830088002',
        email: 'dr.deepa.nair@brainwarehospital.edu.in',
        avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
        bio: 'Internal Medicine specialist dedicated to lifestyle disorder management, health screenings, and infectious disease therapy.',
        availabilitySchedule: 'MON:13:00-18:00,WED:13:00-18:00,FRI:13:00-18:00,SAT:09:00-14:00',
      },
    ],
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  console.log('Connecting to MongoDB Atlas / Database...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully!');

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  let totalDoctorsAdded = 0;

  for (const deptData of DEPARTMENTS) {
    let dept = await Department.findOne({ name: deptData.name });
    if (!dept) {
      dept = await Department.create({
        name: deptData.name,
        description: deptData.description,
        consultationFee: deptData.consultationFee,
        active: true,
      });
      console.log(`✓ Created Department: ${dept.name}`);
    } else {
      console.log(`ℹ Department already exists: ${dept.name}`);
    }

    for (const docData of deptData.doctors) {
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
        totalDoctorsAdded++;
        console.log(`   + Added Doctor: ${doc.fullName} (${dept.name})`);
      } else {
        // Update existing doctor profile image & department link if missing
        doc.department = dept._id;
        doc.avatarUrl = docData.avatarUrl;
        doc.profileImage = docData.avatarUrl;
        doc.approvalStatus = 'APPROVED';
        doc.active = true;
        await doc.save();
        console.log(`   ~ Updated Doctor Profile & Image: ${doc.fullName}`);
      }
    }
  }

  console.log(`\n🎉 Seed process completed successfully! Added/Updated ${totalDoctorsAdded} new doctors across all departments.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
