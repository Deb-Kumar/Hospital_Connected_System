const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const ai = require('../utils/ai');
const { getPatientByUserId } = require('../utils/resolvers');
const { uploadMedicalRecordFile } = require('../utils/fileStorage');

// GET /api/patient/:id/profile   (:id is the person's User id)
exports.getProfile = async (req, res) => {
  try {
    const patient = await getPatientByUserId(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
    return res.json(patient);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/patient/:id/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, email, gender, age, bloodGroup, address, emergencyContact, allergies, chronicConditions, insuranceProvider, insurancePolicyNumber } = req.body;
    const patient = await getPatientByUserId(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (gender !== undefined) updateFields.gender = gender;
    if (age !== undefined && age !== '' && age !== null) updateFields.age = Number(age);
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;
    if (address !== undefined) updateFields.address = address;
    if (emergencyContact !== undefined) updateFields.emergencyContact = emergencyContact;
    if (allergies !== undefined) updateFields.allergies = allergies;
    if (chronicConditions !== undefined) updateFields.chronicConditions = chronicConditions;
    if (insuranceProvider !== undefined) updateFields.insuranceProvider = insuranceProvider;
    if (insurancePolicyNumber !== undefined) updateFields.insurancePolicyNumber = insurancePolicyNumber;

    const updated = await Patient.findByIdAndUpdate(
      patient._id,
      { $set: updateFields },
      { new: true }
    );

    // Keep User Proxy model in sync
    try {
      const { UserProxy } = require('../models/User');
      const targetUserId = patient.user || patient._id;
      const u = await UserProxy.findById(targetUserId);
      if (u) {
        if (fullName) u.fullName = fullName;
        if (phone) u.phone = phone;
        if (email) u.email = email;
        await u.save();
      }
    } catch (e) {
      // Ignored
    }

    // Keep all appointments for this patient in sync so name updates everywhere in portals
    try {
      const Appointment = require('../models/Appointment');
      const aptUpdateFields = {};
      if (fullName) aptUpdateFields.patientName = fullName;
      if (phone) aptUpdateFields.patientPhone = phone;
      if (email) aptUpdateFields.patientEmail = email;
      if (Object.keys(aptUpdateFields).length > 0) {
        await Appointment.updateMany(
          { patient: patient._id },
          { $set: aptUpdateFields }
        );
      }
    } catch (e) {
      // Ignored
    }

    return res.json({
      success: true,
      patient: updated,
      user: {
        id: updated._id,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        role: updated.role || 'PATIENT'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/patient/:id/family  (Family Member Profiles)
exports.addFamilyMember = async (req, res) => {
  try {
    const primary = await getPatientByUserId(req.params.id);
    if (!primary) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    const familyMember = await Patient.create({ ...req.body, primaryAccount: primary._id });
    return res.status(201).json(familyMember);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patient/:id/family
exports.getFamilyMembers = async (req, res) => {
  try {
    const primary = await getPatientByUserId(req.params.id);
    if (!primary) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    const members = await Patient.find({ primaryAccount: primary._id }).populate('user', '-password');
    return res.json(members);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/patient/:id/records  (Health Record Upload + AI Report Summary)
exports.uploadRecord = async (req, res) => {
  try {
    const patient = await getPatientByUserId(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    const { recordType, title, fileUrl } = req.body;
    const record = await MedicalRecord.create({
      patient: patient._id,
      recordType,
      title,
      fileUrl,
      aiSummary: ai.summarizeReport(title),
    });
    return res.status(201).json(record);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/patient/:id/records/upload  (multipart/form-data, field name "file")
// Actually stores the uploaded file (Cloudinary in production, local disk in
// dev) instead of trusting a client-supplied fileUrl string. Kept as a
// separate endpoint from uploadRecord above so existing web-app calls that
// already pass a fileUrl directly keep working unchanged.
exports.uploadRecordFile = async (req, res) => {
  try {
    const patient = await getPatientByUserId(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Use field name "file".' });
    }

    const { recordType, title } = req.body;
    const { url } = await uploadMedicalRecordFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    const record = await MedicalRecord.create({
      patient: patient._id,
      recordType: recordType || 'LAB_REPORT',
      title: title || req.file.originalname,
      fileUrl: url,
      aiSummary: ai.summarizeReport(title || req.file.originalname),
    });

    return res.status(201).json(record);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patient/:id/records
exports.getRecords = async (req, res) => {
  try {
    const patient = await getPatientByUserId(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    const records = await MedicalRecord.find({ patient: patient._id }).sort({ createdAt: -1 });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/patient/:id
exports.deleteAccount = async (req, res) => {
  try {
    const patient = await getPatientByUserId(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    // Delete Patient document
    await Patient.findByIdAndDelete(patient._id);

    // Delete UserProxy if exists
    try {
      const { UserProxy } = require('../models/User');
      await UserProxy.findByIdAndDelete(patient.user || patient._id);
    } catch (e) {}

    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
