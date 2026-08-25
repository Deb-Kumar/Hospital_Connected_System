const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
     type: String, 
     required: true, 
     trim: true 
    },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  subject: { 
    type: String, 
    default: 'General Inquiry', 
    trim: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['NEW', 'IN_PROGRESS', 'RESOLVED'], 
    default: 'NEW' 
  },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Inquiry', inquirySchema);
