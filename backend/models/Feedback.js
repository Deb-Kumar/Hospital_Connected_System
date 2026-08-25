const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  category: {
    type: String,
    required: true
  },
  comments: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
