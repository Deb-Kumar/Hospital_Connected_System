const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId },
  userName: { type: String },
  userEmail: { type: String },
  userRole: { type: String, default: 'PATIENT' },
  actionType: { type: String, default: 'LOGIN' }, // 'LOGIN', 'LOGOUT', 'SYSTEM_MODIFICATION', etc.
  details: { type: String },
  ipAddress: { type: String },
  deviceInfo: { type: String },
  success: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
