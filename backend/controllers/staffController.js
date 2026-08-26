const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Staff = require('../models/Staff');
const LeaveRequest = require('../models/LeaveRequest');

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

// POST /api/staff/walk-in  (Walk-in Patient Registration)
exports.registerWalkIn = async (req, res) => {
  try {
    const { fullName, phone, gender, departmentId, doctorId, age, bloodGroup, appointmentDate, appointmentTime, reasonForVisit } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ success: false, message: 'fullName and phone are required' });
    }
    if (!departmentId || !doctorId) {
      return res.status(400).json({ success: false, message: 'Department and Doctor are required' });
    }

    // Find or create patient
    let patient = await Patient.findOne({ phone });
    if (!patient) {
      const placeholderEmail = `${phone}@walkin.local`;
      const hashedPassword = await bcrypt.hash('Walkin@123', 10);
      patient = await Patient.create({
        fullName,
        phone,
        email: placeholderEmail,
        password: hashedPassword,
        role: 'PATIENT',
        gender,
        phoneVerified: true,
        qrCodeId: `QR-${Date.now()}`,
      });
    }

    // Get department name for the appointment record
    const dept = await Department.findById(departmentId);
    const departmentName = dept ? dept.name : '';

    // Use provided date or default to today
    const apptDate = appointmentDate || new Date().toISOString().split('T')[0];
    const todayCount = await Appointment.countDocuments({ appointmentDate: apptDate });
    const tokenNumber = `Token #${todayCount + 1}`;

    // Use provided time or default to current time
    const now = new Date();
    const apptTime = appointmentTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Create appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      patientName: fullName,
      patientPhone: phone,
      doctor: doctorId,
      departmentName,
      appointmentDate: apptDate,
      appointmentTime: apptTime,
      status: 'PENDING',
      queueNumber: todayCount + 1,
      tokenNumber,
      age: age || undefined,
      bloodGroup: bloodGroup || undefined,
      reasonForVisit: reasonForVisit || 'Walk-in OPD Consultation',
    });

    return res.status(201).json({
      success: true,
      message: `Walk-in registered! Token: ${tokenNumber}`,
      patient,
      appointment,
      tokenNumber,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



// GET /api/staff/search?query=  (Patient Search with Appointment History)
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) return res.json([]);

    const q = query.trim().toLowerCase();
    const patients = await Patient.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    }).select('-password');

    const results = await Promise.all(
      patients.map(async (p) => {
        const pObj = p.toObject({ virtuals: true });

        const appointments = await Appointment.find({
          $or: [
            { patient: p._id },
            { patientPhone: p.phone },
            { patientName: { $regex: p.fullName, $options: 'i' } },
          ],
        })
          .populate({
            path: 'doctor',
            populate: { path: 'department' },
          })
          .sort({ createdAt: -1 });

        pObj.appointments = appointments;
        pObj.totalAppointments = appointments.length;
        return pObj;
      })
    );

    return res.json(results);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/staff/appointments/:id/check-in
exports.checkIn = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status: 'ACCEPTED' }, { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    return res.json(appointment);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/staff/appointments/:id/check-out
exports.checkOut = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status: 'COMPLETED' }, { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    return res.json(appointment);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/staff/profile
exports.getStaffProfile = async (req, res) => {
  try {
    const staffId = req.user._id || req.user.id;
    const staff = await Staff.findById(staffId).select('-password');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });
    return res.json(staff);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/staff/profile
exports.updateStaffProfile = async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;
    const staffId = req.user._id || req.user.id;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    if (fullName) staff.fullName = fullName.trim();
    if (phone) staff.phone = phone.trim();
    if (email) staff.email = email.trim().toLowerCase();

    await staff.save();
    
    const updatedStaff = await Staff.findById(staffId).select('-password');
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      staff: updatedStaff,
      user: updatedStaff.user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/staff/leave (Toggle Staff Leave Status)
exports.setLeave = async (req, res) => {
  try {
    const staffId = req.user._id || req.user.id;
    const { onLeave, reason } = req.query;
    const updated = await Staff.findByIdAndUpdate(
      staffId,
      { onLeave: onLeave === 'true', leaveReason: reason || '' },
      { new: true }
    ).select('-password');
    return res.json({ success: true, message: 'Staff leave status updated', staff: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/staff/leave-request (Staff applies for leave)
exports.applyLeave = async (req, res) => {
  try {
    const staffId = req.user._id || req.user.id;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const { reason, startDate, endDate, totalDays } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason for leave is required' });
    }

    let calculatedDays = totalDays;
    if (!calculatedDays && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
        calculatedDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const leaveReq = await LeaveRequest.create({
      applicantId: staff._id,
      applicantModel: 'Staff',
      applicantName: staff.fullName,
      applicantEmail: staff.email,
      role: staff.designation || 'STAFF',
      departmentOrBranch: 'Main OPD Desk',
      reason: reason.trim(),
      startDate: startDate || '',
      endDate: endDate || '',
      totalDays: calculatedDays || 1,
      status: 'PENDING',
    });

    return res.status(201).json({ success: true, message: 'Leave application submitted for Admin approval.', leaveRequest: leaveReq });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/staff/leave-requests
exports.getLeaveRequests = async (req, res) => {
  try {
    const staffId = req.user._id || req.user.id;
    const requests = await LeaveRequest.find({ applicantId: staffId }).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
