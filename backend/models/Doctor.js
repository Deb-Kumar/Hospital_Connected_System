const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
     type: String, 
     required: true, 
     unique: true, 
     lowercase: true, 
     trim: true 
    },
  phone: {
     type: String, 
     required: true, 
     unique: true, 
     trim: true 
    },
  password: {
     type: String, 
     required: true 
    }, // bcrypt hashed
  role: {
     type: String, 
     default: 'DOCTOR' 
    },

  department: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Department' 
    },
  qualification: {
     type: String 
    },
  specialization: {
     type: String 
    },
  profileImage: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  bio: {
    type: String, 
    default: '' 
  },
  experienceYears: {
    type: Number, 
    default: 0 
  },
  consultationFee: {
     type: Number, 
     default: 500 
    },

  // e.g. "MON:09:00-13:00,WED:09:00-13:00"
  availabilitySchedule: { 
    type: String, 
    default: '' 
  },
  onLeave: { 
    type: Boolean, 
    default: false 
  },
  leaveReason: { 
    type: String 
  },

  // Admin verification workflow — every doctor starts PENDING at sign-up
  // and cannot log in until an Admin approves them.
  approvalStatus: {
     type: String, 
     enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' 
    },
  rejectionReason: { 
    type: String 
  },

  rating: { 
    type: Number, default: 0 
  },

  emailVerified: {
     type: Boolean, 
     default: false 
    },
  phoneVerified: { 
    type: Boolean, 
    default: false 
  },
  twoFactorEnabled: {
     type: Boolean, 
     default: false 
  },
  active: {
     type: Boolean, 
     default: true 
  },

  otpCode: {
     type: String 
  },
  otpExpiry: {
     type: Date 
  },
  pendingNewEmail: {
     type: String 
  },
  lastPasswordChangedAt: {
     type: Date 
  },
}, { timestamps: true });

doctorSchema.virtual('user').get(function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    active: this.active,
    approvalStatus: this.approvalStatus,
  };
});
doctorSchema.set('toJSON', { 
  virtuals: true 
});
doctorSchema.set('toObject', { 
  virtuals: true 
});

module.exports = mongoose.model('Doctor', doctorSchema);
