const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('STAFF', 'ADMIN'));

router.get('/profile', staffController.getStaffProfile);
router.put('/profile', staffController.updateStaffProfile);
router.put('/leave', staffController.setLeave);
router.post('/leave-request', staffController.applyLeave);
router.get('/leave-requests', staffController.getLeaveRequests);
router.post('/walk-in', staffController.registerWalkIn);
router.get('/search', staffController.searchPatients);
router.put('/appointments/:id/check-in', staffController.checkIn);
router.put('/appointments/:id/check-out', staffController.checkOut);

module.exports = router;
