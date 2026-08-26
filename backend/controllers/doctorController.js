const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const UserProxy = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const { sendEmail } = require('../utils/notification');
const ai = require('../utils/ai');
const { getDoctorByUserId } = require('../utils/resolvers');
const { saveDoctorPhoto } = require('../utils/fileStorage');

// GET /api/doctor/all
exports.getAll = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      approvalStatus: { $nin: ['PENDING', 'REJECTED'] }
    }).populate('department');
    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctor/department/:departmentId
exports.getByDepartment = async (req, res) => {
  try {
    const doctors = await Doctor.find({ department: req.params.departmentId, onLeave: false, approvalStatus: 'APPROVED' }).populate('department');
    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctor/:id/availability   (:id is the doctor's User id)
exports.updateAvailability = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const { schedule } = req.query;
    const updated = await Doctor.findByIdAndUpdate(doctor._id, { availabilitySchedule: schedule }, { new: true });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctor/:id/leave
exports.setLeave = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const { onLeave, reason } = req.query;
    const updated = await Doctor.findByIdAndUpdate(
      doctor._id, { onLeave: onLeave === 'true', leaveReason: reason }, { new: true }
    );
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctor/prescription  (Digital Prescription Creation + AI Explanation)
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, medicines, notes } = req.body;
    const prescription = await Prescription.create({
      appointment: appointmentId,
      medicines,
      notes,
      aiExplanation: ai.explainPrescription(),
    });
    return res.status(201).json(prescription);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctor/:id/queue/today
exports.getTodayQueue = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const today = new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.find({ doctor: doctor._id, appointmentDate: today })
      .populate({ path: 'patient', populate: 'user' })
      .sort({ queueNumber: 1 });
    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctor/:id/revenue
exports.getRevenueSummary = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctor: doctor._id });
    const totalRevenue = appointments
      .filter((a) => a.paymentStatus === 'PAID')
      .reduce((sum, a) => sum + (a.paymentAmount || 0), 0);
    const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED').length;

    return res.json({ totalAppointments: appointments.length, completedAppointments, totalRevenue });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctor/:id/profile
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    return res.json(doctor);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctor/:id/profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    let doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) {
      doctor = await DoctorProxy.findById(req.params.id);
    }
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const { fullName, email, consultationFee, qualifications, qualification, experienceYears, phone, specialization, bio, avatarUrl, profileImage, photoUrl } = req.body;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (qualifications !== undefined) {
      doctor.qualifications = qualifications;
      doctor.qualification = qualifications;
    }
    if (qualification !== undefined) {
      doctor.qualifications = qualification;
      doctor.qualification = qualification;
    }
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (bio !== undefined) doctor.bio = bio;
    if (phone !== undefined) doctor.phone = phone;

    const newPhoto = avatarUrl || profileImage || photoUrl;
    let finalPhotoUrl = '';
    if (newPhoto) {
      const docName = doctor.fullName || fullName || 'doctor';
      const savedPath = await saveDoctorPhoto(newPhoto, docName);
      finalPhotoUrl = savedPath || newPhoto;
      doctor.avatarUrl = finalPhotoUrl;
      doctor.profileImage = finalPhotoUrl;
    }

    if (doctor.user) {
      const userUpdates = {};
      if (fullName) userUpdates.fullName = fullName;
      if (email) userUpdates.email = email;
      if (phone) userUpdates.phone = phone;
      if (finalPhotoUrl) userUpdates.avatar = finalPhotoUrl;
      if (Object.keys(userUpdates).length > 0) {
        await UserProxy.findByIdAndUpdate(doctor.user, userUpdates);
      }
    }

    await doctor.save();
    return res.json({ success: true, message: 'Doctor profile updated successfully', doctor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctor/:id/patients
exports.getDoctorPatients = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctor: doctor._id }).populate({
      path: 'patient',
      populate: 'user',
    });

    const patientMap = new Map();
    appointments.forEach((apt) => {
      if (apt.patient && !patientMap.has(apt.patient._id.toString())) {
        patientMap.set(apt.patient._id.toString(), {
          patient: apt.patient,
          lastVisitDate: apt.appointmentDate,
          lastStatus: apt.status,
          totalVisits: appointments.filter((a) => a.patient?._id?.toString() === apt.patient._id.toString()).length,
        });
      }
    });

    return res.json(Array.from(patientMap.values()));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctor/:id/prescriptions
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctor: doctor._id }).select('_id');
    const appointmentIds = appointments.map((a) => a._id);

    const prescriptions = await Prescription.find({ appointment: { $in: appointmentIds } })
      .populate({
        path: 'appointment',
        populate: { path: 'patient', populate: 'user' },
      })
      .sort({ createdAt: -1 });

    return res.json(prescriptions);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctor/request-email-change-otp
exports.requestEmailChangeOtp = async (req, res) => {
  try {
    const { doctorId, newEmail } = req.body;
    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const doctor = await getDoctorByUserId(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found.' });

    // Check if new email is already registered to another user
    const existingUser = await UserProxy.findOne({ email: newEmail.toLowerCase().trim() });
    if (existingUser && existingUser._id.toString() !== (doctor.user?._id || doctor.user || '').toString()) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already registered with another account in the system.',
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    doctor.otpCode = otpCode;
    doctor.otpExpiry = otpExpiry;
    doctor.pendingNewEmail = newEmail.toLowerCase().trim();
    await doctor.save();

    console.log(`[DOCTOR EMAIL CHANGE OTP] Sent to ${newEmail}: ${otpCode}`);
    await sendEmail(
      newEmail,
      'Email Change Verification OTP',
      `Your OTP to verify your new email address (${newEmail}) is: ${otpCode}. Valid for 10 minutes.`
    );

    return res.json({
      success: true,
      message: `OTP sent to ${newEmail} for verification.`,
      pendingNewEmail: newEmail,
      otpCode,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctor/verify-email-change-otp
exports.verifyEmailChangeOtp = async (req, res) => {
  try {
    const { doctorId, newEmail, otp } = req.body;
    const doctor = await getDoctorByUserId(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found.' });

    if (!doctor.otpCode || doctor.otpCode !== otp || !doctor.otpExpiry || doctor.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    const finalEmail = (newEmail || doctor.pendingNewEmail || '').toLowerCase().trim();
    doctor.email = finalEmail;
    doctor.otpCode = undefined;
    doctor.otpExpiry = undefined;
    doctor.pendingNewEmail = undefined;
    await doctor.save();

    if (doctor.user) {
      await UserProxy.findByIdAndUpdate(doctor.user, { email: finalEmail });
    }

    return res.json({
      success: true,
      message: 'Email updated and verified successfully!',
      email: finalEmail,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctors/:id/leave-request (Doctor applies for leave)
exports.applyLeave = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const { reason, startDate, endDate } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason for leave is required' });
    }

    const leaveReq = await LeaveRequest.create({
      applicantId: doctor._id,
      applicantModel: 'Doctor',
      applicantName: doctor.fullName,
      applicantEmail: doctor.email,
      role: 'DOCTOR',
      departmentOrBranch: doctor.department?.name || doctor.specialization || 'General OPD',
      reason: reason.trim(),
      startDate: startDate || '',
      endDate: endDate || '',
      status: 'PENDING',
    });

    return res.status(201).json({ success: true, message: 'Leave application submitted for Admin approval.', leaveRequest: leaveReq });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id/leave-requests
exports.getLeaveRequests = async (req, res) => {
  try {
    const doctor = await getDoctorByUserId(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const requests = await LeaveRequest.find({ applicantId: doctor._id }).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
