const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  fullName: {
     type: String, 
     required: true, 
     trim: true 
    },
  email: { 
    type: String, 
    required: false, 
    unique: true, 
    sparse: true, 
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
    default: 'PATIENT' 
  },

  // If set, this is a family member profile linked to a primary account holder
  primaryAccount: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    default: null 
  },

  dateOfBirth: { 
    type: Date 
  },
  age: { 
    type: Number 
  },
  gender: { 
    type: String 
  },
  bloodGroup: { 
    type: String 
  },
  address: { 
    type: String 
  },
  emergencyContact: { 
    type: String 
  },
  allergies: { 
    type: String 
  },
  chronicConditions: { 
    type: String 
  },
  insuranceProvider: { 
    type: String 
  },
  insurancePolicyNumber: { 
    type: String 
  },

  qrCodeId: { 
    type: String 
  },
  isGuestAccount: { 
    type: Boolean, 
    default: false 
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
}, { 
  timestamps: true 
});

patientSchema.virtual('user').get(function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    active: this.active,
  };
});
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
