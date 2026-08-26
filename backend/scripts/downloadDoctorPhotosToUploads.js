const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

const UPLOADS_DOCTORS_DIR = path.join(__dirname, '../uploads/doctors');

if (!fs.existsSync(UPLOADS_DOCTORS_DIR)) {
  fs.mkdirSync(UPLOADS_DOCTORS_DIR, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`HTTP status ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });

    request.setTimeout(15000, () => {
      request.destroy();
      file.close();
      fs.unlink(destPath, () => {});
      reject(new Error('Download timeout'));
    });
  });
}

async function saveDoctorPhotosToUploads() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Database...');

  const doctors = await Doctor.find().sort({ fullName: 1 });
  console.log(`Processing photos for ${doctors.length} doctors...`);

  let downloadedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < doctors.length; i++) {
    const doc = doctors[i];
    const fileName = `doc_${doc._id}.jpg`;
    const destPath = path.join(UPLOADS_DOCTORS_DIR, fileName);
    const relativeUrl = `/uploads/doctors/${fileName}`;

    let remoteUrl = doc.profileImage || doc.avatarUrl || '';
    if (!remoteUrl || !remoteUrl.startsWith('http')) {
      remoteUrl = `https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80`;
    }

    try {
      if (!fs.existsSync(destPath) || fs.statSync(destPath).size < 1000) {
        console.log(`[${i + 1}/${doctors.length}] Downloading photo for ${doc.fullName}...`);
        await downloadFile(remoteUrl, destPath);
        downloadedCount++;
      } else {
        skippedCount++;
      }

      doc.profileImage = relativeUrl;
      doc.avatarUrl = relativeUrl;
      await doc.save();
    } catch (err) {
      console.warn(`⚠️ Failed download for ${doc.fullName} (${err.message}), using fallback URL.`);
    }
  }

  console.log('\n--- Doctor Local Uploads Storage Summary ---');
  console.log(`✅ Downloaded new photos to /uploads/doctors/: ${downloadedCount}`);
  console.log(`✅ Existing photos in /uploads/doctors/: ${skippedCount}`);
  console.log(`✅ Total doctor photos stored locally in backend/uploads/doctors/: ${doctors.length}`);

  await mongoose.disconnect();
  process.exit(0);
}

saveDoctorPhotosToUploads().catch((err) => {
  console.error('Error saving doctor photos:', err);
  process.exit(1);
});
