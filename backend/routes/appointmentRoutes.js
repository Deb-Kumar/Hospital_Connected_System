const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, requireRole } = require('../middleware/auth');

// PUBLIC — no login required. Must stay above router.use(protect) below.
router.post('/book-guest', appointmentController.bookGuest);

router.use(protect); // everything below this line requires login

router.get('/today', requireRole('STAFF', 'ADMIN'), appointmentController.getTodaysAppointments);
router.get('/unassigned', appointmentController.getUnassignedAppointments);
router.put('/:id/assign-doctor', appointmentController.assignDoctor);
router.post('/book', appointmentController.book);
router.put('/:id/reschedule', appointmentController.reschedule);
router.put('/:id/cancel', appointmentController.cancel);
router.put('/:id/status', appointmentController.updateStatus);
router.get('/patient/:patientId', appointmentController.getHistoryForPatient);
router.get('/doctor/:doctorId/queue', appointmentController.getQueueForDoctor);
router.get('/doctor/:doctorId/availability', appointmentController.checkAvailability);

module.exports = router;
