const ai = require('../utils/ai');

// POST /api/ai/symptom-check
exports.symptomCheck = (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) return res.status(400).json({ success: false, message: 'symptoms text is required' });
  return res.json(ai.checkSymptoms(symptoms));
};

// POST /api/ai/chatbot
exports.chatbot = (req, res) => {
  const { message } = req.body;
  return res.json({ reply: ai.chatbotReply(message || '') });
};

// GET /api/ai/health-tips
exports.healthTips = (req, res) => {
  return res.json(ai.getHealthTips());
};

// POST /api/ai/suggest-time
exports.suggestTime = (req, res) => {
  const bookedTimes = req.body.bookedTimes || [];
  return res.json({ suggestedTime: ai.suggestAppointmentTime(bookedTimes) });
};
