const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

const MALE_PHOTOS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&auto=format&fit=crop&q=80'
];

const FEMALE_PHOTOS = [
  'https://images.unsplash.com/photo-1594824813566-8885537651a2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813572-c5112f10b777?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&auto=format&fit=crop&q=80'
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: status ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

function sanitizeName(name) {
  let s = (name || 'doctor').toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  if (!s.startsWith('dr_')) {
    s = `dr_${s}`;
  }
  return s;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const doctors = await Doctor.find();
    console.log(`Found ${doctors.length} doctors in database.`);

    const uploadDir = path.join(__dirname, '../uploads/doctors');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let maleIdx = 0;
    let femaleIdx = 0;
    let successCount = 0;

    for (const doc of doctors) {
      const name = doc.fullName || 'Doctor';
      const cleanName = sanitizeName(name);
      const fileName = `${cleanName}.jpg`;
      const filePath = path.join(uploadDir, fileName);

      let imageUrl = doc.avatarUrl || doc.profileImage;
      if (!imageUrl || !imageUrl.startsWith('http')) {
        const lower = name.toLowerCase();
        const isFemale = lower.includes('ananya') || lower.includes('meera') || lower.includes('priya') || 
                         lower.includes('kavita') || lower.includes('sunita') || lower.includes('pooja') || 
                         lower.includes('ritu') || lower.includes('shalini') || lower.includes('deepa') || 
                         lower.includes('neha') || lower.includes('arpita') || lower.includes('swati') || 
                         lower.includes('nandini') || lower.includes('sangeeta') || lower.includes('moumita') || 
                         lower.includes('rina') || lower.includes('smita') || lower.includes('sharmila') || lower.includes('aparna');
        
        if (isFemale) {
          imageUrl = FEMALE_PHOTOS[femaleIdx % FEMALE_PHOTOS.length];
          femaleIdx++;
        } else {
          imageUrl = MALE_PHOTOS[maleIdx % MALE_PHOTOS.length];
          maleIdx++;
        }
      }

      try {
        console.log(`Downloading photo for ${name} -> ${fileName}...`);
        await downloadFile(imageUrl, filePath);
        
        const relativePath = `/uploads/doctors/${fileName}`;
        doc.avatarUrl = relativePath;
        doc.profileImage = relativePath;
        await doc.save();

        successCount++;
        console.log(` Saved ${fileName} (${fs.statSync(filePath).size} bytes)`);
      } catch (err) {
        console.error(`❌ Failed for ${name}:`, err.message);
      }
    }

    console.log(`\n Successfully processed and saved ${successCount} doctor photos to uploads/doctors folder!`);
    process.exit(0);
  } catch (err) {
    console.error('Error running script:', err);
    process.exit(1);
  }
}

run();
