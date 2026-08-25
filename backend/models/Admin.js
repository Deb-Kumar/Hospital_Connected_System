const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
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
      trim: true,
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
      default: "ADMIN" 
    },

    emailVerified: { 
      type: Boolean, 
      default: true 
    },
    phoneVerified: { 
      type: Boolean, 
      default: true 
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
    passwordHistory: [
      {
        changedAt: { type: Date, default: Date.now },
        ipAddress: { type: String, default: '127.0.0.1' },
      },
    ],
  },
  { 
    timestamps: true 
  },
);

module.exports = mongoose.model("Admin", adminSchema);
