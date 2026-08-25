const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/doctors', adminController.getAllDoctors);
router.put('/doctors/:id', adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);
router.get('/doctors/pending', adminController.getPendingDoctors);
router.put('/doctors/:id/approve', adminController.approveDoctor);
router.put('/doctors/:id/reject', adminController.rejectDoctor);
router.get('/patients', adminController.getAllPatients);
router.get('/receptionists', adminController.getAllReceptionists);
router.get('/staff/pending', adminController.getPendingStaff);
router.put('/staff/:id/approve', adminController.approveStaff);
router.put('/staff/:id/reject', adminController.rejectStaff);
router.post('/staff', adminController.createStaff);
router.put('/staff/:id', adminController.updateStaff);
router.delete('/staff/:id', adminController.deleteStaff);
router.put('/users/:id/deactivate', adminController.deactivateUser);
router.put('/users/:id/activate', adminController.activateUser);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);
router.get('/departments', adminController.getAllDepartments);
router.get('/appointments', adminController.getAllAppointments);
router.get('/reports/revenue', adminController.getRevenueReport);

// Security & Audit Logs
router.get('/security/login-history', adminController.getSecurityAuditLogs);
router.delete('/security/audit-logs', adminController.deleteAuditLogs);

// System Broadcast Notices
router.get('/notices', adminController.getNotices);
router.post('/notices', adminController.createNotice);
router.put('/notices/:id/toggle', adminController.toggleNoticeStatus);
router.delete('/notices/:id', adminController.deleteNotice);

// Global System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

// Medical Records & Prescriptions Inspection Audit
router.get('/medical-records', adminController.getMedicalRecordsOverview);
router.get('/prescriptions', adminController.getPrescriptionsOverview);

// Admin Profile Management
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.put('/profile/password', adminController.changeAdminPassword);

// Doctor & Staff Leave Applications Register
router.get('/leaves', adminController.getAllLeaves);
router.put('/leaves/toggle', adminController.toggleUserLeave);
router.put('/leaves/:id/approve', adminController.approveLeaveRequest);
router.put('/leaves/:id/reject', adminController.rejectLeaveRequest);
router.put('/leaves/:id/revoke', adminController.revokeLeaveRequest);

module.exports = router;
