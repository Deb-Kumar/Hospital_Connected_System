const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Staff = require('../models/Staff');
const UserProxy = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const LoginHistory = require('../models/LoginHistory');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const SystemNotice = require('../models/SystemNotice');
const SystemSetting = require('../models/SystemSetting');
const LeaveRequest = require('../models/LeaveRequest');
const { sendEmail } = require('../utils/notification');
const { promoteApprovedDoctorPhoto, deleteDoctorPhotoFile } = require('../utils/fileStorage');

// GET /api/admin/dashboard  (Dashboard with Statistics)
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalStaff] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Staff.countDocuments(),
    ]);

    const activeStaffCount = await Staff.countDocuments({ approvalStatus: 'APPROVED' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAppointmentsCount = await Appointment.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const pendingApprovalsCount = await Doctor.countDocuments({ approvalStatus: 'PENDING' });

    const totalBlogsCount = await (require('../models/Blog')).countDocuments();

    return res.json({
      totalPatients,
      totalDoctors,
      totalStaff: activeStaffCount || totalStaff,
      todayAppointments: todayAppointmentsCount,
      pendingApprovals: pendingApprovalsCount,
      totalBlogs: totalBlogsCount,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('department');
    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id
exports.updateDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      qualification,
      experienceYears,
      departmentId,
      specialization,
      availabilitySchedule,
    } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    if (fullName) doctor.fullName = fullName;
    if (email) doctor.email = email;
    if (phone) doctor.phone = phone;
    if (qualification) doctor.qualification = qualification;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (departmentId) doctor.department = departmentId;
    if (specialization) doctor.specialization = specialization;
    if (availabilitySchedule !== undefined) doctor.availabilitySchedule = availabilitySchedule;

    await doctor.save();
    const updatedDoctor = await Doctor.findById(doctor._id).populate('department');

    return res.json({ success: true, message: 'Doctor details updated successfully.', doctor: updatedDoctor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/doctors/:id
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    // Delete doctor photo file from disk if present
    const photoPath = doctor.avatarUrl || doctor.profileImage || '';
    if (photoPath) {
      deleteDoctorPhotoFile(photoPath);
    }

    if (doctor.email) {
      await UserProxy.deleteMany({ email: doctor.email });
    }
    return res.json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/doctors/pending  (queue of sign-ups waiting on Admin review)
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ approvalStatus: 'PENDING' })
      .populate('department')
      .sort({ createdAt: 1 });
    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/approve
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Promote photo from dr_<timestamp>.jpg to dr_<doctor_name>.jpg
    const currentPhoto = doctor.avatarUrl || doctor.profileImage || '';
    const promotedPhoto = promoteApprovedDoctorPhoto(currentPhoto, doctor.fullName);

    doctor.approvalStatus = 'APPROVED';
    doctor.rejectionReason = undefined;
    if (promotedPhoto) {
      doctor.avatarUrl = promotedPhoto;
      doctor.profileImage = promotedPhoto;
    }
    await doctor.save();

    if (doctor.email) {
      const user = await UserProxy.findOne({ email: doctor.email });
      if (user) {
        user.active = true;
        if (promotedPhoto) user.avatar = promotedPhoto;
        await user.save();
      }

      await sendEmail(doctor.email, 'Application Approved',
        `Good news, Dr. ${doctor.fullName} — your hospital portal application has been approved. You can now log in and start managing appointments.`);
    }
    return res.json(doctor);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/reject
exports.rejectDoctor = async (req, res) => {
  try {
    const { reason } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Automatically remove photo file from uploads/doctors on rejection
    const currentPhoto = doctor.avatarUrl || doctor.profileImage || '';
    if (currentPhoto) {
      deleteDoctorPhotoFile(currentPhoto);
    }

    doctor.approvalStatus = 'REJECTED';
    doctor.rejectionReason = reason || 'Not specified';
    doctor.avatarUrl = '';
    doctor.profileImage = '';
    await doctor.save();

    if (doctor.email) {
      await sendEmail(doctor.email, 'Application Update',
        `Dear Dr. ${doctor.fullName}, your hospital portal application was not approved.${reason ? ` Reason: ${reason}` : ''} Please contact hospital administration for details.`);
    }
    return res.json(doctor);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    return res.json(patients);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/receptionists
exports.getAllReceptionists = async (req, res) => {
  try {
    const staff = await Staff.find();
    return res.json(staff);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/staff/pending
exports.getPendingStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ approvalStatus: 'PENDING' }).sort({ createdAt: 1 });
    return res.json(staff);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/staff/:id/approve
exports.approveStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'APPROVED', rejectionReason: undefined },
      { new: true }
    );
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    if (staff.email) {
      await sendEmail(staff.email, 'Staff Account Approved',
        `Good news, ${staff.fullName} — your hospital staff account has been approved. You can now log in and start managing the reception desk.`);
    }
    return res.json(staff);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/staff/:id/reject
exports.rejectStaff = async (req, res) => {
  try {
    const { reason } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'REJECTED', rejectionReason: reason || 'Not specified' },
      { new: true }
    );
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    if (staff.email) {
      await sendEmail(staff.email, 'Staff Account Update',
        `Dear ${staff.fullName}, your hospital staff account application was not approved.${reason ? ` Reason: ${reason}` : ''} Please contact hospital administration for details.`);
    }
    return res.json(staff);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/staff  (Admin creates a new Staff Member directly)
exports.createStaff = async (req, res) => {
  try {
    const { fullName, email, phone, password, deskNumber, branch, designation, permissions } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'FullName, email, phone, and password are required' });
    }

    const existingUser = await UserProxy.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase()
          ? 'User with this email already exists'
          : 'User with this phone number already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const validDesignation = ['RECEPTIONIST', 'OPD_DESK', 'OPERATION_THEATER', 'BILLING_DESK', 'PHARMACY_DESK', 'PATIENT_CARE'].includes(designation)
      ? designation
      : 'RECEPTIONIST';

    const staff = await Staff.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'STAFF',
      designation: validDesignation,
      permissions: Array.isArray(permissions) ? permissions : ['manage_queue', 'assign_doctor', 'walkin_registration', 'manage_inquiries'],
      deskNumber: deskNumber || 'Desk 1 - Reception Main',
      approvalStatus: 'APPROVED',
      emailVerified: true,
      phoneVerified: true,
      active: true,
    });

    return res.status(201).json(staff);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/deactivate  and  /activate
exports.deactivateUser = async (req, res) => {
  try {
    await UserProxy.findByIdAndUpdate(req.params.id, { active: false });
    return res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    await UserProxy.findByIdAndUpdate(req.params.id, { active: true });
    return res.json({ success: true, message: 'User activated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/staff/:id  (Update staff member details & RBAC permissions)
exports.updateStaff = async (req, res) => {
  try {
    const { fullName, email, phone, deskNumber, branch, designation, permissions } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    if (fullName) staff.fullName = fullName;
    if (email) staff.email = email.toLowerCase();
    if (phone) staff.phone = phone;
    if (deskNumber !== undefined) staff.deskNumber = deskNumber;

    if (designation && ['RECEPTIONIST', 'OPD_DESK', 'OPERATION_THEATER', 'BILLING_DESK', 'PHARMACY_DESK', 'PATIENT_CARE'].includes(designation)) {
      staff.designation = designation;
    }
    if (permissions && Array.isArray(permissions)) {
      staff.permissions = permissions;
    }

    await staff.save();
    return res.json(staff);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/staff/:id  (Delete staff member)
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });
    return res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/departments
exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create({
      active: true,
      ...req.body,
    });
    return res.status(201).json(department);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/departments/:id
exports.updateDepartment = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.branch !== undefined) updateData.branch = req.body.branch;
    if (req.body.consultationFee !== undefined) updateData.consultationFee = req.body.consultationFee;
    if (req.body.active !== undefined) updateData.active = Boolean(req.body.active);

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    return res.json({ success: true, message: 'Department updated successfully.', department });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/departments/:id
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    return res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/departments (Admin — all active & inactive departments)
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return res.json(departments);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/departments (Public — active departments only for patient perspective)
// Returns a raw array (NOT wrapped in {success, departments}) because the React
// web app and the Android app both call `.map()` / `.length` directly on the
// response body — wrapping it breaks the department dropdown in guest booking,
// logged-in booking, and the Departments page. Do not change this shape without
// updating every consumer.
exports.getPublicDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ active: { $ne: false } })
      .sort({ name: 1 })
      .lean();

    const doctorCounts = await Doctor.aggregate([
      { $match: { approvalStatus: 'APPROVED', onLeave: { $ne: true } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    const countByDept = new Map(doctorCounts.map((d) => [String(d._id), d.count]));

    const withCounts = departments.map((dept) => ({
      ...dept,
      doctorCount: countByDept.get(String(dept._id)) || 0,
    }));

    return res.json(withCounts);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/appointments  (Appointment Monitoring)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient')
      .populate({ path: 'doctor', populate: 'department' })
      .sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/reports/revenue?from=&to=
exports.getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from && to) {
      query.appointmentDate = { $gte: from, $lte: to };
    }
    const appointments = await Appointment.find(query)
      .populate({ path: 'doctor', populate: 'department' })
      .populate('patient');

    const totalRevenue = appointments
      .filter((a) => a.paymentStatus === 'PAID')
      .reduce((sum, a) => sum + (a.paymentAmount || 0), 0);

    const paidCount = appointments.filter((a) => a.paymentStatus === 'PAID').length;
    const pendingCount = appointments.filter((a) => a.paymentStatus === 'PENDING').length;
    const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

    const deptRevenueMap = {};
    appointments.forEach((apt) => {
      if (apt.paymentStatus === 'PAID') {
        const deptName = apt.doctor?.department?.name || 'General Medicine';
        deptRevenueMap[deptName] = (deptRevenueMap[deptName] || 0) + (apt.paymentAmount || 0);
      }
    });

    const departmentBreakdown = Object.keys(deptRevenueMap).map((dept) => ({
      department: dept,
      revenue: deptRevenueMap[dept],
    }));

    return res.json({
      from: from || 'All Time',
      to: to || 'All Time',
      totalAppointments: appointments.length,
      paidAppointmentsCount: paidCount,
      pendingAppointmentsCount: pendingCount,
      cancelledAppointmentsCount: cancelledCount,
      totalRevenue,
      departmentBreakdown,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 1. GET /api/admin/security/login-history (Security Audit Logs)
exports.getSecurityAuditLogs = async (req, res) => {
  try {
    const { role, actionType, search } = req.query;

    const history = await LoginHistory.find()
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    // Dynamically enrich records missing direct properties
    let enriched = await Promise.all(
      history.map(async (log) => {
        if ((!log.userName || !log.userEmail || !log.userRole) && log.user) {
          try {
            const userDoc = await UserProxy.findById(log.user);
            if (userDoc) {
              log.userName = log.userName || userDoc.fullName || 'User';
              log.userEmail = log.userEmail || userDoc.email || '—';
              log.userRole = (log.userRole === 'RECEPTIONIST' || userDoc.role === 'RECEPTIONIST') ? 'STAFF' : (log.userRole || userDoc.role || 'PATIENT');
            }
          } catch (e) {
            // Ignore lookup error
          }
        }
        if (!log.actionType) log.actionType = 'LOGIN';
        if (!log.userRole || log.userRole === 'RECEPTIONIST') log.userRole = 'STAFF';
        if (!log.userName) log.userName = 'Anonymous User';
        if (!log.userEmail) log.userEmail = '—';
        if (!log.details) log.details = log.actionType === 'LOGIN' ? 'User login session' : 'System modification event';
        return log;
      })
    );

    // Apply Role Filter
    if (role && role.toUpperCase() !== 'ALL') {
      const r = role.toUpperCase();
      enriched = enriched.filter((log) => {
        const uRole = (log.userRole || '').toUpperCase();
        if (r === 'STAFF' || r === 'RECEPTIONIST') {
          return uRole === 'STAFF' || uRole === 'RECEPTIONIST';
        }
        return uRole === r;
      });
    }

    // Apply Action Type Filter
    if (actionType && actionType.toUpperCase() !== 'ALL') {
      const act = actionType.toUpperCase();
      if (act === 'LOGIN') {
        enriched = enriched.filter((log) => (log.actionType || 'LOGIN').toUpperCase() === 'LOGIN');
      } else if (act === 'SYSTEM_MODIFICATION') {
        enriched = enriched.filter((log) => (log.actionType || 'LOGIN').toUpperCase() !== 'LOGIN');
      } else {
        enriched = enriched.filter((log) => (log.actionType || '').toUpperCase() === act);
      }
    }

    // Apply Search Filter
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      enriched = enriched.filter((log) => {
        const name = (log.userName || '').toLowerCase();
        const email = (log.userEmail || '').toLowerCase();
        const ip = (log.ipAddress || '').toLowerCase();
        const details = (log.details || '').toLowerCase();
        const userRole = (log.userRole || '').toLowerCase();
        return name.includes(term) || email.includes(term) || ip.includes(term) || details.includes(term) || userRole.includes(term);
      });
    }

    return res.json(enriched);
  } catch (err) {
    console.error('getSecurityAuditLogs Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/security/audit-logs
exports.deleteAuditLogs = async (req, res) => {
  try {
    const { password, logId, clearAll } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Admin password is required to authorize audit log deletion.' });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid admin password. Verification failed.' });
    }

    if (clearAll) {
      await LoginHistory.deleteMany({});
    } else if (logId) {
      await LoginHistory.findByIdAndDelete(logId);
    } else {
      return res.status(400).json({ success: false, message: 'Target audit log ID or clearAll option is required.' });
    }

    return res.json({
      success: true,
      message: clearAll
        ? 'All security audit logs cleared successfully.'
        : 'Audit log record deleted successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Broadcast Notices Handlers
exports.getNotices = async (req, res) => {
  try {
    const notices = await SystemNotice.find().sort({ createdAt: -1 });
    return res.json(notices);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notice = await SystemNotice.create({
      title,
      message,
      type: type || 'ANNOUNCEMENT',
      createdBy: req.user._id,
    });
    return res.status(201).json(notice);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleNoticeStatus = async (req, res) => {
  try {
    const notice = await SystemNotice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    notice.active = !notice.active;
    await notice.save();
    return res.json({ success: true, active: notice.active, notice });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    await SystemNotice.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/settings/public — safe, non-sensitive subset of SystemSetting for
// unauthenticated clients (Android emergency screen, guest booking hours,
// etc). Deliberately does NOT expose admin-only fields like
// autoApproveDoctors/autoApproveStaff/maintenanceMode.
exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    return res.json({
      hospitalName: settings.hospitalName,
      emergencyHotline: settings.emergencyHotline,
      supportEmail: settings.supportEmail,
      opdOpeningTime: settings.opdOpeningTime,
      opdClosingTime: settings.opdClosingTime,
      slotDurationMinutes: settings.slotDurationMinutes,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Global System Settings Handlers
exports.getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    return res.json({ success: true, message: 'System settings saved successfully', settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Medical Records & Prescriptions Inspection Audit Handlers
exports.getMedicalRecordsOverview = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patient')
      .populate('uploadedByDoctor')
      .sort({ createdAt: -1 });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPrescriptionsOverview = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate({
        path: 'appointment',
        populate: [
          { path: 'patient' },
          { path: 'doctor' },
        ],
      })
      .sort({ createdAt: -1 });
    return res.json(prescriptions);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    return res.json(admin);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const { fullName, phone, twoFactorEnabled } = req.body;
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin profile not found.' });

    if (fullName) admin.fullName = fullName.trim();
    if (phone) admin.phone = phone.replace(/\D/g, '').slice(0, 10);
    if (twoFactorEnabled !== undefined) admin.twoFactorEnabled = Boolean(twoFactorEnabled);
    await admin.save();

    return res.json({
      success: true,
      message: 'Admin profile updated successfully.',
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        twoFactorEnabled: admin.twoFactorEnabled,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/profile/password
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin profile not found.' });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    admin.password = await bcrypt.hash(newPassword, 10);
    if (!Array.isArray(admin.passwordHistory)) {
      admin.passwordHistory = [];
    }
    admin.passwordHistory.push({
      changedAt: new Date(),
      ipAddress: clientIp,
    });
    await admin.save();

    return res.json({
      success: true,
      message: 'Password changed successfully.',
      updatedAt: admin.updatedAt,
      passwordHistory: admin.passwordHistory,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/leaves (Get all Doctor and Staff Leave Applications & Absence records)
exports.getAllLeaves = async (req, res) => {
  try {
    const pendingRequests = await LeaveRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    const approvedRequests = await LeaveRequest.find({ status: 'APPROVED' }).sort({ updatedAt: -1 });
    const rejectedRequests = await LeaveRequest.find({ status: 'REJECTED' }).sort({ updatedAt: -1 });
    const allRequests = await LeaveRequest.find().sort({ createdAt: -1 });

    const doctorsOnLeave = await Doctor.find({ onLeave: true }).populate('department', 'name').select('-password');
    const staffOnLeave = await Staff.find({ onLeave: true }).select('-password');
    const allDoctors = await Doctor.find({ approvalStatus: 'APPROVED' }).populate('department', 'name').select('-password');
    const allStaff = await Staff.find({ approvalStatus: 'APPROVED' }).select('-password');

    return res.json({
      success: true,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      allRequests,
      doctorsOnLeave,
      staffOnLeave,
      allDoctors,
      allStaff,
      pendingCount: pendingRequests.length,
      totalOnLeave: doctorsOnLeave.length + staffOnLeave.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/leaves/:id/approve (Admin approves leave application)
exports.approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    const leaveReq = await LeaveRequest.findById(id);
    if (!leaveReq) return res.status(404).json({ success: false, message: 'Leave application not found' });

    leaveReq.status = 'APPROVED';
    leaveReq.adminComment = adminComment || 'Approved by Admin';
    leaveReq.reviewedAt = new Date();
    await leaveReq.save();

    // Update personnel onLeave status in DB
    if (leaveReq.applicantModel === 'Doctor') {
      await Doctor.findByIdAndUpdate(leaveReq.applicantId, {
        onLeave: true,
        leaveReason: leaveReq.reason
      });
    } else if (leaveReq.applicantModel === 'Staff') {
      await Staff.findByIdAndUpdate(leaveReq.applicantId, {
        onLeave: true,
        leaveReason: leaveReq.reason
      });
    }

    return res.json({ success: true, message: `Leave application for ${leaveReq.applicantName} has been approved.`, leaveRequest: leaveReq });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/leaves/:id/reject (Admin rejects leave application with reason)
exports.rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminComment, rejectionReason } = req.body;
    const leaveReq = await LeaveRequest.findById(id);
    if (!leaveReq) return res.status(404).json({ success: false, message: 'Leave application not found' });

    leaveReq.status = 'REJECTED';
    leaveReq.adminComment = rejectionReason || adminComment || 'Rejected by Admin';
    leaveReq.reviewedAt = new Date();
    await leaveReq.save();

    return res.json({ success: true, message: `Leave application for ${leaveReq.applicantName} has been rejected.`, leaveRequest: leaveReq });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/leaves/:id/revoke (Admin revokes/terminates an approved leave)
exports.revokeLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveReq = await LeaveRequest.findById(id);
    if (!leaveReq) return res.status(404).json({ success: false, message: 'Leave application not found' });

    leaveReq.status = 'REJECTED';
    leaveReq.adminComment = 'Leave revoked by Admin (Duty Resumed)';
    leaveReq.reviewedAt = new Date();
    await leaveReq.save();

    // Mark personnel back to ON DUTY
    if (leaveReq.applicantModel === 'Doctor') {
      await Doctor.findByIdAndUpdate(leaveReq.applicantId, { onLeave: false, leaveReason: '' });
    } else if (leaveReq.applicantModel === 'Staff') {
      await Staff.findByIdAndUpdate(leaveReq.applicantId, { onLeave: false, leaveReason: '' });
    }

    return res.json({ success: true, message: `Leave revoked for ${leaveReq.applicantName}. Status reset to ON DUTY.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/leaves/toggle (Admin manually updates leave status of Doctor or Staff)
exports.toggleUserLeave = async (req, res) => {
  try {
    const { userId, userType, onLeave, reason } = req.body;
    if (!userId || !userType) {
      return res.status(400).json({ success: false, message: 'userId and userType are required.' });
    }
    if (userType === 'DOCTOR') {
      await Doctor.findByIdAndUpdate(userId, { onLeave: !!onLeave, leaveReason: reason || '' });
    } else if (userType === 'STAFF') {
      await Staff.findByIdAndUpdate(userId, { onLeave: !!onLeave, leaveReason: reason || '' });
    }
    return res.json({ success: true, message: 'Leave status updated by Admin.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


