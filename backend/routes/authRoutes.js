const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { protect } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.put('/toggle-2fa', protect, authController.toggle2FA);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', protect, authController.changePassword);

// Dev-only: reset password by phone.
// Disabled outside development, and requires DEV_RESET_KEY as a shared secret
// even in development, so it can never be hit unauthenticated in production.
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev-reset', async (req, res) => {
    const providedKey = req.headers['x-dev-reset-key'];
    if (!process.env.DEV_RESET_KEY || providedKey !== process.env.DEV_RESET_KEY) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const bcrypt = require('bcryptjs');
    const Patient = require('../models/Patient');
    const { phone, newPassword } = req.body;
    const patient = await Patient.findOne({ phone });
    if (!patient) return res.status(404).json({ message: 'Not found' });
    patient.password = await bcrypt.hash(newPassword || 'Test@123', 10);
    patient.isGuestAccount = false;
    await patient.save();
    res.json({ success: true, message: `Password reset for ${patient.fullName} (${phone})`, email: patient.email });
  });
}

module.exports = router;
