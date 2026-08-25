const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  applicantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  applicantModel: { 
    type: String, enum: ['Doctor', 'Staff'], 
    required: true 
  },
  applicantName: { 
    type: String, 
    required: true 
  },
  applicantEmail: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true 
  }, // 'DOCTOR' or staff designation e.g. 'RECEPTIONIST'
  departmentOrBranch: {
     type: String, 
     default: ''
    },
  reason: { 
    type: String, 
    required: true 
  },
  startDate: { 
    type: String, 
    default: '' 
  },
  endDate: {
     type: String, 
     default: '' 
    },
  totalDays: { 
    type: Number, 
    default: 1 
  },

  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  adminComment: { type: String, default: '' },
  reviewedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
