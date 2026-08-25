const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { type: String, default: 'STAFF' }, // System role STAFF, designation is operational desk

  designation: {
    type: String,
    enum: ['RECEPTIONIST', 'OPD_DESK', 'OPERATION_THEATER', 'BILLING_DESK', 'PHARMACY_DESK', 'PATIENT_CARE'],
    default: 'OPD_DESK'
  },
  permissions: {
    type: [String],
    default: ['manage_queue', 'assign_doctor', 'walkin_registration', 'manage_inquiries']
  },
  deskNumber: { type: String },

  onLeave: { type: Boolean, default: false },
  leaveReason: { type: String, default: '' },

  // Admin verification workflow — every staff member starts PENDING at sign-up
  // and cannot log in until an Admin approves them.
  approvalStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  rejectionReason: { type: String },

  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  active: { type: Boolean, default: true },

  otpCode: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

staffSchema.virtual('user').get(function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: 'STAFF',
    designation: this.designation || 'OPD_DESK',
    active: this.active,
    approvalStatus: this.approvalStatus,
  };
});
staffSchema.set('toJSON', { virtuals: true });
staffSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Staff', staffSchema, 'staff');
