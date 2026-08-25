const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  recordType: { type: String, enum: ['LAB_REPORT', 'HEALTH_DOCUMENT', 'VACCINATION'], default: 'LAB_REPORT' },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  aiSummary: { type: String },
  uploadedByDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
