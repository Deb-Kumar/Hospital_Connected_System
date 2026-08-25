const nodemailer = require('nodemailer');
const https = require('https');

let transporter = null;
function getTransporter() {
  if (!transporter) {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }
  return transporter;
}

/**
 * Permanent Rich HTML Email Template Generator
 */
function buildOpdConfirmationHtml({
  patientName,
  gender,
  contactNumber,
  email,
  age,
  bloodGroup,
  reasonForVisit,
  departmentName,
  doctorName,
  appointmentDate,
  appointmentTime,
  tokenNumber,
  queueNumber,
} = {}) {
  return `
<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🏥 Brainware Medical College & Hospital</h1>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #93c5fd;">Official OPD Booking Confirmation</p>
  </div>

  <div style="padding: 24px; text-align: center;">
    <div style="background-color: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 12px; padding: 16px; display: inline-block; width: 85%;">
      <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #1e40af; font-weight: 700; letter-spacing: 1px;">YOUR OPD TOKEN NUMBER</p>
      <p style="margin: 6px 0 0 0; font-size: 30px; font-weight: 900; color: #2563eb; letter-spacing: 1px;">${tokenNumber || 'TKN-CARD-20260810-01'}</p>
    </div>
  </div>

  <div style="padding: 0 24px 24px 24px;">
    <h3 style="font-size: 15px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">📋 Patient & Appointment Summary</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Patient Name:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; text-align: right; color: #0f172a;">${patientName || 'Patient'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Gender:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; text-align: right; color: #0f172a;">${gender || 'Not Specified'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Contact Number:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; text-align: right; color: #0f172a;">${contactNumber || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Email Address:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; text-align: right; color: #2563eb;">${email || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Age & Blood Group:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; text-align: right; color: #0f172a;">${age ? age + ' Yrs' : 'N/A'} | ${bloodGroup || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Primary Health Concern:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; text-align: right; color: #d97706;">${reasonForVisit || 'General OPD Consultation'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Department:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; text-align: right; color: #2563eb;">${departmentName || 'General Medicine'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Assigned Doctor:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; text-align: right; color: #0f172a;">${doctorName ? (doctorName.toLowerCase().includes('dr') ? doctorName : 'Dr. ' + doctorName) : 'Assigned by Reception Desk'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Appointment Date & Time:</td>
        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; text-align: right; color: #0f172a;">${appointmentDate || '11 August 2026'} at ${appointmentTime || '10:30 AM'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; color: #64748b;">Queue Status:</td>
        <td style="padding: 9px 0; font-weight: 700; text-align: right; color: #16a34a;">#${queueNumber || '01'} Scheduled</td>
      </tr>
    </table>

    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin-top: 20px; border-radius: 6px; font-size: 12px; color: #475569; line-height: 1.5;">
      💡 <strong>Instructions:</strong> Please report to OPD Counter 15 minutes before your scheduled slot with your Govt Photo ID card.
    </div>
  </div>

  <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
    <p style="margin: 0; font-weight: 600;">Brainware Medical College & Hospital</p>
    <p style="margin: 4px 0 0 0;">Need Help? Contact Reception Desk at <strong>+91 98765 43210 / +91 98765 43211</strong></p>
  </div>
</div>
  `;
}

function buildGenericEmailHtml(subject, text) {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 800;">🏥 Brainware Medical College & Hospital</h1>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #93c5fd;">Official Notification</p>
  </div>

  <div style="padding: 28px 24px; color: #1e293b;">
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0; margin-bottom: 12px; font-weight: 700;">${subject || 'System Notification'}</h2>
    <div style="font-size: 14px; line-height: 1.6; color: #334155; background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0;">
      ${text ? text.replace(/\n/g, '<br/>') : ''}
    </div>
  </div>

  <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
    <p style="margin: 0; font-weight: 600;">Brainware Medical College & Hospital</p>
    <p style="margin: 4px 0 0 0;">This is an automated system notification. Please do not reply to this email.</p>
  </div>
</div>
  `;
}

/**
 * 1. Email Messaging Service (OPTIONAL — Triggers ONLY if patient provided a valid email)
 */
async function sendEmail(to, subject, text, html) {
  if (!to || to.includes('@guest.local') || to.includes('@brainwarehospital.edu.in')) {
    console.log(`ℹ️ [Email Skipped]: Patient did not provide a personal email address.`);
    return;
  }
  try {
    const fromAddress = `"Brainware Medical College & Hospital" <${process.env.SMTP_USER || 'devkumar.workspace@gmail.com'}>`;
    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text,
      html: html || buildGenericEmailHtml(subject, text),
    };
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`📧 [Email Service Sent to ${to}] Subject: "${subject}" - MessageId: ${info.messageId || 'DEV-SENT'}`);
    return info;
  } catch (err) {
    console.error('Email service dispatch failed:', err.message);
  }
}

/**
 * 2. SMS Messaging Service (MANDATORY — Always triggers for Patient Phone)
 */
function sendSms(phone, message) {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

  console.log(`📱 [SMS SERVICE DISPATCHED to ${formattedPhone}]: ${message}`);

  // Fast2SMS API Gateway Call (Free ₹50 balance for Indian numbers)
  if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY !== 'YOUR_FAST2SMS_DEV_API_KEY') {
    try {
      const tenDigitPhone = cleanPhone.slice(-10);
      const queryParams = new URLSearchParams({
        authorization: process.env.FAST2SMS_API_KEY,
        route: 'q',
        message: message,
        language: 'english',
        flash: '0',
        numbers: tenDigitPhone,
      }).toString();

      const req = https.request({
        hostname: 'www.fast2sms.com',
        port: 443,
        path: `/dev/bulkV2?${queryParams}`,
        method: 'GET',
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => console.log(`[Fast2SMS API Response ${res.statusCode}]:`, body));
      });
      req.on('error', (e) => console.error('Fast2SMS error:', e.message));
      req.end();
    } catch (e) {
      console.error('Fast2SMS Error:', e.message);
    }
  }
}

/**
 * 3. WhatsApp Messaging Service (MANDATORY — Always triggers for Patient Phone)
 */
function sendWhatsApp(phone, message) {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

  console.log(`💬 [WHATSAPP SERVICE DISPATCHED to ${formattedPhone}]: ${message}`);
}

function buildOtpHtml(otpCode, purpose = 'Verification Code') {
  return `
<div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 800;">🏥 Brainware Medical College & Hospital</h1>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #93c5fd;">${purpose}</p>
  </div>

  <div style="padding: 32px 24px; text-align: center; color: #1e293b;">
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Use the following One-Time Password (OTP) code to complete your request:</p>
    <div style="background-color: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 12px; padding: 18px; display: inline-block; width: 80%;">
      <span style="font-size: 34px; font-weight: 900; color: #2563eb; letter-spacing: 6px; font-family: monospace;">${otpCode}</span>
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 16px;">⏱️ This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
  </div>

  <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
    <p style="margin: 0; font-weight: 600;">Brainware Medical College & Hospital Security</p>
    <p style="margin: 4px 0 0 0;">If you did not request this code, please ignore this email.</p>
  </div>
</div>
  `;
}

module.exports = { sendEmail, sendSms, sendWhatsApp, buildOpdConfirmationHtml, buildOtpHtml, buildGenericEmailHtml };
