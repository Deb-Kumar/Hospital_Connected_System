const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/symptom-check', protect, aiController.symptomCheck);
router.post('/chatbot', protect, aiController.chatbot);
router.get('/health-tips', protect, aiController.healthTips);
router.post('/suggest-time', protect, aiController.suggestTime);

module.exports = router;
