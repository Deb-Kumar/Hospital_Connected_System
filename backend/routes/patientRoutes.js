const express = require('express');
const router = express.Router();
const multer = require('multer');
const patientController = require('../controllers/patientController');
const { protect, requireRole } = require('../middleware/auth');

// 10MB limit, kept in memory (never touches disk before Cloudinary upload)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect, requireRole('PATIENT', 'ADMIN'));

router.get('/:id/profile', patientController.getProfile);
router.put('/:id/profile', patientController.updateProfile);
router.post('/:id/family', patientController.addFamilyMember);
router.get('/:id/family', patientController.getFamilyMembers);
router.post('/:id/records', patientController.uploadRecord);
router.post('/:id/records/upload', upload.single('file'), patientController.uploadRecordFile);
router.get('/:id/records', patientController.getRecords);
router.delete('/:id', patientController.deleteAccount);

module.exports = router;
