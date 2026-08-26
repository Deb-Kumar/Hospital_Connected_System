const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const result = await Doctor.updateMany(
      { approvalStatus: { $ne: 'PENDING' } },
      { $set: { approvalStatus: 'APPROVED' } }
    );

    console.log('✅ Updated non-pending doctors to APPROVED:', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
