const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

async function getPatientByUserId(userId) {
  let patient = await Patient.findById(userId);
  if (!patient) {
    patient = await Patient.findOne({ user: userId });
  }
  return patient;
}

async function getDoctorByUserId(userId) {
  let doctor = await Doctor.findById(userId).populate('department');
  if (!doctor) {
    doctor = await Doctor.findOne({ user: userId }).populate('department');
  }
  return doctor;
}

module.exports = { getPatientByUserId, getDoctorByUserId };
