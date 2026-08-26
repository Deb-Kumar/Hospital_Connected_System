const path = require('path');
const fs = require('fs');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');
const User = require('../models/User');

const UPLOADS_DIR = path.join(__dirname, '../uploads/doctors');

function sanitizeDoctorName(fullName) {
  let clean = (fullName || 'doctor').toLowerCase().replace(/^dr\.\s+/i, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  return `dr_${clean}`;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const doctors = await Doctor.find();
    console.log(`Checking ${doctors.length} doctors for photo filename synchronization...`);

    let renamedCount = 0;

    for (const doc of doctors) {
      if (!doc.fullName) continue;

      const targetBase = sanitizeDoctorName(doc.fullName);
      const targetFilename = `${targetBase}.jpg`;
      const targetPath = path.join(UPLOADS_DIR, targetFilename);
      const targetRelUrl = `/uploads/doctors/${targetFilename}`;

      // Check current photo path on document
      const currentPhoto = doc.avatarUrl || doc.profileImage || '';
      if (currentPhoto && currentPhoto.startsWith('/uploads/doctors/')) {
        const currentFilename = path.basename(currentPhoto);
        const currentPath = path.join(UPLOADS_DIR, currentFilename);

        if (fs.existsSync(currentPath) && currentFilename !== targetFilename) {
          console.log(`🔄 Renaming photo file: "${currentFilename}" -> "${targetFilename}"`);
          if (fs.existsSync(targetPath)) {
            try { fs.unlinkSync(targetPath); } catch {}
          }
          fs.renameSync(currentPath, targetPath);
          renamedCount++;
        }
      }

      // Update Doctor record in DB
      doc.avatarUrl = targetRelUrl;
      doc.profileImage = targetRelUrl;
      await doc.save();

      // Update linked User record in DB
      if (doc.email && mongoose.models.User) {
        await mongoose.models.User.updateMany({ email: doc.email }, { $set: { avatar: targetRelUrl } });
      }
    }

    console.log(`\n✅ Renamed ${renamedCount} doctor photo files to match new doctor names.`);

    // Clean up any remaining generic placeholder files like dr_*specialist*.jpg
    console.log('\nCleaning up old generic specialist files from uploads/doctors directory...');
    const files = fs.readdirSync(UPLOADS_DIR);
    let deletedCount = 0;

    for (const file of files) {
      if (/dr_.*specialist/i.test(file) || /dr_.*specialist_[a-z0-9]+/i.test(file)) {
        const filePath = path.join(UPLOADS_DIR, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Removed old generic file: ${file}`);
          deletedCount++;
        } catch (e) {
          console.error(`Failed to delete ${file}:`, e);
        }
      }
    }

    console.log(`\n✅ Removed ${deletedCount} old generic specialist photo files from disk!`);

    // Ensure stock photos exist for all doctor names
    console.log('\nEnsuring all doctors have working stock photos...');
    require('./downloadDoctorPhotosToUploads');

  } catch (err) {
    console.error('Error synchronizing doctor photo filenames:', err);
    process.exit(1);
  }
}

run();
