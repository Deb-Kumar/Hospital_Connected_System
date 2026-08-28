const path = require('path');
const fs = require('fs');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const Doctor = require('../models/Doctor');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadAllToCloudinary() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db');

  const doctors = await Doctor.find();
  console.log(`Starting Cloudinary upload for ${doctors.length} doctors...`);

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'doctors');
  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  for (let i = 0; i < doctors.length; i++) {
    const doctor = doctors[i];
    let photoPath = doctor.profileImage || doctor.avatarUrl || '';

    if (photoPath.startsWith('https://res.cloudinary.com')) {
      skippedCount++;
      continue;
    }

    let localFileToUpload = null;

    if (photoPath.startsWith('/uploads/doctors/')) {
      const filename = path.basename(photoPath);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        localFileToUpload = filePath;
      }
    }

    if (!localFileToUpload) {
      // Check if sanitized doctor name file exists in uploads/doctors/
      let cleanName = doctor.fullName.toLowerCase().replace(/^dr\.\s+/i, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
      const possibleFile = path.join(uploadsDir, `dr_${cleanName}.jpg`);
      if (fs.existsSync(possibleFile)) {
        localFileToUpload = possibleFile;
      }
    }

    if (localFileToUpload) {
      try {
        const publicId = `dr_${doctor.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
        const uploadResult = await cloudinary.uploader.upload(localFileToUpload, {
          folder: 'hospital-connected-system/doctors',
          public_id: publicId,
          overwrite: true,
          resource_type: 'image'
        });

        const cloudUrl = uploadResult.secure_url;
        doctor.avatarUrl = cloudUrl;
        doctor.profileImage = cloudUrl;
        await doctor.save();

        successCount++;
        console.log(`[${i + 1}/${doctors.length}] ✅ Uploaded Dr. ${doctor.fullName} -> ${cloudUrl}`);
      } catch (err) {
        failCount++;
        console.error(`[${i + 1}/${doctors.length}] ❌ Failed Dr. ${doctor.fullName}:`, err.message);
      }
    } else {
      skippedCount++;
      console.log(`[${i + 1}/${doctors.length}] ⚠️ No local file for Dr. ${doctor.fullName}`);
    }
  }

  console.log('\n=== CLOUDINARY UPLOAD SUMMARY ===');
  console.log(`SUCCESSFULLY UPLOADED: ${successCount}`);
  console.log(`SKIPPED: ${skippedCount}`);
  console.log(`FAILED: ${failCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

uploadAllToCloudinary();
