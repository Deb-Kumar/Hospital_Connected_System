const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

const UNIQUE_INDIAN_DOCTOR_NAMES = [
  'Rajesh Sharma', 'Ananya Roy', 'Vikram Malhotra', 'Meera Iyer',
  'Arjun Deshmukh', 'Priya Nambiar', 'Sanjay Mukherjee', 'Sunita Kulkarni',
  'Aravind Menon', 'Harshvardhan Kapoor', 'Priyadarshini Rao', 'Abhinav Banerjee',
  'Kavita Sengupta', 'Deepak Singhania', 'Ritu Bhatnagar', 'Tarun Chatterji',
  'Sneha Pillai', 'Rohan Saxena', 'Nandini Dasgupta', 'Alok Verma',
  'Shalini Hegde', 'Manish Agarwal', 'Swati Varma', 'Gaurav Joshi',
  'Tanvi Chawla', 'Vivek Kaushik', 'Neelam Mahajan', 'Varun Dutt',
  'Pooja Nair', 'Karan Ahuja', 'Shruti Rastogi', 'Ashok Sundaram',
  'Bhavna Nanda', 'Chirag Sethi', 'Divya Ranganathan', 'Eshwar Prabhu',
  'Farida Patel', 'Gita Ramanathan', 'Hemant Bhardwaj', 'Isha Trivedi',
  'Jatin Mehra', 'Kirti Solanki', 'Lalit Upadhyay', 'Madhav Murthy',
  'Nisha Chaudhry', 'Omkar Kadam', 'Pallavi Shinde', 'Qasim Rizvi',
  'Radhika Nair', 'Sameer Ganguly', 'Trisha Mazumdar', 'Uday Thanikachalam',
  'Vaishali Subrahmanian', 'Wasim Naqvi', 'Yashwant Sonawane', 'Zoya Merchant',
  'Aditya Kashyap', 'Bharati Godbole', 'Chetan Somani', 'Devika Shenoy',
  'Esha Mittal', 'Ganesh Salunkhe', 'Himani Sachdeva', 'Indrajit Sen',
  'Janhavi Gokhale', 'Krishnan Namboodiri', 'Leena Borkar', 'Mihir Phadke',
  'Namrata Tandon', 'Pradeep Paswan', 'Rachna Grover', 'Siddharth Vats',
  'Tejaswini Mohanty', 'Upendra Yadav', 'Vandana Bisht', 'Yogesh Tripathi',
  'Anurag Tripathi', 'Bimla Devi', 'Chandan Patnaik', 'Deepika Sareen',
  'Girish Acharya', 'Harini Iyengar', 'Jayesh Parekh', 'Kusum Chopra',
  'Lokesh Hegde', 'Monika Suri', 'Nitin Wagle', 'Prerna Ahuja',
  'Ramesh Chandra', 'Suhani Bajaj', 'Tushar Kamat', 'Usha Reddi',
  'Vidya Shankar', 'Yatin Sardesai'
];

const UNSPLASH_DOCTOR_PHOTOS = [
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1622253694238-3b22139576c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
];

async function auditAndFixDoctors() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Database...');

  const doctors = await Doctor.find();
  console.log(`Found ${doctors.length} total doctor records in database.`);

  const usedNames = new Set();
  let nameIndex = 0;
  let fixedPrefixes = 0;
  let renamedDuplicates = 0;
  let updatedAvatars = 0;

  for (let i = 0; i < doctors.length; i++) {
    const doc = doctors[i];

    // 1. Clean up "Dr." prefix inside Doctor.fullName
    let rawName = doc.fullName || '';
    if (/^dr\.?\s+/i.test(rawName)) {
      rawName = rawName.replace(/^dr\.?\s+/i, '').trim();
      fixedPrefixes++;
    }

    // 2. Check for duplicate name
    let cleanName = rawName;
    if (!cleanName || usedNames.has(cleanName.toLowerCase())) {
      while (nameIndex < UNIQUE_INDIAN_DOCTOR_NAMES.length && usedNames.has(UNIQUE_INDIAN_DOCTOR_NAMES[nameIndex].toLowerCase())) {
        nameIndex++;
      }
      if (nameIndex < UNIQUE_INDIAN_DOCTOR_NAMES.length) {
        cleanName = UNIQUE_INDIAN_DOCTOR_NAMES[nameIndex];
        nameIndex++;
        renamedDuplicates++;
      } else {
        cleanName = `${cleanName || 'Specialist'} ${i + 1}`;
        renamedDuplicates++;
      }
    }
    usedNames.add(cleanName.toLowerCase());

    let modified = false;
    if (doc.fullName !== cleanName) {
      doc.fullName = cleanName;
      modified = true;
    }

    // 3. Ensure Doctor profileImage & avatarUrl are set to valid Unsplash photos
    const selectedPhoto = UNSPLASH_DOCTOR_PHOTOS[i % UNSPLASH_DOCTOR_PHOTOS.length];

    if (!doc.profileImage || doc.profileImage.includes('ui-avatars.com')) {
      doc.profileImage = selectedPhoto;
      modified = true;
      updatedAvatars++;
    }
    if (!doc.avatarUrl || doc.avatarUrl.includes('ui-avatars.com')) {
      doc.avatarUrl = selectedPhoto;
      modified = true;
    }

    if (modified) {
      await doc.save();
    }
  }

  console.log('\n--- Doctor Audit & Clean-up Summary ---');
  console.log(`✅ Fixed "Dr." prefixes in Doctor names: ${fixedPrefixes}`);
  console.log(`✅ Renamed duplicate doctor names to unique names: ${renamedDuplicates}`);
  console.log(`✅ Assigned high-res doctor profile photos: ${updatedAvatars}`);
  console.log(`✅ Total unique doctor names now in database: ${usedNames.size}`);

  await mongoose.disconnect();
  process.exit(0);
}

auditAndFixDoctors().catch((err) => {
  console.error('Error during doctor audit:', err);
  process.exit(1);
});
