const path = require('path');
const fs = require('fs');
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Doctor = require('../models/Doctor');
const User = require('../models/User');

const NAME_MAPPINGS = [
  { match: 'Child Specialist A', newName: 'Dr. Sneha Chatterjee', newEmail: 'dr.sneha.chatterjee@brainwarehospital.edu.in' },
  { match: 'Child Specialist B', newName: 'Dr. Subhashis Sen', newEmail: 'dr.subhashis.sen@brainwarehospital.edu.in' },
  { match: 'ENT Specialist A', newName: 'Dr. Alok Nath Basu', newEmail: 'dr.aloknath.basu@brainwarehospital.edu.in' },
  { match: 'ENT Specialist B', newName: 'Dr. Payel Mukherjee', newEmail: 'dr.payel.mukherjee@brainwarehospital.edu.in' },
  { match: 'General Specialist A', newName: 'Dr. Debjyoti Ray', newEmail: 'dr.debjyoti.ray@brainwarehospital.edu.in' },
  { match: 'General Specialist B', newName: 'Dr. Sangeeta Dey', newEmail: 'dr.sangeeta.dey@brainwarehospital.edu.in' },
  { match: 'Gynae Specialist A', newName: 'Dr. Rupa Ganguly', newEmail: 'dr.rupa.ganguly@brainwarehospital.edu.in' },
  { match: 'Gynae Specialist B', newName: 'Dr. Madhusudan Roy', newEmail: 'dr.madhusudan.roy@brainwarehospital.edu.in' },
  { match: 'Onco Specialist A', newName: 'Dr. Soumya Sengupta', newEmail: 'dr.soumya.sengupta@brainwarehospital.edu.in' },
  { match: 'Onco Specialist B', newName: 'Dr. Ipsita Banerjee', newEmail: 'dr.ipsita.banerjee@brainwarehospital.edu.in' },
  { match: 'Paediatric Specialist A', newName: 'Dr. Bikramjit Das', newEmail: 'dr.bikramjit.das@brainwarehospital.edu.in' },
  { match: 'Paediatric Specialist B', newName: 'Dr. Archana Majumdar', newEmail: 'dr.archana.majumdar@brainwarehospital.edu.in' },
  { match: 'Radiation Specialist A', newName: 'Dr. Debabrata Poddar', newEmail: 'dr.debabrata.poddar@brainwarehospital.edu.in' },
  { match: 'Radiation Specialist B', newName: 'Dr. Sharmistha Guha', newEmail: 'dr.sharmistha.guha@brainwarehospital.edu.in' },
];

function sanitizeName(name) {
  let s = (name || 'doctor').toLowerCase().replace(/^dr\.\s+/i, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  return `dr_${s}`;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const doctors = await Doctor.find();
    console.log(`Checking ${doctors.length} doctors for generic placeholder names...`);

    let updatedCount = 0;

    for (const doc of doctors) {
      const currentName = doc.fullName || '';
      const currentEmail = doc.email || '';
      
      // Match explicit mapping or generic pattern
      const mapping = NAME_MAPPINGS.find(m => 
        currentName.toLowerCase().includes(m.match.toLowerCase()) || 
        currentEmail.toLowerCase().includes(m.match.toLowerCase())
      );

      if (mapping) {
        console.log(`Updating generic doctor: "${currentName}" -> "${mapping.newName}"`);
        
        // Find linked User before updating email
        const userObj = await User.findOne({ 
          $or: [
            { email: doc.email },
            { fullName: currentName.replace(/^dr\.\s+/i, '') }
          ]
        });

        doc.fullName = mapping.newName;
        doc.email = mapping.newEmail;

        const cleanName = sanitizeName(mapping.newName);
        const fileName = `${cleanName}.jpg`;
        const relativePath = `/uploads/doctors/${fileName}`;

        doc.avatarUrl = relativePath;
        doc.profileImage = relativePath;
        await doc.save();

        if (userObj) {
          userObj.fullName = mapping.newName.replace(/^dr\.\s+/i, '');
          userObj.email = mapping.newEmail;
          userObj.avatar = relativePath;
          await userObj.save();
        }

        updatedCount++;
      } else if (/specialist\s+[a-z0-9]+/i.test(currentName) || /specialist\s+[a-z0-9]+/i.test(currentEmail)) {
        // Fallback for any other "Specialist A/B" patterns
        const specName = doc.specialization || 'Clinical';
        const randomSurname = ['Bose', 'Mukherjee', 'Chaudhuri', 'Dutta', 'Sarkar', 'Biswas', 'Mitra', 'Bhowmick'][updatedCount % 8];
        const generatedName = `Dr. ${specName.split(' ')[0]} ${randomSurname}`;
        const generatedEmail = `dr.${specName.split(' ')[0].toLowerCase()}.${randomSurname.toLowerCase()}@brainwarehospital.edu.in`;

        console.log(`Updating generic pattern doctor: "${currentName}" -> "${generatedName}"`);

        doc.fullName = generatedName;
        doc.email = generatedEmail;

        const cleanName = sanitizeName(generatedName);
        const fileName = `${cleanName}.jpg`;
        const relativePath = `/uploads/doctors/${fileName}`;

        doc.avatarUrl = relativePath;
        doc.profileImage = relativePath;
        await doc.save();

        if (doc.user) {
          const userObj = await User.findById(doc.user._id || doc.user);
          if (userObj) {
            userObj.fullName = generatedName.replace(/^dr\.\s+/i, '');
            userObj.email = generatedEmail;
            userObj.avatar = relativePath;
            await userObj.save();
          }
        }

        updatedCount++;
      }
    }

    console.log(`\n Successfully updated ${updatedCount} generic doctor records with unique doctor names!`);

    // Re-run photo downloader to generate dr_<doctor_name>.jpg for newly named doctors
    console.log('\nRunning photo downoader for updated doctor names...');
    require('./downloadDoctorPhotosToUploads');

  } catch (err) {
    console.error('Error updating doctor names:', err);
    process.exit(1);
  }
}

run();
