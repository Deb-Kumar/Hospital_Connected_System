const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// PUBLIC — department names/branches are non-sensitive, and guests need
// this list to book an appointment without logging in.
router.get('/', adminController.getPublicDepartments);

module.exports = router;
