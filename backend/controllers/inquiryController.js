const Inquiry = require('../models/Inquiry');
const { sendEmail } = require('../utils/notification');

// POST /api/inquiries
exports.createInquiry = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: '10-digit mobile phone number is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter details of your inquiry or feedback.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Phone number validation (10 digits)
    const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Mobile phone number must be exactly 10 digits.' });
    }

    const inquiry = await Inquiry.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      subject: subject || 'General Inquiry',
      message: message.trim(),
      status: 'NEW',
    });

    const ticketId = inquiry._id.toString().substring(0, 8).toUpperCase();

    // 1. Send Confirmation Email to Patient via Nodemailer
    const patientSubject = `Inquiry Confirmation - Ticket #${ticketId} | Brainware Hospital`;
    const patientText = `Dear ${fullName.trim()},\n\nThank you for contacting Brainware Medical College & Hospital. We have received your inquiry regarding "${subject || 'General Inquiry'}".\n\nReference Ticket ID: #${ticketId}\nMessage: "${message.trim()}"\n\nOur patient care team will get back to you shortly.\nFor emergencies, please call 108.`;
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #172033; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #0B5ED7; margin-bottom: 4px;">Brainware Medical College & Hospital</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 0;">24x7 Comprehensive Clinical Facilities Desk</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p>Dear <strong>${fullName.trim()}</strong>,</p>
        <p>Thank you for reaching out to us. Your inquiry has been registered with <strong>Reference Ticket ID #${ticketId}</strong>.</p>
        <div style="background-color: #f4f9ff; padding: 16px; border-radius: 12px; border-left: 4px solid #0B5ED7; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <p style="margin: 0; font-size: 14px; color: #172033;">"${message.trim()}"</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">Our medical desk representative will review your request and get back to you shortly.</p>
        <div style="background-color: #fef2f2; padding: 12px; border-radius: 12px; border: 1px solid #fecaca; margin-top: 20px;">
          <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: bold;">🚨 Need Emergency Assistance?</p>
          <p style="margin: 4px 0 0 0; color: #b91c1c; font-size: 13px;">Call Ambulance Dispatch Hotline: <strong>108</strong> (Toll Free)</p>
        </div>
      </div>
    `;

    sendEmail(email.trim(), patientSubject, patientText, patientHtml);

    // 2. Send Notification Email to Admin Desk
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const adminSubject = `🚨 New Patient Inquiry [Ticket #${ticketId}]: ${subject || 'General Inquiry'}`;
    const adminText = `New Patient Inquiry [Ticket #${ticketId}]\n\nName: ${fullName.trim()}\nEmail: ${email.trim()}\nPhone: ${cleanPhone}\nSubject: ${subject || 'General Inquiry'}\n\nMessage:\n"${message.trim()}"`;
    const adminHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #172033; max-width: 650px; margin: auto; border: 1px solid #cbd5e1; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 10px auto;">
            <tr>
              <td style="background-color: #e11d48; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                🚨 New Patient Inquiry Received
              </td>
            </tr>
          </table>
          <h2 style="color: #ffffff; margin: 8px 0 4px 0; font-size: 20px; font-weight: bold;">
            Brainware Medical College & Hospital
          </h2>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Reference Ticket ID: <strong style="color: #38bdf8;">#${ticketId}</strong></p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            👤 Patient & Contact Profile
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 140px;">Patient Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${fullName.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Email Address:</td>
              <td style="padding: 6px 0; color: #0284c7; font-weight: bold;"><a href="mailto:${email.trim()}" style="color: #0284c7; text-decoration: none;">${email.trim()}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Mobile Phone:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace;">+91 ${cleanPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Inquiry Category:</td>
              <td style="padding: 6px 0;">
                <span style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 3px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; text-align: center;">
                  ${subject || 'General Inquiry'}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f1f5f9; border-left: 4px solid #0284c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; tracking: 0.5px;">
            💬 Inquiry Message / Query Details:
          </p>
          <p style="margin: 0; font-size: 14px; color: #0f172a; line-height: 1.6; font-style: italic; white-space: pre-wrap;">
            "${message.trim()}"
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <a href="mailto:${email.trim()}?subject=RE:%20Inquiry%20Ticket%20%23${ticketId}%20-%20Brainware%20Hospital" 
             style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: bold; display: inline-block;">
            ✉️ Reply Directly to Patient
          </a>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">
            Or manage this inquiry ticket directly inside the Admin Portal Inquiry Desk.
          </p>
        </div>
      </div>
    `;

    sendEmail(adminEmail, adminSubject, adminText, adminHtml);

    return res.status(201).json({
      success: true,
      message: 'Inquiry message submitted successfully and confirmation sent.',
      inquiry,
    });
  } catch (error) {
    console.error('createInquiry error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/inquiries (Admin)
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/inquiries/:id/status
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry message not found' });
    res.json({ success: true, message: 'Inquiry status updated', inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/inquiries/:id
exports.deleteInquiry = async (req, res) => {
  try {
    const deleted = await Inquiry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, message: 'Inquiry message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/inquiries (Delete All Inquiries)
exports.deleteAllInquiries = async (req, res) => {
  try {
    const result = await Inquiry.deleteMany({});
    res.json({ success: true, message: 'All patient inquiry messages deleted successfully', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
