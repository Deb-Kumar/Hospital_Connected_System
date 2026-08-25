const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// PUBLIC — exposes only the non-sensitive subset of SystemSetting. Used by
// the Android app's Emergency screen and by guest-facing flows that need
// OPD hours before the person has logged in.
router.get('/public', adminController.getPublicSettings);

module.exports = router;
