const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

// High-resolution Unsplash Medical Doctors & Surgeons Photo Collection
const RELIABLE_UNSPLASH_DOCTOR_PHOTOS = [
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1622253694238-3b22139576c6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80'
];

async function ensureWorkingDoctorPhotos() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Database...');

  const doctors = await Doctor.find().sort({ fullName: 1 });
  console.log(`Checking photo URLs for ${doctors.length} doctors...`);

  let updatedCount = 0;

  for (let i = 0; i < doctors.length; i++) {
    const doc = doctors[i];
    const currentPhoto = doc.profileImage || doc.avatarUrl || '';

    // Replace randomuser.me (which can be blocked or slow) with reliable Unsplash doctor photo
    if (!currentPhoto || currentPhoto.includes('randomuser.me') || currentPhoto.includes('ui-avatars.com')) {
      const selectedPhoto = RELIABLE_UNSPLASH_DOCTOR_PHOTOS[i % RELIABLE_UNSPLASH_DOCTOR_PHOTOS.length];
      doc.profileImage = selectedPhoto;
      doc.avatarUrl = selectedPhoto;
      await doc.save();
      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} doctor photo URLs to high-res Unsplash medical avatars!`);
  await mongoose.disconnect();
  process.exit(0);
}

ensureWorkingDoctorPhotos().catch((err) => {
  console.error('Error updating doctor photos:', err);
  process.exit(1);
});
