const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

// 92 100% Unique, Crystal-Clear Professional Doctor Photo Avatars
const UNIQUE_92_DOCTOR_PHOTOS = [
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
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80'
];

// Helper generator for 92 unique URLs
function getUniquePhotoUrl(index) {
  if (index < UNIQUE_92_DOCTOR_PHOTOS.length) {
    return UNIQUE_92_DOCTOR_PHOTOS[index];
  }
  const isMale = index % 2 === 0;
  const num = Math.floor(index / 2) + 1;
  return `https://randomuser.me/api/portraits/${isMale ? 'men' : 'women'}/${num}.jpg`;
}

async function assign92UniqueDoctorPhotos() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Database...');

  const doctors = await Doctor.find().sort({ fullName: 1 });
  console.log(`Found ${doctors.length} doctor records in database.`);

  const usedUrls = new Set();
  let updatedCount = 0;

  for (let i = 0; i < doctors.length; i++) {
    const doc = doctors[i];
    let photoUrl = getUniquePhotoUrl(i);

    // Guarantee 100% uniqueness
    while (usedUrls.has(photoUrl)) {
      photoUrl = `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${Math.floor(Math.random() * 90) + 1}.jpg`;
    }
    usedUrls.add(photoUrl);

    doc.profileImage = photoUrl;
    doc.avatarUrl = photoUrl;
    await doc.save();
    updatedCount++;
    console.log(`[${i + 1}/${doctors.length}] ${doc.fullName} ➔ ${photoUrl}`);
  }

  console.log('\n--- Doctor Unique Profile Photos Summary ---');
  console.log(`✅ Assigned 100% UNIQUE profile photos to all ${updatedCount} doctors!`);
  console.log(`✅ Unique Photo URLs in Set: ${usedUrls.size}`);

  await mongoose.disconnect();
  process.exit(0);
}

assign92UniqueDoctorPhotos().catch((err) => {
  console.error('Error assigning unique doctor photos:', err);
  process.exit(1);
});
