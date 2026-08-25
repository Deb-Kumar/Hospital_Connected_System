import React, { useState } from 'react';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';
import axiosClient from '../api/axiosClient';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [refId, setRefId] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.post('/inquiries', formData);
      if (res.data?.success) {
        setRefId(res.data.inquiry?._id?.substring(0, 8).toUpperCase() || 'INQ-SUCCESS');
        setSubmitted(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: '',
        });
      }
    } catch (err) {
      console.error('Failed to submit inquiry to backend:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit inquiry message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-softBg flex flex-col justify-between font-inter text-darkNavy">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-darkNavy via-slate-900 to-indigo-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-sky-300 border border-primary/30 px-3.5 py-1 rounded-full text-xs font-semibold">
            <span>📍</span> 24×7 Patient Support & Contact Desk
          </div>
          
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Contact Brainware Medical Hospital
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Have questions about doctor availability, emergency care, diagnostic tests, or inpatient admissions? Our clinical support team is here to assist you 24/7.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-12">
        
        {/* Contact Info Cards (4 Column Grid) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Campus Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-cardHover transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary text-2xl flex items-center justify-center font-bold">
              📍
            </div>
            <h3 className="font-poppins font-bold text-darkNavy text-base">Hospital Campus</h3>
            <p className="text-slateText text-xs leading-relaxed">
              Brainware Medical College & Hospital Campus, 398 Ramkrishnapur Road, Barasat, Kolkata, West Bengal 700125.
            </p>
          </div>

          {/* Card 2: 24x7 Emergency Desk */}
          <div className="bg-white rounded-3xl p-6 border border-red-200/80 shadow-card hover:shadow-cardHover transition duration-300 space-y-3 bg-gradient-to-b from-red-50/40 to-white">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-emergency text-2xl flex items-center justify-center font-bold">
              🚨
            </div>
            <h3 className="font-poppins font-bold text-red-900 text-base">24×7 Emergency Desk</h3>
            <div className="text-xs space-y-1">
              <a href="tel:108" className="block font-bold text-emergency text-sm hover:underline">
                🚑 Call 108 (Toll Free)
              </a>
              <p className="text-slateText">Direct ER Desk: +91 98765 43210</p>
            </div>
          </div>

          {/* Card 3: Email Support */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-cardHover transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 text-2xl flex items-center justify-center font-bold">
              ✉️
            </div>
            <h3 className="font-poppins font-bold text-darkNavy text-base">Email Helpdesk</h3>
            <div className="text-xs text-slateText space-y-1">
              <p>contact@brainwarehospital.edu.in</p>
              <p>appointments@brainwarehospital.edu.in</p>
            </div>
          </div>

          {/* Card 4: OPD & Visiting Hours */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-cardHover transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl flex items-center justify-center font-bold">
              🕒
            </div>
            <h3 className="font-poppins font-bold text-darkNavy text-base">Working Hours</h3>
            <div className="text-xs text-slateText space-y-1">
              <p><strong>OPD:</strong> Mon - Sat (8:00 AM - 8:00 PM)</p>
              <p><strong>Emergency/IPD:</strong> 24 Hours Open</p>
            </div>
          </div>
        </div>

        {/* Form & Map Split Section */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full">
                Get In Touch
              </span>
              <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-darkNavy mt-3">
                Send Us a Message or Inquiry
              </h2>
              <p className="text-slateText text-xs sm:text-sm mt-1">
                Fill out the form below and our medical support desk will respond within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto font-bold shadow">
                  ✓
                </div>
                <h3 className="font-poppins font-bold text-emerald-900 text-lg">Inquiry Recorded in Hospital System!</h3>
                <p className="text-xs font-mono text-emerald-800 font-bold bg-emerald-100/80 inline-block px-3 py-1 rounded-lg">
                  Reference Ticket ID: #{refId}
                </p>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed font-medium">
                  Your inquiry has been successfully registered with our medical desk. An email confirmation has been sent to you, and our patient care team will get back to you shortly within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-darkNavy mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Rahul Sen"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkNavy mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-darkNavy mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkNavy mb-1">Inquiry Category *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="OPD Doctor Appointment">OPD Doctor Appointment</option>
                      <option value="Inpatient (IPD) Admission">Inpatient (IPD) Admission</option>
                      <option value="Diagnostics & CT/MRI Scan">Diagnostics & CT/MRI Scan</option>
                      <option value="Feedback & Patient Care">Feedback & Patient Care</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-darkNavy mb-1">Message or Query *</label>
                  <textarea
                    name="message"
                    rows="4"
                    required
                    placeholder="Write details of your inquiry or feedback..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primaryDark text-white font-poppins font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-glow transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>✉️ Submit Inquiry Message</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Department Direct Lines & Campus Map (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Department Direct Desks */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
              <h3 className="font-poppins font-bold text-darkNavy text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>☎️</span> Department Direct Helplines
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-softBg rounded-xl">
                  <span className="font-semibold text-darkNavy">OPD Consultation Desk:</span>
                  <span className="font-bold text-primary">+91 98300 11223</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-softBg rounded-xl">
                  <span className="font-semibold text-darkNavy">IPD Admission Counter:</span>
                  <span className="font-bold text-primary">+91 98300 44556</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-softBg rounded-xl">
                  <span className="font-semibold text-darkNavy">NABL Diagnostic Lab:</span>
                  <span className="font-bold text-primary">+91 98300 77889</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-softBg rounded-xl">
                  <span className="font-semibold text-darkNavy">24x7 Pharmacy Desk:</span>
                  <span className="font-bold text-primary">+91 98300 99000</span>
                </div>
              </div>
            </div>

            {/* Google Maps Location Embed */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card space-y-3">
              <h3 className="font-poppins font-bold text-darkNavy text-xs uppercase tracking-wider px-2">
                🗺️ Find Our Campus Location
              </h3>
              <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-200">
                <iframe
                  title="Brainware Hospital Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.525547432585!2d88.47547037592476!3d22.708682027961293!2m3!1f0!0!f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f8a20ca9ed5d0b%3A0xe5c35b8cbbf1a157!2sBrainware%20University!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
