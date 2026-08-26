const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

// 35 Complete Medical Departments with 2 Doctors Each (70 Doctors Total)
const DEPARTMENTS = [
  {
    name: 'Cardiology',
    description: 'Heart, Vascular Care & Interventional Cardiology',
    consultationFee: 800,
    doctors: [
      { fullName: 'Dr. Rajesh Sharma', qualification: 'MD, DM (Cardiology), FACC', specialization: 'Interventional Cardiology', experienceYears: 18, consultationFee: 900, phone: '9830011001', email: 'dr.rajesh.sharma@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Senior Consultant Interventional Cardiologist specializing in angioplasty, pacemaker implantation, and cardiac care.', availabilitySchedule: 'MON:09:00-14:00,WED:09:00-14:00,FRI:09:00-14:00' },
      { fullName: 'Dr. Ananya Roy', qualification: 'MD, DNB (Cardiology)', specialization: 'Non-Invasive Cardiology & Echocardiography', experienceYears: 12, consultationFee: 750, phone: '9830011002', email: 'dr.ananya.roy@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Specialist in preventative cardiology, 3D echocardiography, and heart failure management.', availabilitySchedule: 'TUE:10:00-15:00,THU:10:00-15:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Neurology',
    description: 'Brain, Spine & Nervous System Disorders',
    consultationFee: 900,
    doctors: [
      { fullName: 'Dr. Vikram Malhotra', qualification: 'MD, DM (Neurology)', specialization: 'Stroke & Neuro-Critical Care', experienceYears: 16, consultationFee: 1000, phone: '9830022001', email: 'dr.vikram.malhotra@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Neurologist specializing in acute stroke intervention, epilepsy care, and neuro-critical medicine.', availabilitySchedule: 'MON:10:00-14:00,TUE:10:00-14:00,THU:10:00-14:00' },
      { fullName: 'Dr. Meera Iyer', qualification: 'MD, DNB (Neurology)', specialization: 'Movement Disorders & Parkinson Care', experienceYears: 11, consultationFee: 850, phone: '9830022002', email: 'dr.meera.iyer@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Expert in deep brain stimulation monitoring, Parkinson’s disease management, and migraine therapy.', availabilitySchedule: 'WED:09:30-13:30,FRI:09:30-13:30,SAT:09:30-13:30' }
    ]
  },
  {
    name: 'Orthopedics',
    description: 'Bones, Joints, Trauma & Spine Surgery',
    consultationFee: 700,
    doctors: [
      { fullName: 'Dr. Suresh Menon', qualification: 'MS (Ortho), M.Ch (Ortho - UK)', specialization: 'Joint Replacement & Arthroscopy', experienceYears: 20, consultationFee: 900, phone: '9830033001', email: 'dr.suresh.menon@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Chief Orthopedic Surgeon specializing in robotic knee replacement and hip reconstruction.', availabilitySchedule: 'MON:09:00-13:00,THU:09:00-13:00,FRI:09:00-13:00' },
      { fullName: 'Dr. Priya Mukherjee', qualification: 'MS (Ortho), Fellowship Spine', specialization: 'Spine & Trauma Surgery', experienceYears: 13, consultationFee: 800, phone: '9830033002', email: 'dr.priya.mukherjee@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Specialist in minimally invasive spine surgery, complex fracture trauma, and sports injuries.', availabilitySchedule: 'TUE:10:00-14:00,WED:10:00-14:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Pediatrics',
    description: 'Child Healthcare, Neonatal & Pediatric Care',
    consultationFee: 600,
    doctors: [
      { fullName: 'Dr. Amit Patel', qualification: 'MD (Pediatrics), DCH', specialization: 'General Pediatrics & Immunization', experienceYears: 14, consultationFee: 650, phone: '9830044001', email: 'dr.amit.patel@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Pediatrician dedicated to newborn care, childhood growth monitoring, and routine vaccination.', availabilitySchedule: 'MON:10:00-16:00,WED:10:00-16:00,FRI:10:00-16:00' },
      { fullName: 'Dr. Kavita Verma', qualification: 'MD (Pediatrics), DM Neonatology', specialization: 'Neonatal Critical Care (NICU)', experienceYears: 10, consultationFee: 700, phone: '9830044002', email: 'dr.kavita.verma@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Neonatologist specializing in premature baby care, intensive neonatal care, and child nutrition.', availabilitySchedule: 'TUE:09:00-14:00,THU:09:00-14:00,SAT:09:00-14:00' }
    ]
  },
  {
    name: 'Gynecology & Obstetrics',
    description: "Women's Health, Maternity & Laparoscopic Surgery",
    consultationFee: 750,
    doctors: [
      { fullName: 'Dr. Sunita Deshmukh', qualification: 'MD, DNB (OB-GYN)', specialization: 'High-Risk Pregnancy & Infertility', experienceYears: 19, consultationFee: 850, phone: '9830055001', email: 'dr.sunita.deshmukh@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Obstetrician specializing in high-risk pregnancy care, painless delivery, and laparoscopic surgery.', availabilitySchedule: 'MON:09:30-13:30,TUE:09:30-13:30,THU:09:30-13:30' },
      { fullName: 'Dr. Pooja Mukherjee', qualification: 'MS (OB-GYN), Fellowship Infertility', specialization: 'Maternal Fetal Medicine & Laparoscopy', experienceYears: 12, consultationFee: 750, phone: '9830055002', email: 'dr.pooja.mukherjee@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Gynecologist focused on fetal ultrasound, minimally invasive surgery, and adolescent health.', availabilitySchedule: 'WED:10:00-15:00,FRI:10:00-15:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Dermatology',
    description: 'Skin, Hair, Nail Disorders & Cosmetology',
    consultationFee: 650,
    doctors: [
      { fullName: 'Dr. Rohan Sen', qualification: 'MD (Dermatology, DVL)', specialization: 'Clinical Dermatology & Laser Therapy', experienceYears: 11, consultationFee: 700, phone: '9830066001', email: 'dr.rohan.sen@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Dermatologist expert in acne treatments, psoriasis care, laser skin resurfacing, and hair loss.', availabilitySchedule: 'MON:11:00-16:00,WED:11:00-16:00,FRI:11:00-16:00' },
      { fullName: 'Dr. Ritu Banerjee', qualification: 'DVD, DNB (Dermatology)', specialization: 'Cosmetology & Anti-Aging Treatments', experienceYears: 9, consultationFee: 650, phone: '9830066002', email: 'dr.ritu.banerjee@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Cosmetologist specializing in skin pigmentation remedies, chemical peels, and aesthetic care.', availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Ophthalmology',
    description: 'Eye Care, Vision Testing & Cataract Surgery',
    consultationFee: 600,
    doctors: [
      { fullName: 'Dr. Arvind Singhal', qualification: 'MS (Ophthal), FICO (UK)', specialization: 'Cataract, LASIK & Refractive Surgery', experienceYears: 17, consultationFee: 750, phone: '9830077001', email: 'dr.arvind.singhal@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Ophthalmic Surgeon specializing in cataract phacoemulsification surgery and blade-free LASIK.', availabilitySchedule: 'MON:09:00-13:00,TUE:09:00-13:00,THU:09:00-13:00' },
      { fullName: 'Dr. Shalini Gupta', qualification: 'MS (Ophthal), DNB', specialization: 'Retina & Glaucoma Specialist', experienceYears: 12, consultationFee: 700, phone: '9830077002', email: 'dr.shalini.gupta@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Vitreoretinal surgeon treating diabetic retinopathy, macular degeneration, and glaucoma.', availabilitySchedule: 'WED:10:00-15:00,FRI:10:00-15:00,SAT:09:00-13:00' }
    ]
  },
  {
    name: 'General Medicine',
    description: 'Primary Healthcare, Fever, Diabetes & Internal Medicine',
    consultationFee: 500,
    doctors: [
      { fullName: 'Dr. Alok Nath', qualification: 'MD (Internal Medicine)', specialization: 'General OPD & Metabolic Disorders', experienceYears: 22, consultationFee: 550, phone: '9830088001', email: 'dr.alok.nath@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Physician with 22 years of practice managing chronic hypertension, diabetes, and complex fever OPD.', availabilitySchedule: 'MON:08:00-14:00,TUE:08:00-14:00,WED:08:00-14:00,THU:08:00-14:00,FRI:08:00-14:00' },
      { fullName: 'Dr. Deepa Nair', qualification: 'MD (General Medicine)', specialization: 'Internal Medicine & Preventive Health', experienceYears: 10, consultationFee: 500, phone: '9830088002', email: 'dr.deepa.nair@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Internal Medicine specialist dedicated to lifestyle disorder management and infectious disease therapy.', availabilitySchedule: 'MON:13:00-18:00,WED:13:00-18:00,FRI:13:00-18:00,SAT:09:00-14:00' }
    ]
  },
  {
    name: 'ENT (Otolaryngology)',
    description: 'Ear, Nose, Throat, Sinus & Hearing Care',
    consultationFee: 650,
    doctors: [
      { fullName: 'Dr. Sanjeev Kapoor', qualification: 'MS (ENT), DNB', specialization: 'Endoscopic Sinus & Micro Ear Surgery', experienceYears: 15, consultationFee: 700, phone: '9830099001', email: 'dr.sanjeev.kapoor@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'ENT Surgeon expert in endoscopic sinus surgery, tympanoplasty, and voice disorder management.', availabilitySchedule: 'MON:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' },
      { fullName: 'Dr. Neha Saxena', qualification: 'DLO, MS (ENT)', specialization: 'Pediatric ENT & Cochlear Implants', experienceYears: 11, consultationFee: 650, phone: '9830099002', email: 'dr.neha.saxena@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Pediatric ENT specialist managing tonsillectomy, hearing loss evaluations, and snoring therapy.', availabilitySchedule: 'TUE:09:30-13:30,WED:09:30-13:30,FRI:09:30-13:30' }
    ]
  },
  {
    name: 'Oncology & Cancer Care',
    description: 'Comprehensive Cancer Care, Chemotherapy & Tumor Surgery',
    consultationFee: 1000,
    doctors: [
      { fullName: 'Dr. Somnath Chatterjee', qualification: 'MD (Radiotherapy), DM (Medical Oncology)', specialization: 'Medical Oncology & Immunotherapy', experienceYears: 18, consultationFee: 1100, phone: '9830100001', email: 'dr.somnath.chatterjee@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Senior Medical Oncologist specializing in targeted therapy, chemotherapy, and precision cancer care.', availabilitySchedule: 'MON:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00' },
      { fullName: 'Dr. Arpita Roy', qualification: 'MS, M.Ch (Surgical Oncology)', specialization: 'Surgical Oncology & Tumor Resection', experienceYears: 14, consultationFee: 1000, phone: '9830100002', email: 'dr.arpita.roy@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Surgical Oncologist expert in breast cancer surgery, head & neck tumors, and GI surgical oncology.', availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Nephrology',
    description: 'Kidney Care, Hypertension & Dialysis Management',
    consultationFee: 850,
    doctors: [
      { fullName: 'Dr. Debasis Ghosh', qualification: 'MD, DM (Nephrology)', specialization: 'Kidney Transplant & Chronic Kidney Disease', experienceYears: 17, consultationFee: 950, phone: '9830111001', email: 'dr.debasis.ghosh@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Nephrologist specializing in renal transplantation, hemodialysis care, and diabetic nephropathy.', availabilitySchedule: 'MON:09:30-13:30,THU:09:30-13:30,SAT:09:30-13:30' },
      { fullName: 'Dr. Swati Das', qualification: 'MD, DNB (Nephrology)', specialization: 'Dialysis & Renal Hypertension', experienceYears: 11, consultationFee: 850, phone: '9830111002', email: 'dr.swati.das@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Specialist in peritoneal dialysis, acute kidney injury management, and glomerular diseases.', availabilitySchedule: 'TUE:10:00-14:00,WED:10:00-14:00,FRI:10:00-14:00' }
    ]
  },
  {
    name: 'Urology',
    description: 'Urinary Tract, Kidney Stones & Prostate Surgery',
    consultationFee: 800,
    doctors: [
      { fullName: 'Dr. Subhash Bose', qualification: 'MS, M.Ch (Urology)', specialization: 'Endourology & Kidney Stone Laser Surgery', experienceYears: 19, consultationFee: 900, phone: '9830122001', email: 'dr.subhash.bose@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Urologist expert in RIRS laser stone removal, prostate TURP surgery, and reconstructive urology.', availabilitySchedule: 'MON:10:00-14:00,WED:10:00-14:00,FRI:10:00-14:00' },
      { fullName: 'Dr. Tanmoy Dutta', qualification: 'MS, DNB (Urology)', specialization: 'Prostate Care & Male Infertility', experienceYears: 13, consultationFee: 800, phone: '9830122002', email: 'dr.tanmoy.dutta@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Specialist in laparoscopic urology, urodynamics testing, and male reproductive health.', availabilitySchedule: 'TUE:09:00-13:00,THU:09:00-13:00,SAT:09:00-13:00' }
    ]
  },
  {
    name: 'Gastroenterology',
    description: 'Digestive System, Liver, Pancreas & Endoscopy',
    consultationFee: 800,
    doctors: [
      { fullName: 'Dr. Pradeep Sen', qualification: 'MD, DM (Gastroenterology)', specialization: 'Hepatology & Endoscopic Ultrasound', experienceYears: 16, consultationFee: 900, phone: '9830133001', email: 'dr.pradeep.sen@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Gastroenterologist expert in ERCP, liver cirrhosis management, and diagnostic colonoscopy.', availabilitySchedule: 'MON:09:00-13:00,THU:09:00-13:00,FRI:09:00-13:00' },
      { fullName: 'Dr. Nandini Ray', qualification: 'MD, DNB (Gastroenterology)', specialization: 'IBD & Gastrointestinal Motility', experienceYears: 10, consultationFee: 750, phone: '9830133002', email: 'dr.nandini.ray@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Specialist in ulcerative colitis, Crohn’s disease, acid reflux disorders, and fatty liver disease.', availabilitySchedule: 'TUE:10:00-15:00,WED:10:00-15:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Pulmonology',
    description: 'Lungs, Respiratory Care, Asthma & Allergy',
    consultationFee: 700,
    doctors: [
      { fullName: 'Dr. Bhaskar Dasgupta', qualification: 'MD, DTCD (Chest Medicine)', specialization: 'Asthma, COPD & Sleep Apnea', experienceYears: 18, consultationFee: 800, phone: '9830144001', email: 'dr.bhaskar.dasgupta@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Chest Physician specializing in bronchoscopy, severe asthma therapy, and interventional pulmonology.', availabilitySchedule: 'MON:10:00-14:00,WED:10:00-14:00,FRI:10:00-14:00' },
      { fullName: 'Dr. Sangeeta Pal', qualification: 'MD, DNB (Pulmonology)', specialization: 'Interventional Pulmonology & Allergy', experienceYears: 12, consultationFee: 700, phone: '9830144002', email: 'dr.sangeeta.pal@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Pulmonologist expert in pulmonary rehabilitation, sleep apnea study, and lung fibrosis care.', availabilitySchedule: 'TUE:09:00-13:00,THU:09:00-13:00,SAT:09:00-13:00' }
    ]
  },
  {
    name: 'Psychiatry & Mental Health',
    description: 'Mental Health, Behavioral Therapy & Counseling',
    consultationFee: 750,
    doctors: [
      { fullName: 'Dr. Indranil Roy', qualification: 'MD (Psychiatry), DPM', specialization: 'Clinical Psychiatry & Anxiety Care', experienceYears: 15, consultationFee: 800, phone: '9830155001', email: 'dr.indranil.roy@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Psychiatrist treating depression, panic disorders, adult ADHD, and stress-related conditions.', availabilitySchedule: 'MON:11:00-16:00,THU:11:00-16:00,SAT:10:00-14:00' },
      { fullName: 'Dr. Moumita Sen', qualification: 'MD (Psychiatry)', specialization: 'Child & Adolescent Psychiatry', experienceYears: 10, consultationFee: 750, phone: '9830155002', email: 'dr.moumita.sen@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Specialist in child behavioral counseling, autism assessment, and adolescent emotional health.', availabilitySchedule: 'TUE:10:00-15:00,WED:10:00-15:00,FRI:10:00-15:00' }
    ]
  },
  {
    name: 'Endocrinology',
    description: 'Diabetes, Thyroid & Hormonal Health',
    consultationFee: 750,
    doctors: [
      { fullName: 'Dr. Sourav Ganguly', qualification: 'MD, DM (Endocrinology)', specialization: 'Diabetes Mellitus & Thyroid Care', experienceYears: 16, consultationFee: 850, phone: '9830166001', email: 'dr.sourav.ganguly@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Endocrinologist specializing in insulin pump therapy, complex thyroid nodules, and PCOS management.', availabilitySchedule: 'MON:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00' },
      { fullName: 'Dr. Rina Mitra', qualification: 'MD, DNB (Endocrinology)', specialization: 'Pediatric Endocrinology & Obesity', experienceYears: 11, consultationFee: 750, phone: '9830166002', email: 'dr.rina.mitra@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Specialist in growth hormone disorders, metabolic bone disease, and gestational diabetes.', availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Rheumatology',
    description: 'Arthritis, Gout & Autoimmune Conditions',
    consultationFee: 750,
    doctors: [
      { fullName: 'Dr. Tarun Kanti', qualification: 'MD, DM (Clinical Immunology & Rheumatology)', specialization: 'Rheumatoid Arthritis & Lupus Care', experienceYears: 14, consultationFee: 850, phone: '9830177001', email: 'dr.tarun.kanti@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Rheumatologist specializing in biological therapies for severe arthritis, lupus, and vasculitis.', availabilitySchedule: 'MON:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' },
      { fullName: 'Dr. Smita Nandi', qualification: 'MD, DNB (Rheumatology)', specialization: 'Osteoarthritis & Musculoskeletal Care', experienceYears: 10, consultationFee: 750, phone: '9830177002', email: 'dr.smita.nandi@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Specialist in intra-articular injections, gout therapy, and ankylosing spondylitis.', availabilitySchedule: 'TUE:09:30-13:30,WED:09:30-13:30,FRI:09:30-13:30' }
    ]
  },
  {
    name: 'Neurosurgery',
    description: 'Brain & Spinal Cord Micro-Surgery',
    consultationFee: 1100,
    doctors: [
      { fullName: 'Dr. Himadri Shekhar', qualification: 'MS, M.Ch (Neurosurgery)', specialization: 'Brain Tumor & Micro-Neurosurgery', experienceYears: 21, consultationFee: 1200, phone: '9830188001', email: 'dr.himadri.shekhar@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Chief Neurosurgeon with 21 years of surgical experience in brain tumors and aneurysm clipping.', availabilitySchedule: 'MON:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00' },
      { fullName: 'Dr. Sharmila Paul', qualification: 'MS, DNB (Neurosurgery)', specialization: 'Endoscopic Spine & Keyhole Brain Surgery', experienceYears: 13, consultationFee: 1100, phone: '9830188002', email: 'dr.sharmila.paul@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Neurosurgeon expert in keyhole endoscopic spine surgery and pediatric neurosurgery.', availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Cardiothoracic Surgery',
    description: 'Heart Bypass, Valve & Chest Surgery',
    consultationFee: 1100,
    doctors: [
      { fullName: 'Dr. Bishnu Pada', qualification: 'MS, M.Ch (CTVS)', specialization: 'Coronary Bypass (CABG) & Valve Repair', experienceYears: 22, consultationFee: 1250, phone: '9830199001', email: 'dr.bishnu.pada@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Senior CTVS Surgeon specializing in beating-heart bypass surgery and aortic valve reconstruction.', availabilitySchedule: 'MON:09:00-13:00,THU:09:00-13:00,FRI:09:00-13:00' },
      { fullName: 'Dr. Aparna Kar', qualification: 'MS, DNB (CTVS)', specialization: 'Minimally Invasive Cardiac Surgery', experienceYears: 14, consultationFee: 1100, phone: '9830199002', email: 'dr.aparna.kar@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Specialist in keyhole cardiac surgery, thoracic vascular surgery, and lung resection.', availabilitySchedule: 'TUE:10:00-14:00,WED:10:00-14:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Pediatric Surgery',
    description: 'Surgical Care for Infants, Children & Adolescents',
    consultationFee: 750,
    doctors: [
      { fullName: 'Dr. Subir Hazra', qualification: 'MS, M.Ch (Pediatric Surgery)', specialization: 'Pediatric Laparoscopy & Congenital Anomaly', experienceYears: 16, consultationFee: 850, phone: '9830200001', email: 'dr.subir.hazra@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Pediatric Surgeon specializing in neonatal anomaly corrections and pediatric laparoscopic surgery.', availabilitySchedule: 'MON:09:30-13:30,WED:09:30-13:30,FRI:09:30-13:30' },
      { fullName: 'Dr. Archana Ghosh', qualification: 'MS, DNB (Pediatric Surgery)', specialization: 'Pediatric Urology & General Surgery', experienceYears: 11, consultationFee: 750, phone: '9830200002', email: 'dr.archana.ghosh@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Specialist in pediatric hernia repair, appendectomy, and pediatric urological reconstructive procedures.', availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Plastic & Reconstructive Surgery',
    description: 'Reconstructive, Burn & Aesthetic Cosmetic Surgery',
    consultationFee: 900,
    doctors: [
      { fullName: 'Dr. Koushik Roy', qualification: 'MS, M.Ch (Plastic Surgery)', specialization: 'Reconstructive Microsurgery & Trauma', experienceYears: 17, consultationFee: 1000, phone: '9830211001', email: 'dr.koushik.roy@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Plastic Surgeon expert in limb salvage micro-surgery, cleft palate repair, and facial trauma surgery.', availabilitySchedule: 'MON:10:00-14:00,THU:10:00-14:00,FRI:10:00-14:00' },
      { fullName: 'Dr. Tanusree Seal', qualification: 'MS, DNB (Plastic Surgery)', specialization: 'Cosmetic Rhinoplasty & Burn Care', experienceYears: 12, consultationFee: 900, phone: '9830211002', email: 'dr.tanusree.seal@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Specialist in aesthetic rhinoplasty, scar revision, burn contracture release, and liposuction.', availabilitySchedule: 'TUE:09:00-13:00,WED:09:00-13:00,SAT:09:00-13:00' }
    ]
  },
  {
    name: 'Vascular & Endovascular Surgery',
    description: 'Artery, Vein & Peripheral Circulation Surgery',
    consultationFee: 850,
    doctors: [
      { fullName: 'Dr. Joydeep Pal', qualification: 'MS, M.Ch (Vascular Surgery)', specialization: 'Varicose Laser & Diabetic Foot Surgery', experienceYears: 15, consultationFee: 950, phone: '9830222001', email: 'dr.joydeep.pal@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Vascular Surgeon expert in endovenous laser varicose treatment and peripheral arterial bypass.', availabilitySchedule: 'MON:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00' },
      { fullName: 'Dr. Lopamudra Som', qualification: 'MS, DNB (Vascular Surgery)', specialization: 'Dialysis Access (AV Fistula) & DVT', experienceYears: 10, consultationFee: 850, phone: '9830222002', email: 'dr.lopamudra.som@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Specialist in AV fistula creation for hemodialysis, deep vein thrombosis (DVT) filter placement.', availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' }
    ]
  },
  {
    name: 'Emergency Medicine & Trauma',
    description: '24/7 Critical Emergency & Trauma Resuscitation',
    consultationFee: 500,
    doctors: [
      { fullName: 'Dr. Ranajit Sen', qualification: 'MD (Emergency Medicine), MEM', specialization: 'Trauma Resuscitation & Acute Care', experienceYears: 13, consultationFee: 600, phone: '9830233001', email: 'dr.ranajit.sen@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Head of Emergency Medicine specializing in polytrauma management, cardiac arrest resuscitation, and triage.', availabilitySchedule: 'MON:00:00-23:59,TUE:00:00-23:59,WED:00:00-23:59' },
      { fullName: 'Dr. Susmita Ray', qualification: 'MEM (Emergency Medicine)', specialization: 'Toxicology & Medical Emergencies', experienceYears: 9, consultationFee: 500, phone: '9830233002', email: 'dr.susmita.ray@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Emergency Physician expert in acute anaphylaxis, poisoning management, and stroke triage.', availabilitySchedule: 'THU:00:00-23:59,FRI:00:00-23:59,SAT:00:00-23:59' }
    ]
  },
  {
    name: 'Critical Care & ICU',
    description: 'Intensive Care Unit (ICU) & Life Support Care',
    consultationFee: 900,
    doctors: [
      { fullName: 'Dr. Parthapratim Das', qualification: 'MD, EDIC (Critical Care)', specialization: 'Sepsis & Mechanical Ventilation', experienceYears: 16, consultationFee: 1000, phone: '9830244001', email: 'dr.parthapratim.das@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Intensivist managing severe ARDS, multiorgan failure, hemodynamic monitoring, and ECMO support.', availabilitySchedule: 'MON:08:00-16:00,WED:08:00-16:00,FRI:08:00-16:00' },
      { fullName: 'Dr. Sutapa Chandra', qualification: 'MD, IDCCM (Intensive Care)', specialization: 'Post-Operative & Neuro ICU Management', experienceYears: 11, consultationFee: 900, phone: '9830244002', email: 'dr.sutapa.chandra@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'ICU Specialist focused on neuro-critical monitoring, severe sepsis therapy, and parenteral nutrition.', availabilitySchedule: 'TUE:08:00-16:00,THU:08:00-16:00,SAT:08:00-16:00' }
    ]
  },
  {
    name: 'Anesthesiology & Pain Management',
    description: 'Surgical Anesthesia & Chronic Pain Relief',
    consultationFee: 700,
    doctors: [
      { fullName: 'Dr. Goutam Mallick', qualification: 'MD, DA (Anesthesiology)', specialization: 'Neuro & Cardiac Anesthesia', experienceYears: 18, consultationFee: 800, phone: '9830255001', email: 'dr.goutam.mallick@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Senior Anesthesiologist providing high-risk cardiac anesthesia, regional nerve blocks, and epidural care.', availabilitySchedule: 'MON:08:00-14:00,TUE:08:00-14:00,WED:08:00-14:00' },
      { fullName: 'Dr. Kakali Samanta', qualification: 'MD (Anesthesiology), FIPM (Pain)', specialization: 'Interventional Chronic Pain Therapy', experienceYears: 12, consultationFee: 700, phone: '9830255002', email: 'dr.kakali.samanta@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Pain Management Specialist managing discogenic back pain, trigeminal neuralgia, and cancer pain.', availabilitySchedule: 'THU:09:00-14:00,FRI:09:00-14:00,SAT:09:00-14:00' }
    ]
  },
  {
    name: 'Radiology & Imaging',
    description: 'X-Ray, CT Scan, MRI, Ultrasound & Mammography',
    consultationFee: 650,
    doctors: [
      { fullName: 'Dr. Tapan Chaudhuri', qualification: 'MD (Radiodiagnosis), DMRD', specialization: 'MRI & Cross-Sectional Imaging', experienceYears: 17, consultationFee: 750, phone: '9830266001', email: 'dr.tapan.chaudhuri@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Radiologist expert in 3T neuro-MRI, cardiac CT angiography, and musculoskeletal MRI diagnostic reports.', availabilitySchedule: 'MON:09:00-15:00,WED:09:00-15:00,FRI:09:00-15:00' },
      { fullName: 'Dr. Piyali Bhowmick', qualification: 'MD (Radiology)', specialization: 'Ultrasound, Doppler & Mammography', experienceYears: 11, consultationFee: 650, phone: '9830266002', email: 'dr.piyali.bhowmick@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Specialist in 4D obstetrical anomaly ultrasound, arterial color Doppler imaging, and breast mammography.', availabilitySchedule: 'TUE:09:00-15:00,THU:09:00-15:00,SAT:09:00-14:00' }
    ]
  },
  {
    name: 'Pathology & Laboratory Medicine',
    description: 'Diagnostic Pathology, Blood Tests & Histopathology',
    consultationFee: 500,
    doctors: [
      { fullName: 'Dr. Ashis Haldar', qualification: 'MD (Pathology)', specialization: 'Histopathology & Surgical Pathology', experienceYears: 20, consultationFee: 600, phone: '9830277001', email: 'dr.ashis.haldar@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Senior Pathologist managing tumor biopsy histopathology, frozen sections, and immunohistochemistry.', availabilitySchedule: 'MON:09:00-17:00,TUE:09:00-17:00,WED:09:00-17:00' },
      { fullName: 'Dr. Madhumita Kar', qualification: 'MD (Pathology), DCP', specialization: 'Cytopathology & Clinical Biochemistry', experienceYears: 13, consultationFee: 500, phone: '9830277002', email: 'dr.madhumita.kar@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Specialist in FNAC cytopathology, automated clinical chemistry, and hematology panel diagnostics.', availabilitySchedule: 'THU:09:00-17:00,FRI:09:00-17:00,SAT:09:00-14:00' }
    ]
  },
  {
    name: 'Hematology',
    description: 'Blood Disorders, Anemia & Bone Marrow Care',
    consultationFee: 800,
    doctors: [
      { fullName: 'Dr. Niladri Shekhar', qualification: 'MD, DM (Clinical Hematology)', specialization: 'Leukemia, Lymphoma & Bone Marrow Transplant', experienceYears: 15, consultationFee: 900, phone: '9830288001', email: 'dr.niladri.shekhar@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Hematologist specializing in bone marrow transplantation, acute leukemia, and aplastic anemia.', availabilitySchedule: 'MON:10:00-14:00,WED:10:00-14:00,FRI:10:00-14:00' },
      { fullName: 'Dr. Sayani Paul', qualification: 'MD, DNB (Hematology)', specialization: 'Thalassemia, Hemophilia & Anemia', experienceYears: 10, consultationFee: 800, phone: '9830288002', email: 'dr.sayani.paul@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Specialist in hereditary blood disorders, pediatric anemia management, and coagulation testing.', availabilitySchedule: 'TUE:09:30-13:30,THU:09:30-13:30,SAT:09:30-13:30' }
    ]
  },
  {
    name: 'Immunology & Allergy',
    description: 'Allergy Testing, Immunotherapy & Asthma',
    consultationFee: 650,
    doctors: [
      { fullName: 'Dr. Kaushik Naskar', qualification: 'MD, Fellowship Allergy & Immunology', specialization: 'Allergy Skin Prick Testing & Immunotherapy', experienceYears: 12, consultationFee: 750, phone: '9830299001', email: 'dr.kaushik.naskar@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Allergist expert in desensitization immunotherapy, food allergy panels, and allergic rhinitis.', availabilitySchedule: 'MON:10:00-15:00,THU:10:00-15:00,SAT:10:00-14:00' },
      { fullName: 'Dr. Trisha Majumdar', qualification: 'MD (Pediatrics), Diploma Allergy', specialization: 'Pediatric Allergy & Urticaria', experienceYears: 9, consultationFee: 650, phone: '9830299002', email: 'dr.trisha.majumdar@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Specialist in pediatric asthma, chronic eczema, hives (urticaria), and immunodeficiency conditions.', availabilitySchedule: 'TUE:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00' }
    ]
  },
  {
    name: 'Physical Medicine & Rehabilitation',
    description: 'Physiotherapy, Post-Stroke Rehab & Mobility Care',
    consultationFee: 550,
    doctors: [
      { fullName: 'Dr. Sandip Mitra', qualification: 'MD (PMR), DNB', specialization: 'Neuro-Rehabilitation & Spine Physiatry', experienceYears: 14, consultationFee: 650, phone: '9830300001', email: 'dr.sandip.mitra@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Physiatrist specializing in stroke recovery rehabilitation, spinal cord injury rehab, and mobility aids.', availabilitySchedule: 'MON:09:00-14:00,WED:09:00-14:00,FRI:09:00-14:00' },
      { fullName: 'Dr. Debjani Roy', qualification: 'BPTH, MPTH (Musculoskeletal)', specialization: 'Orthopedic Physiotherapy & Sports Mobility', experienceYears: 10, consultationFee: 550, phone: '9830300002', email: 'dr.debjani.roy@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Senior Physiotherapist expert in post-knee replacement exercises, frozen shoulder therapy, and posture correction.', availabilitySchedule: 'TUE:10:00-15:00,THU:10:00-15:00,SAT:09:00-13:00' }
    ]
  },
  {
    name: 'Dentistry & Maxillofacial Surgery',
    description: 'Dental Implants, Root Canal & Facial Trauma Surgery',
    consultationFee: 500,
    doctors: [
      { fullName: 'Dr. Sudipto Pramanik', qualification: 'MDS (Maxillofacial Surgery)', specialization: 'Facial Trauma & Wisdom Tooth Surgery', experienceYears: 15, consultationFee: 650, phone: '9830311001', email: 'dr.sudipto.pramanik@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Maxillofacial Surgeon expert in jaw fracture reconstruction, dental implantology, and impacted wisdom tooth extraction.', availabilitySchedule: 'MON:10:00-15:00,TUE:10:00-15:00,THU:10:00-15:00' },
      { fullName: 'Dr. Priyanka Saha', qualification: 'MDS (Endodontics & Conservative Dentistry)', specialization: 'Root Canal & Aesthetic Dentistry', experienceYears: 11, consultationFee: 500, phone: '9830311002', email: 'dr.priyanka.saha@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Endodontist specializing in painless microscopic root canal treatment, dental crowns, and teeth whitening.', availabilitySchedule: 'WED:09:00-14:00,FRI:09:00-14:00,SAT:09:00-14:00' }
    ]
  },
  {
    name: 'Nuclear Medicine & PET Scan',
    description: 'Molecular Imaging, Thyroid Scan & PET-CT Diagnosis',
    consultationFee: 900,
    doctors: [
      { fullName: 'Dr. Samarjit Kundu', qualification: 'MD (Nuclear Medicine), DRM', specialization: 'PET-CT Cancer Imaging & Thyroid Therapy', experienceYears: 16, consultationFee: 1000, phone: '9830322001', email: 'dr.samarjit.kundu@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Nuclear Medicine Physician expert in whole-body PET-CT cancer staging and radioactive iodine therapy.', availabilitySchedule: 'MON:09:00-14:00,WED:09:00-14:00,FRI:09:00-14:00' },
      { fullName: 'Dr. Aditi Bhattacharya', qualification: 'MD (Nuclear Medicine)', specialization: 'Cardiac SPECT & Bone Scans', experienceYears: 10, consultationFee: 900, phone: '9830322002', email: 'dr.aditi.bhattacharya@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Specialist in myocardial perfusion SPECT scans, renal DTPA scans, and radioisotope imaging.', availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:09:00-13:00' }
    ]
  },
  {
    name: 'Geriatric Medicine',
    description: 'Senior Citizen Healthcare, Dementia & Memory Care',
    consultationFee: 650,
    doctors: [
      { fullName: 'Dr. Manoranjan Paul', qualification: 'MD (General Medicine), DGM (Geriatrics - UK)', specialization: 'Senior Care, Memory & Fall Prevention', experienceYears: 20, consultationFee: 750, phone: '9830333001', email: 'dr.manoranjan.paul@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Geriatrician focused on elderly multi-morbidity, osteoporotic fragility, and memory loss syndromes.', availabilitySchedule: 'MON:10:00-14:00,THU:10:00-14:00,SAT:10:00-14:00' },
      { fullName: 'Dr. Sharmistha De', qualification: 'MD (Medicine), Fellowship Geriatrics', specialization: 'Dementia Care & Elderly Rehabilitation', experienceYears: 12, consultationFee: 650, phone: '9830333002', email: 'dr.sharmistha.de@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', bio: 'Specialist in Alzheimer’s dementia support, geriatric polypharmacy review, and elderly home health guidance.', availabilitySchedule: 'TUE:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00' }
    ]
  },
  {
    name: 'Infectious Diseases',
    description: 'Fever, Tropical Infections & Viral Disease Care',
    consultationFee: 750,
    doctors: [
      { fullName: 'Dr. Anirban Mukherjee', qualification: 'MD, FACP (USA), Fellowship Infectious Diseases', specialization: 'Tropical Fevers, Dengue & Sepsis', experienceYears: 15, consultationFee: 850, phone: '9830344001', email: 'dr.anirban.mukherjee@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', bio: 'Infectious Disease Specialist managing complex pyrexia of unknown origin (PUO), malaria, and antibiotic stewardship.', availabilitySchedule: 'MON:09:00-13:00,WED:09:00-13:00,FRI:09:00-13:00' },
      { fullName: 'Dr. Suchitra Sarkar', qualification: 'MD (Microbiology & ID)', specialization: 'HIV, Tuberculosis & Fungal Infections', experienceYears: 11, consultationFee: 750, phone: '9830344002', email: 'dr.suchitra.sarkar@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'Specialist in drug-resistant tuberculosis (MDR-TB), opportunist infections, and hospital infection control.', availabilitySchedule: 'TUE:10:00-14:00,THU:10:00-14:00,SAT:09:00-13:00' }
    ]
  },
  {
    name: 'Clinical Nutrition & Dietetics',
    description: 'Nutritional Health, Therapeutic Diets & Weight Care',
    consultationFee: 450,
    doctors: [
      { fullName: 'Dr. Srikant Bhunia', qualification: 'M.Sc (Nutrition), Ph.D (Clinical Dietetics)', specialization: 'Diabetic & Renal Clinical Nutrition', experienceYears: 13, consultationFee: 500, phone: '9830355001', email: 'dr.srikant.bhunia@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', bio: 'Clinical Nutritionist customizing therapeutic diets for diabetic, renal failure, and heart patients.', availabilitySchedule: 'MON:10:00-15:00,TUE:10:00-15:00,THU:10:00-15:00' },
      { fullName: 'Dr. Nilanjana Dutta', qualification: 'M.Sc (Food & Nutrition), RD', specialization: 'Obesity, PCOS & Post-Bariatric Nutrition', experienceYears: 9, consultationFee: 450, phone: '9830355002', email: 'dr.nilanjana.dutta@brainwarehospital.edu.in', avatarUrl: 'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=400', bio: 'Registered Dietitian specializing in weight management, PCOS nutritional correction, and child growth nutrition.', availabilitySchedule: 'WED:09:00-14:00,FRI:09:00-14:00,SAT:09:00-13:00' }
    ]
  }
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  console.log('Connecting to MongoDB Atlas / Database...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully!');

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  let totalDepartmentsCreated = 0;
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
      totalDepartmentsCreated++;
      console.log(`✓ Created Department (${totalDepartmentsCreated}/35): ${dept.name}`);
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
        doc.department = dept._id;
        doc.avatarUrl = docData.avatarUrl;
        doc.profileImage = docData.avatarUrl;
        doc.approvalStatus = 'APPROVED';
        doc.active = true;
        await doc.save();
        console.log(`   ~ Updated Doctor Profile: ${doc.fullName}`);
      }
    }
  }

  console.log(`\n🎉 Seed process completed successfully! Verified all 35 Departments & Added/Updated ${totalDoctorsAdded} Doctors.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
