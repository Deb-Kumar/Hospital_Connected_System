const Admin = require('./Admin');
const Doctor = require('./Doctor');
const Staff = require('./Staff');
const Patient = require('./Patient');

// Helper object mapping roles to Mongoose models
const Models = {
  ADMIN: Admin,
  DOCTOR: Doctor,
  STAFF: Staff,
  RECEPTIONIST: Staff,
  PATIENT: Patient,
};

async function findOne(query) {
  let doc = await Admin.findOne(query);
  if (!doc) doc = await Doctor.findOne(query);
  if (!doc) doc = await Staff.findOne(query);
  if (!doc) doc = await Patient.findOne(query);
  return doc;
}

async function findById(id) {
  let doc = await Admin.findById(id);
  if (!doc) doc = await Doctor.findById(id);
  if (!doc) doc = await Staff.findById(id);
  if (!doc) doc = await Patient.findById(id);
  return doc;
}

async function findByIdAndUpdate(id, update, options) {
  let doc = await Admin.findByIdAndUpdate(id, update, options);
  if (!doc) doc = await Doctor.findByIdAndUpdate(id, update, options);
  if (!doc) doc = await Staff.findByIdAndUpdate(id, update, options);
  if (!doc) doc = await Patient.findByIdAndUpdate(id, update, options);
  return doc;
}

async function findByIdAndDelete(id) {
  let doc = await Admin.findByIdAndDelete(id);
  if (!doc) doc = await Doctor.findByIdAndDelete(id);
  if (!doc) doc = await Staff.findByIdAndDelete(id);
  if (!doc) doc = await Patient.findByIdAndDelete(id);
  return doc;
}

module.exports = {
  Admin,
  Doctor,
  Staff,
  Patient,
  Models,
  findOne,
  findById,
  findByIdAndUpdate,
  findByIdAndDelete,
};
