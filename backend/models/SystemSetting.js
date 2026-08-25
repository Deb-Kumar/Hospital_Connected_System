const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  hospitalName: { type: String, default: 'Brainware Medical College & Hospital' },
  emergencyHotline: { type: String, default: '+91 1800-123-4567' },
  supportEmail: { type: String, default: 'support@brainwarehospital.com' },
  opdOpeningTime: { type: String, default: '08:00 AM' },
  opdClosingTime: { type: String, default: '08:00 PM' },
  slotDurationMinutes: { type: Number, default: 30 },
  autoApproveDoctors: { type: Boolean, default: false },
  autoApproveStaff: { type: Boolean, default: false },
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
