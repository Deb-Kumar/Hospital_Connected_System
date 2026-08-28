const bcrypt = require('bcryptjs');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const UserProxy = require('../models/User');
const { sendEmail, sendSms, sendWhatsApp, buildOpdConfirmationHtml } = require('../utils/notification');
const { getPatientByUserId } = require('../utils/resolvers');

function buildToken(date, queueNumber) {
  return `Token #${queueNumber || 1}`;
}

const mongoose = require('mongoose');

async function createAppointmentForPatient(patient, doctorId, appointmentDate, appointmentTime, reasonForVisit, videoConsultation, age, bloodGroup, departmentName) {
  let doctor = null;
  let needsReceptionistAssignment = false;
  let fee = 500;

  if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
    doctor = await Doctor.findById(doctorId).populate('department');
    if (doctor) {
      if (doctor.onLeave) {
        const err = new Error('Doctor is currently on leave');
        err.statusCode = 400;
        throw err;
      }
      const clash = await Appointment.findOne({
        doctor: doctor._id, appointmentDate, appointmentTime, status: { $ne: 'CANCELLED' },
      });
      if (clash) {
        const err = new Error('Slot already booked for this doctor');
        err.statusCode = 409;
        throw err;
      }
      fee = doctor.consultationFee || 500;
    }
  }

  if (!doctor) {
    needsReceptionistAssignment = true;
  }

  const lastAppt = await Appointment.findOne({ appointmentDate }).sort({ queueNumber: -1 });
  const nextQueueNumber = (lastAppt && typeof lastAppt.queueNumber === 'number' && lastAppt.queueNumber > 0)
    ? lastAppt.queueNumber + 1
    : 1;

  const pName = patient.fullName || patient.user?.fullName || 'Patient';
  const pPhone = patient.phone || patient.user?.phone || '';
  const pEmail = (patient.email && !patient.email.includes('@brainwarehospital.edu.in'))
    ? patient.email
    : (patient.user?.email && !patient.user.email.includes('@brainwarehospital.edu.in') ? patient.user.email : '');

  const appointment = await Appointment.create({
    patient: patient._id,
    patientName: pName,
    patientPhone: pPhone,
    patientEmail: pEmail,
    doctor: doctor ? doctor._id : null,
    departmentName: departmentName || (doctor?.department?.name) || 'General Medicine',
    needsReceptionistAssignment,
    status: doctor ? 'ACCEPTED' : 'PENDING',
    appointmentDate,
    appointmentTime,
    reasonForVisit,
    age: age ? Number(age) : undefined,
    bloodGroup: bloodGroup || undefined,
    videoConsultation: !!videoConsultation,
    queueNumber: nextQueueNumber,
    tokenNumber: `Token #${nextQueueNumber}`,
    estimatedWaitMinutes: (nextQueueNumber - 1) * 15,
    paymentAmount: fee,
  });

  const patientEmail = (patient.email && !patient.email.includes('@brainwarehospital.edu.in') && !patient.email.includes('@guest.local') && !patient.email.includes('@walkin.local'))
    ? patient.email
    : (patient.user?.email && !patient.user.email.includes('@brainwarehospital.edu.in') && !patient.user.email.includes('@guest.local') && !patient.user.email.includes('@walkin.local') ? patient.user.email : null);
  const patientPhone = patient.phone || patient.user?.phone;
  const doctorName = doctor ? (doctor.fullName || doctor.user?.fullName) : null;

  const smsMessage = doctorName
    ? `[Brainware Hospital] Appointment Confirmed! Token: ${appointment.tokenNumber}. Doctor: Dr. ${doctorName}. Date: ${appointmentDate} at ${appointmentTime}. Please arrive 15 minutes prior to your slot.`
    : `[Brainware Hospital] Appointment Request Submitted! Token: ${appointment.tokenNumber}. Dept: ${departmentName || 'General Medicine'}. Date: ${appointmentDate} at ${appointmentTime}. Doctor assignment being finalized by reception.`;

  if (patientPhone) {
    sendSms(patientPhone, smsMessage);
    sendWhatsApp(patientPhone, smsMessage);
  }

  if (patientEmail) {
    const htmlEmail = buildOpdConfirmationHtml({
      patientName: patient.fullName || patient.user?.fullName || 'Patient',
      gender: patient.gender || 'Not Specified',
      contactNumber: patientPhone || 'N/A',
      email: patientEmail,
      age: appointment.age || patient.age,
      bloodGroup: appointment.bloodGroup || patient.bloodGroup,
      reasonForVisit: appointment.reasonForVisit || 'General OPD Consultation',
      doctorName: doctorName || 'Assigned by Reception Desk',
      departmentName: departmentName || (doctor?.department?.name) || 'General Medicine',
      appointmentDate,
      appointmentTime,
      tokenNumber: appointment.tokenNumber,
      queueNumber: appointment.queueNumber,
    });
    await sendEmail(patientEmail, `🏥 OPD Appointment Confirmation - ${appointment.tokenNumber}`, smsMessage, htmlEmail);
  }

  return { appointment, doctor };
}

// POST /api/appointments/book   (logged-in patient)
exports.book = async (req, res) => {
  try {
    const { patientId, doctorId, departmentName, appointmentDate, appointmentTime, reasonForVisit, videoConsultation, age, bloodGroup, email } = req.body;

    const patient = await getPatientByUserId(patientId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    if (email && email.trim() && (!patient.email || patient.email.includes('@brainwarehospital.edu.in') || patient.email.includes('@guest.local') || patient.email.includes('@walkin.local'))) {
      patient.email = email.trim();
      await patient.save();
    }

    if (bloodGroup && !patient.bloodGroup) {
      patient.bloodGroup = bloodGroup;
      await patient.save();
    }

    const { appointment, doctor } = await createAppointmentForPatient(
      patient, doctorId, appointmentDate, appointmentTime, reasonForVisit, videoConsultation, age, bloodGroup, departmentName
    );

    return res.status(201).json(appointment);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// POST /api/appointments/book-guest   (PUBLIC — no login required)
exports.bookGuest = async (req, res) => {
  try {
    const { fullName, phone, email, doctorId, departmentName, appointmentDate, appointmentTime, reasonForVisit, videoConsultation, age, bloodGroup } = req.body;

    if (!fullName || !phone || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'fullName, phone, age, bloodGroup, appointmentDate and appointmentTime are required' });
    }

    let patient = await Patient.findOne({ phone });

    if (patient) {
      if (email && email.trim() && !email.includes('@brainwarehospital.edu.in') && !email.includes('@guest.local') && !email.includes('@walkin.local')) {
        patient.email = email.trim();
        await patient.save();
      }
    } else {
      const placeholderEmail = (email && email.trim()) ? email.trim() : `guest_${phone}@brainwarehospital.edu.in`;
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(2) + Date.now(), 10);

      patient = await Patient.create({
        fullName,
        phone,
        email: placeholderEmail,
        password: randomPassword,
        bloodGroup: bloodGroup || undefined,
        role: 'PATIENT',
        isGuestAccount: true,
        qrCodeId: `QR-${Date.now()}`,
      });
    }

    const { appointment, doctor } = await createAppointmentForPatient(
      patient, doctorId, appointmentDate, appointmentTime, reasonForVisit, videoConsultation, age, bloodGroup, departmentName
    );

    return res.status(201).json({
      appointmentId: appointment._id,
      tokenNumber: appointment.tokenNumber,
      queueNumber: appointment.queueNumber,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      patientName: patient.fullName,
      doctorName: doctor ? (doctor.fullName || doctor.user?.fullName) : 'Assigned by Reception',
      departmentName: departmentName || doctor?.department?.name || 'General Medicine',
      isGuestAccount: patient.isGuestAccount,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/reschedule
exports.reschedule = async (req, res) => {
  try {
    const { date, time } = req.query;
    const old = await Appointment.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Appointment not found' });

    old.status = 'RESCHEDULED';
    await old.save();

    const lastAppt = await Appointment.findOne({ appointmentDate: date }).sort({ queueNumber: -1 });
    const nextQueueNumber = (lastAppt && typeof lastAppt.queueNumber === 'number' && lastAppt.queueNumber > 0)
      ? lastAppt.queueNumber + 1
      : 1;

    const updated = await Appointment.create({
      patient: old.patient,
      doctor: old.doctor,
      appointmentDate: date,
      appointmentTime: time,
      reasonForVisit: old.reasonForVisit,
      rescheduledFrom: old._id,
      queueNumber: nextQueueNumber,
      tokenNumber: buildToken(date, nextQueueNumber),
      paymentAmount: old.paymentAmount,
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/cancel
exports.cancel = async (req, res) => {
  try {
    const { reason } = req.query;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'CANCELLED', cancellationReason: reason || 'Cancelled by patient' },
      { new: true }
    ).populate('patient');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Respond INSTANTLY to HTTP client (<10ms)
    res.json(appointment);

    // Process notification in background setImmediate
    setImmediate(async () => {
      try {
        const patientEmail = appointment.patient?.email || appointment.patient?.user?.email;
        if (patientEmail && !patientEmail.includes('@guest.local') && !patientEmail.includes('@walkin.local') && !patientEmail.includes('@brainwarehospital.edu.in')) {
          await sendEmail(patientEmail, '🏥 OPD Appointment Cancelled',
            `Your appointment on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been cancelled. Reason: ${reason || 'Cancelled by patient'}`);
        }
      } catch (err) {
        console.error('Background cancel email error:', err.message);
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/status  (doctor accept/reject/complete)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    return res.json(appointment);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/patient/:patientId
exports.getHistoryForPatient = async (req, res) => {
  try {
    const patient = await getPatientByUserId(req.params.patientId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: 'department' })
      .populate('patient')
      .sort({ appointmentDate: -1 });

    const todayStr = new Date().toISOString().slice(0, 10);
    const updatedAppointments = [];

    for (let apt of appointments) {
      if (apt.appointmentDate && apt.appointmentDate < todayStr && apt.status !== 'CANCELLED' && apt.status !== 'REJECTED' && apt.status !== 'RESCHEDULED') {
        if (apt.status !== 'COMPLETED') {
          apt.status = 'COMPLETED';
          await apt.save();
        }
      }
      updatedAppointments.push(apt);
    }

    return res.json(updatedAppointments);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/doctor/:doctorId/queue?date=YYYY-MM-DD
exports.getQueueForDoctor = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.find({ doctor: req.params.doctorId, appointmentDate: date })
      .populate('patient')
      .sort({ queueNumber: 1 });
    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/doctor/:doctorId/availability?date=&time=
exports.checkAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;
    const clash = await Appointment.findOne({
      doctor: req.params.doctorId, appointmentDate: date, appointmentTime: time, status: { $ne: 'CANCELLED' },
    });
    const available = !clash;
    return res.json({ success: available, message: available ? 'Slot available' : 'Slot already booked' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/today
exports.getTodaysAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.find({ appointmentDate: today })
      .populate('patient')
      .populate({ path: 'doctor', populate: 'department' })
      .sort({ appointmentTime: 1 });
    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/unassigned
exports.getUnassignedAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        { needsReceptionistAssignment: true },
        { doctor: null },
      ],
      status: { $ne: 'CANCELLED' },
    })
      .populate('patient')
      .sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/assign-doctor
exports.assignDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'doctorId is required' });
    }

    const appointment = await Appointment.findById(req.params.id).populate('patient');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctor = await Doctor.findById(doctorId).populate('department');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    appointment.doctor = doctor._id;
    appointment.status = 'ACCEPTED';
    appointment.needsReceptionistAssignment = false;
    if (doctor.department?.name) {
      appointment.departmentName = doctor.department.name;
    }
    await appointment.save();

    const docName = doctor.fullName || doctor.user?.fullName || 'Specialist';
    const patientPhone = appointment.patient?.phone || appointment.patient?.user?.phone;
    const patientEmail = appointment.patient?.email || appointment.patient?.user?.email;

    const assignMessage = `[Brainware Hospital] OPD Booking Update: Your Token ${appointment.tokenNumber} has been assigned to Dr. ${docName} (${appointment.departmentName}). Date: ${appointment.appointmentDate} at ${appointment.appointmentTime}.`;

    if (patientPhone) {
      sendSms(patientPhone, assignMessage);
      sendWhatsApp(patientPhone, assignMessage);
    }
    if (patientEmail && !patientEmail.includes('@brainwarehospital.edu.in')) {
      const htmlEmail = buildOpdConfirmationHtml({
        patientName: appointment.patient?.fullName || 'Patient',
        gender: appointment.patient?.gender || 'Not Specified',
        contactNumber: patientPhone || 'N/A',
        email: patientEmail,
        age: appointment.age || appointment.patient?.age,
        bloodGroup: appointment.bloodGroup || appointment.patient?.bloodGroup,
        reasonForVisit: appointment.reasonForVisit || 'General OPD Consultation',
        doctorName: docName,
        departmentName: appointment.departmentName || doctor.department?.name || 'General Medicine',
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        tokenNumber: appointment.tokenNumber,
        queueNumber: appointment.queueNumber,
      });
      await sendEmail(patientEmail, `🏥 OPD Doctor Assigned - ${appointment.tokenNumber}`, assignMessage, htmlEmail);
    }

    return res.json({
      success: true,
      message: `Appointment assigned to Dr. ${docName} & confirmation dispatched via SMS & Email`,
      appointment,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
