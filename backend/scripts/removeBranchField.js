const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Department = require('../models/Department');

async function removeBranchField() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Database...');

  // Unset the legacy 'branch' field from all department documents in MongoDB
  const result = await Department.updateMany({}, { $unset: { branch: "" } });

  console.log(`✅ Successfully removed 'branch' field from ${result.modifiedCount} department document(s)!`);

  await mongoose.disconnect();
  process.exit(0);
}

removeBranchField().catch((err) => {
  console.error('Error removing branch field:', err);
  process.exit(1);
});
