const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, requireRole } = require('../middleware/auth');

// PUBLIC — guests need to see doctors by department to book without logging in.
router.get('/all', doctorController.getAll);
router.get('/department/:departmentId', doctorController.getByDepartment);

// Doctor-only actions
router.put('/:id/availability', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.updateAvailability);
router.put('/:id/leave', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.setLeave);
router.post('/:id/leave-request', protect, requireRole('DOCTOR'), doctorController.applyLeave);
router.get('/:id/leave-requests', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.getLeaveRequests);
router.post('/prescription', protect, requireRole('DOCTOR'), doctorController.createPrescription);
router.get('/:id/queue/today', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.getTodayQueue);
router.get('/:id/revenue', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.getRevenueSummary);
router.get('/:id/profile', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.getDoctorProfile);
router.put('/:id/profile', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.updateDoctorProfile);
router.get('/:id/patients', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.getDoctorPatients);
router.get('/:id/prescriptions', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.getDoctorPrescriptions);
router.post('/request-email-change-otp', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.requestEmailChangeOtp);
router.post('/verify-email-change-otp', protect, requireRole('DOCTOR', 'ADMIN'), doctorController.verifyEmailChangeOtp);

module.exports = router;
