const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

// 92 STRICTLY UNIQUE PHOTO URLS
const PHOTO_POOL = [];

// 1. Unsplash Portraits (28 unique photos)
const UNSPLASH_28 = [
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
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=600&q=80',
];

PHOTO_POOL.push(...UNSPLASH_28);

// 2. RandomUser Men Portraits (32 unique photos)
for (let i = 1; i <= 32; i++) {
  PHOTO_POOL.push(`https://randomuser.me/api/portraits/men/${i}.jpg`);
}

// 3. RandomUser Women Portraits (32 unique photos)
for (let i = 1; i <= 32; i++) {
  PHOTO_POOL.push(`https://randomuser.me/api/portraits/women/${i}.jpg`);
}

async function assign92StrictlyUniquePhotos() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Database...');

  const doctors = await Doctor.find().sort({ fullName: 1 });
  console.log(`Found ${doctors.length} doctor records in database.`);
  console.log(`Photo pool has ${PHOTO_POOL.length} unique photo URLs.`);

  const usedUrls = new Set();
  let updatedCount = 0;

  for (let i = 0; i < doctors.length; i++) {
    const doc = doctors[i];
    const uniquePhotoUrl = PHOTO_POOL[i % PHOTO_POOL.length];

    usedUrls.add(uniquePhotoUrl);
    doc.profileImage = uniquePhotoUrl;
    doc.avatarUrl = uniquePhotoUrl;

    await doc.save();
    updatedCount++;
    console.log(`[${i + 1}/${doctors.length}] ${doc.fullName} ➔ ${uniquePhotoUrl}`);
  }

  console.log('\n--- Doctor Unique Profile Photos Summary ---');
  console.log(`✅ Updated ${updatedCount} doctor documents in MongoDB Atlas!`);
  console.log(`✅ Total 100% Unique Image URLs in Set: ${usedUrls.size}`);

  await mongoose.disconnect();
  process.exit(0);
}

assign92StrictlyUniquePhotos().catch((err) => {
  console.error('Error assigning unique photos:', err);
  process.exit(1);
});
