// Lightweight rule-based AI helpers so the project runs end-to-end with zero
// external cost. Swap any function body for a real OpenAI/Gemini/Claude API
// call when you have API keys — these are the integration points.

const SYMPTOM_TO_DEPARTMENT = [
  ['chest pain', 'Cardiology'],
  ['heart', 'Cardiology'],
  ['bone', 'Orthopedics'],
  ['fracture', 'Orthopedics'],
  ['joint', 'Orthopedics'],
  ['skin', 'Dermatology'],
  ['rash', 'Dermatology'],
  ['child', 'Pediatrics'],
  ['fever', 'General Medicine'],
  ['cough', 'General Medicine'],
  ['headache', 'Neurology'],
  ['vision', 'Ophthalmology'],
  ['eye', 'Ophthalmology'],
  ['tooth', 'Dentistry'],
  ['pregnan', 'Gynecology'],
];

const EMERGENCY_KEYWORDS = [
  'severe chest pain', "can't breathe", 'cannot breathe', 'unconscious',
  'heavy bleeding', 'suicide', 'stroke', 'seizure',
];

function isEmergency(text) {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

function checkSymptoms(symptomsText) {
  const lower = symptomsText.toLowerCase();
  let recommendedDepartment = 'General Medicine';
  for (const [keyword, dept] of SYMPTOM_TO_DEPARTMENT) {
    if (lower.includes(keyword)) {
      recommendedDepartment = dept;
      break;
    }
  }
  const emergency = isEmergency(symptomsText);
  return {
    recommendedDepartment,
    isEmergency: emergency,
    advice: emergency
      ? 'This may be a medical emergency. Please call your local emergency number or go to the nearest ER immediately.'
      : `Based on your symptoms, we suggest booking a consultation with ${recommendedDepartment}.`,
  };
}

function suggestAppointmentTime(bookedTimes) {
  const candidateSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30'];
  return candidateSlots.find((slot) => !bookedTimes.includes(slot)) || '16:00';
}

function chatbotReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('book') || lower.includes('appointment')) {
    return "You can book an appointment from the 'Book Appointment' page — choose a department, doctor, and available slot.";
  }
  if (lower.includes('cancel')) {
    return "Go to 'Appointment History', select the appointment, and click Cancel.";
  }
  if (lower.includes('prescription')) {
    return "Your prescriptions are available under 'Medical History' once your doctor submits them.";
  }
  return "I'm here to help with appointments, prescriptions, and hospital services. Could you rephrase your question?";
}

function getHealthTips() {
  return [
    'Drink at least 8 glasses of water a day.',
    'Aim for 30 minutes of physical activity daily.',
    'Get 7-8 hours of sleep for better recovery.',
    'Include fruits and vegetables in every meal.',
    'Schedule an annual health checkup even when you feel fine.',
  ];
}

function summarizeReport(title) {
  return `AI Summary pending review: '${title}' has been uploaded. Your doctor will review the full report; a plain-language summary will appear here once analyzed.`;
}

function explainPrescription() {
  return 'Your doctor has prescribed the medicines listed above. Take them exactly as directed, complete the full course even if you feel better, and contact the hospital if you notice any side effects.';
}

module.exports = {
  checkSymptoms,
  isEmergency,
  suggestAppointmentTime,
  chatbotReply,
  getHealthTips,
  summarizeReport,
  explainPrescription,
};
