const path = require('path');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Department = require('../models/Department');

async function updateConsultationFees() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Database...');

  // Update all departments where consultationFee is less than 800 or missing
  const result = await Department.updateMany(
    {
      $or: [
        { consultationFee: { $lt: 800 } },
        { consultationFee: { $exists: false } }
      ]
    },
    { $set: { consultationFee: 800 } }
  );

  console.log(`✅ Successfully updated consultation fee to ₹800 for ${result.modifiedCount} department(s)!`);

  // Verify updated department list
  const departments = await Department.find().sort({ name: 1 });
  console.log('\n--- Updated Department Consultation Fees ---');
  departments.forEach((dept) => {
    console.log(`${dept.name}: ₹${dept.consultationFee}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

updateConsultationFees().catch((err) => {
  console.error('Error updating consultation fees:', err);
  process.exit(1);
});
