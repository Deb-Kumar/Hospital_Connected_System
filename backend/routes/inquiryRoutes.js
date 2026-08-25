const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

// Public route to submit inquiry
router.post('/', inquiryController.createInquiry);

// Admin routes to view & update inquiries
router.get('/', inquiryController.getInquiries);
router.put('/:id/status', inquiryController.updateInquiryStatus);
router.delete('/all', inquiryController.deleteAllInquiries);
router.delete('/:id', inquiryController.deleteInquiry);
router.delete('/', inquiryController.deleteAllInquiries);

module.exports = router;
