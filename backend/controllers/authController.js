const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const UserProxy = require('../models/User');
const Department = require('../models/Department');
const LoginHistory = require('../models/LoginHistory');
const { generateToken } = require('../utils/jwt');
const { sendEmail, sendSms, buildOtpHtml } = require('../utils/notification');
const { saveDoctorPhoto } = require('../utils/fileStorage');

function generateOtp() {
  return String(crypto.randomInt(0, 999999)).padStart(6, '0');
}

function buildAvailabilitySchedule(availableDays, availableFrom, availableTo) {
  if (!Array.isArray(availableDays) || availableDays.length === 0 || !availableFrom || !availableTo) {
    return '';
  }
  return availableDays.map((day) => `${day}:${availableFrom}-${availableTo}`).join(',');
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      fullName, email, phone, password, role, dateOfBirth, gender, bloodGroup,
      departmentId, qualification, specialization, experienceYears,
      availableFrom, availableTo, availableDays, profileImage, avatarUrl,
    } = req.body;

    const normalizedRole = (role || 'PATIENT').toUpperCase();
    const normalizedEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    if (!fullName || (!normalizedEmail && normalizedRole !== 'PATIENT') || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (normalizedRole === 'DOCTOR' && (!specialization || !qualification)) {
      return res.status(400).json({ success: false, message: 'Specialization and qualification are required for doctor sign-up' });
    }

    const searchConditions = [{ phone }];
    if (normalizedEmail) {
      searchConditions.unshift({ email: normalizedEmail });
    }

    const existing = await UserProxy.findOne({ $or: searchConditions });

    if (existing && existing.isGuestAccount && (existing.role === normalizedRole || normalizedRole === 'PATIENT')) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const otpCode = generateOtp();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      existing.fullName = fullName;
      if (normalizedEmail) existing.email = normalizedEmail;
      existing.password = hashedPassword;
      existing.isGuestAccount = false;
      existing.otpCode = otpCode;
      existing.otpExpiry = otpExpiry;
      await existing.save();

      if (normalizedEmail) {
        await sendEmail(normalizedEmail, 'OTP Verification Code', `Your Hospital App OTP is: ${otpCode}. Valid for 10 minutes.`, buildOtpHtml(otpCode, 'Account Registration OTP'));
      }
      sendSms(phone, `Your OTP is ${otpCode}`);

      return res.status(200).json({
        success: true,
        message: 'Account verified. OTP sent — your previous booking history is now linked to this account.',
        data: { userId: existing._id, fullName: existing.fullName, role: existing.role },
      });
    }

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email or phone number already exists. Please log in directly with your assigned credentials.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let createdAccount;
    let responseMessage = 'Registered successfully. OTP sent for verification.';

    if (normalizedRole === 'PATIENT') {
      createdAccount = await Patient.create({
        fullName,
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        phone,
        password: hashedPassword,
        role: 'PATIENT',
        dateOfBirth,
        gender,
        bloodGroup,
        qrCodeId: `QR-${Date.now()}`,
        emailVerified: !!normalizedEmail,
        phoneVerified: true,
        active: true,
      });
      responseMessage = 'Registration successful! Your account is active and you can sign in directly.';
    } else if (normalizedRole === 'DOCTOR') {
      let department = null;
      if (departmentId) {
        department = await Department.findById(departmentId);
      }
      if (!department) {
        department = await Department.findOne({ name: specialization });
      }
      if (!department) {
        department = await Department.create({ name: specialization });
      }

      const availabilitySchedule = buildAvailabilitySchedule(availableDays, availableFrom, availableTo);

      const rawPhoto = profileImage || avatarUrl || '';
      const savedPhotoUrl = await saveDoctorPhoto(rawPhoto);

      createdAccount = await Doctor.create({
        fullName, email: normalizedEmail, phone, password: hashedPassword,
        role: 'DOCTOR', department: department._id,
        qualification, specialization, experienceYears: experienceYears || 0,
        profileImage: savedPhotoUrl,
        avatarUrl: savedPhotoUrl,
        availabilitySchedule, approvalStatus: 'PENDING',
        otpCode, otpExpiry,
      });

      responseMessage = 'Registered successfully. OTP sent for verification. Your doctor profile is now pending admin approval — you will be able to log in once approved.';
    } else if (normalizedRole === 'RECEPTIONIST' || normalizedRole === 'STAFF') {
      createdAccount = await Staff.create({
        fullName, email, phone, password: hashedPassword,
        role: 'RECEPTIONIST', designation: 'Receptionist',
        approvalStatus: 'PENDING', otpCode, otpExpiry,
      });

      responseMessage = 'Registered successfully. OTP sent for verification. Your staff account is now pending admin approval — you will be able to log in once approved.';
    } else if (normalizedRole === 'ADMIN') {
      createdAccount = await Admin.create({
        fullName, email, phone, password: hashedPassword,
        role: 'ADMIN', emailVerified: true, phoneVerified: true, active: true,
      });
      responseMessage = 'Admin account registered successfully.';
    }

    if (normalizedRole !== 'PATIENT' && normalizedRole !== 'ADMIN') {
      await sendEmail(email, 'OTP Verification Code', `Your Hospital App OTP is: ${otpCode}. Valid for 10 minutes.`, buildOtpHtml(otpCode, 'Account Verification OTP'));
      sendSms(phone, `Your OTP is ${otpCode}`);
    }

    return res.status(201).json({
      success: true,
      message: responseMessage,
      data: {
        userId: createdAccount._id,
        fullName: createdAccount.fullName,
        role: createdAccount.role,
        requiresOtp: normalizedRole !== 'PATIENT' && normalizedRole !== 'ADMIN',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await UserProxy.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.otpCode === otp && user.otpExpiry && user.otpExpiry > new Date()) {
      user.emailVerified = true;
      user.phoneVerified = true;
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      await user.save();

      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d',
      });

      return res.json({
        success: true,
        message: 'OTP verified successfully',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus,
        },
      });
    }
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password, role, otp } = req.body;
  let success = false;
  let user;

  try {
    // Support login by email OR phone number
    const identifier = (email || '').trim();
    const cleanPhone = identifier.replace(/\D/g, '');
    const query = {
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
        { phone: cleanPhone }
      ]
    };

    user = await Patient.findOne(query);
    if (!user) {
      user = await UserProxy.findOne(query);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email or phone number. Please check your details or register.' });
    }


    if (user.isGuestAccount) {
      return res.status(401).json({
        success: false,
        message: 'This looks like a guest booking account. Please sign up with the same phone number to set a password and access your full account.',
        code: 'GUEST_ACCOUNT',
        phone: user.phone,
      });
    }

    // Strict Role mismatch validation check — Admin must use Admin tab, Staff must use Staff tab
    if (role) {
      const requestedRole = (role || '').toUpperCase();
      const userRole = (user.role || '').toUpperCase();

      const isStaffMatch = (requestedRole === 'STAFF' || requestedRole === 'RECEPTIONIST') && (userRole === 'STAFF' || userRole === 'RECEPTIONIST');
      const isRoleMatch = requestedRole === userRole || isStaffMatch;

      if (!isRoleMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email, password, or account type selected. Please verify your credentials and selected role.',
          code: 'ROLE_MISMATCH',
        });
      }
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again or reset your password.' });
    }

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by the hospital admin. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // Doctor approval gate
    if (user.role === 'DOCTOR') {
      if (user.approvalStatus === 'PENDING') {
        return res.status(403).json({
          success: false,
          message: 'Your application is still under review by the hospital admin. Please check back later.',
          approvalStatus: 'PENDING',
          code: 'DOCTOR_NOT_APPROVED',
        });
      }
      if (user.approvalStatus === 'REJECTED') {
        return res.status(403).json({
          success: false,
          message: user.rejectionReason
            ? `Your application has been rejected. Reason: ${user.rejectionReason}`
            : 'Your application has been rejected by the hospital admin.',
          approvalStatus: 'REJECTED',
          code: 'DOCTOR_NOT_APPROVED',
        });
      }
    }

    // Staff Member (Receptionist) approval gate
    if (user.role === 'RECEPTIONIST' || user.role === 'STAFF') {
      if (user.approvalStatus === 'PENDING') {
        return res.status(403).json({
          success: false,
          message: 'Your staff account application is still under review by the hospital admin. Please check back later.',
          approvalStatus: 'PENDING',
          code: 'STAFF_NOT_APPROVED',
        });
      }
      if (user.approvalStatus === 'REJECTED') {
        return res.status(403).json({
          success: false,
          message: user.rejectionReason
            ? `Your staff account application has been rejected. Reason: ${user.rejectionReason}`
            : 'Your staff account application has been rejected by the hospital admin.',
          approvalStatus: 'REJECTED',
          code: 'STAFF_NOT_APPROVED',
        });
      }
    }

    // Two-Factor Authentication check
    if (user.twoFactorEnabled) {
      if (!otp) {
        const otpCode = generateOtp();
        user.otpCode = otpCode;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        console.log(`[2FA OTP] Generated 2FA OTP for ${user.email} (${user.role}): ${otpCode}`);
        try {
          await sendEmail(user.email, 'Your 2FA Login OTP Code', `Your 2FA verification code is: ${otpCode}. Valid for 10 minutes.`, buildOtpHtml(otpCode, '2FA Login Verification OTP'));
        } catch (e) {
          // Notification fallback
        }

        return res.status(200).json({
          success: false,
          require2FA: true,
          message: 'Two-Factor Authentication is enabled for your account. Please enter the 6-digit OTP sent to your registered email.',
          email: user.email,
          devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
        });
      }

      if (otp !== user.otpCode || !user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
        return res.status(400).json({
          success: false,
          require2FA: true,
          message: 'Invalid or expired 2FA OTP code. Please try again.',
        });
      }

      // OTP verified successfully
      user.otpCode = null;
      user.otpExpiry = null;
      await user.save();
    }

    const token = generateToken(user._id, user.role);
    success = true;

    const effectiveRole = (user.role === 'RECEPTIONIST' || user.role === 'STAFF') ? 'STAFF' : user.role;

    return res.json({
      token,
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: effectiveRole,
      designation: user.designation || 'OPD_DESK',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    if (user) {
      try {
        await LoginHistory.create({
          user: user._id,
          userName: user.fullName,
          userEmail: user.email,
          userRole: (user.role === 'RECEPTIONIST' ? 'STAFF' : user.role) || 'PATIENT',
          actionType: 'LOGIN',
          details: success ? 'User authenticated successfully.' : 'Authentication attempt failed.',
          ipAddress: req.ip,
          deviceInfo: req.headers['user-agent'],
          success,
        });
      } catch (e) {
        // Ignore login history logging errors
      }
    }
  }
};

// PUT /api/auth/toggle-2fa
exports.toggle2FA = async (req, res) => {
  try {
    const user = await UserProxy.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const nextState = req.body?.enable !== undefined ? Boolean(req.body.enable) : !user.twoFactorEnabled;
    user.twoFactorEnabled = nextState;
    await user.save();

    return res.json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      message: `Two-Factor Authentication (2FA) is now ${user.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');

    const user = await UserProxy.findOne({ email: emailRegex });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No registered account found for "${email.trim()}". Please verify your email address or sign up.`,
      });
    }

    const otpCode = generateOtp();
    user.otpCode = otpCode;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`[Forgot Password] Reset OTP for ${user.email} (${user.role || 'USER'}): ${otpCode}`);
    try {
      await sendEmail(
        user.email,
        'Password Reset OTP Code',
        `Your password reset OTP code is: ${otpCode}. Valid for 10 minutes.`,
        buildOtpHtml(otpCode, 'Password Reset OTP Code')
      );
    } catch (e) {
      console.error('Email send failed:', e.message);
    }

    const roleName = user.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()} Account` : 'Account';

    return res.json({
      success: true,
      message: `A 6-digit password reset OTP code has been sent to ${user.email} (${roleName}).`,
      role: user.role,
      devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');

    const user = await UserProxy.findOne({ email: emailRegex });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (otp.trim() !== user.otpCode || !user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    user.lastPasswordChangedAt = new Date();

    if (Array.isArray(user.passwordHistory)) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      user.passwordHistory.push({ changedAt: new Date(), ipAddress: clientIp });
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
      role: user.role,
      lastPasswordChangedAt: user.lastPasswordChangedAt,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required.' 
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
         success: false, 
         message: 'New password must be at least 6 characters long.' 
        });
    }

    const user = await UserProxy.findById(userId);
    if (!user) return res.status(404).json({ 
      success: false, 
      message: 'User account not found.' 
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.lastPasswordChangedAt = new Date();
    await user.save();

    return res.json({ 
      success: true, 
      message: 'Password updated successfully!' 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
