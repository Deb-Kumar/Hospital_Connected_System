const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const FeedbackCategory = require('../models/FeedbackCategory');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('PATIENT', 'ADMIN'));

// GET — categories list strictly from database
router.get('/categories', async (req, res) => {
  try {
    const categories = await FeedbackCategory.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST — create new category (Admin)
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }
    const existing = await FeedbackCategory.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }
    const category = await FeedbackCategory.create({ name: name.trim() });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE — remove custom category (Admin)
router.delete('/categories/:id', async (req, res) => {
  try {
    await FeedbackCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST — submit feedback
router.post('/', async (req, res) => {
  try {
    const { patientId, rating, category, comments } = req.body;
    const feedback = await Feedback.create({ patientId, rating, category, comments });
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET — all feedbacks for Admin
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate({ path: 'patientId', select: 'fullName email phone' })
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET — feedback history for a patient
router.get('/:patientId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE — remove feedback by ID (Admin)
router.delete('/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
