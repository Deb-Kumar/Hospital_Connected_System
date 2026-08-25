const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, default: '' },
  patientPhone: { type: String, default: '' },
  patientEmail: { type: String, default: '' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  departmentName: { type: String, default: '' },
  needsReceptionistAssignment: { type: Boolean, default: false },

  appointmentDate: { type: String, required: true }, // YYYY-MM-DD
  appointmentTime: { type: String, required: true }, // HH:mm

  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'ABSENT'],
    default: 'PENDING',
  },

  queueNumber: { type: Number },
  tokenNumber: { type: String },
  estimatedWaitMinutes: { type: Number, default: 0 },

  age: { type: Number },
  bloodGroup: { type: String },

  reasonForVisit: { type: String },
  cancellationReason: { type: String },
  videoConsultation: { type: Boolean, default: false },

  rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },

  paymentAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' },
  paymentMethod: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
