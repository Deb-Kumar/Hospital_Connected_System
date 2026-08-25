const mongoose = require('mongoose');

const systemNoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['EMERGENCY', 'ANNOUNCEMENT', 'MAINTENANCE'], 
    default: 'ANNOUNCEMENT' 
  },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('SystemNotice', systemNoticeSchema);
