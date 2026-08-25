import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const SPECIALIZATIONS = [
  'Cardio Thoracic Surgery',
  'Cardiology',
  'Child Guidance Clinic',
  'Dental',
  'Dermatology',
  'Diabetology & Endocrinology',
  'ENT',
  'Gastro Surgery',
  'Gastroenterology',
  'General Medicine',
  'General Surgery',
  'Gynae Oncology',
  'Gynaecology',
  'Haematology',
  'Nephrology',
  'Neuro Medicine',
  'Neuro Surgery',
  'Nuclear Medicine',
  'Onco Surgery',
  'Oncology',
  'Oncology Team',
  'Orthopaedics',
  'Paediatric Nephrology',
  'Paediatric Orthopaedics',
  'Paediatric Surgery',
  'Paediatrics',
  'Physical Medicine',
  'Plastic Surgery',
  'Psychiatry',
  'Radiation Oncology',
  'Resp Medicine & Allergy',
  'Rheumatology',
  'Thalassaemia & Haemoglobinopathies',
  'Urology',
];

const QUALIFICATIONS = [
  'MBBS', 'MD', 'MS', 'BDS', 'BAMS', 'BHMS', 'DNB', 'DM', 'MCh', 'PhD', 'Other',
];

const DAYS = [
  { code: 'MON', label: 'Mon' }, { code: 'TUE', label: 'Tue' }, { code: 'WED', label: 'Wed' },
  { code: 'THU', label: 'Thu' }, { code: 'FRI', label: 'Fri' }, { code: 'SAT', label: 'Sat' }, { code: 'SUN', label: 'Sun' },
];

export default function Register() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'PATIENT',
    specialization: '', experienceYears: '',
    availableFrom: '', availableTo: '',
  });
  const [qualifications, setQualifications] = useState([{ degree: '', location: '' }]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableDays, setAvailableDays] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const [doctorPhoto, setDoctorPhoto] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorPhoto(reader.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  }

  async function startCamera() {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or unavailable on this device. Please upload a photo file instead.");
      setIsCameraActive(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }

  function capturePhoto() {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setDoctorPhoto(dataUrl);
      stopCamera();
    }
  }

  const isDoctor = form.role === 'DOCTOR';

  function handleSignInClick(e) {
    e.preventDefault();
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/login');
    }, 280);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleDay(code) {
    setAvailableDays((days) =>
      days.includes(code) ? days.filter((d) => d !== code) : [...days, code]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please re-enter your confirm password.');
      return;
    }

    if (isDoctor && !form.specialization) {
      setError('Please select your specialization');
      return;
    }

    if (isDoctor && qualifications.filter(q => q.degree).length === 0) {
      setError('Please add at least one qualification');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      if (isDoctor) {
        payload.experienceYears = Number(form.experienceYears) || 0;
        payload.availableDays = availableDays;
        if (doctorPhoto) {
          payload.profileImage = doctorPhoto;
          payload.avatarUrl = doctorPhoto;
        }
        // Build qualification string like "MBBS (London), MD (Kolkata)"
        payload.qualification = qualifications
          .filter(q => q.degree)
          .map(q => q.location ? `${q.degree} (${q.location})` : q.degree)
          .join(', ');
      }
      const res = await axiosClient.post('/auth/register', payload);
      const requiresOtp = res.data?.data?.requiresOtp ?? (form.role !== 'PATIENT');

      if (requiresOtp) {
        setSuccess(
          isDoctor
            ? 'Registration Successful! Check your email for OTP verification. Doctor profile is pending admin approval.'
            : 'Registration Successful! Check your email for OTP verification. Staff account is pending admin approval.'
        );
        setTimeout(() => navigate('/verify-otp', { state: { email: form.email } }), 1500);
      } else {
        setSuccess('Registration Successful! Your patient account is active. Redirecting to login...');
        setTimeout(() => navigate('/login', { state: { email: form.email } }), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`h-screen md:h-screen overflow-hidden grid md:grid-cols-12 bg-softBg font-inter transition-all duration-300 ${
      isNavigating ? 'opacity-0 scale-95 -translate-x-6' : 'animate-page-slide-right opacity-100 scale-100'
    }`}>
      
      {/* LEFT COLUMN: Hospital Info Showcase (Hidden on Small Screens) */}
      <div className="hidden md:flex md:col-span-6 relative h-screen bg-slate-900 overflow-hidden flex-col justify-between p-6 sm:p-8 lg:p-10 text-white">
        
        {/* Background Image (Clean Hospital Lobby) */}
        <img
          src="/signup_bg.png?v=2"
          alt="Brainware Medical College & Hospital"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />

        {/* Deep Dark Overlay for 100% Text High Contrast & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/95 via-[#172033]/80 to-[#172033]/60 z-0"></div>

        {/* Top Accreditation Pill (Aligned to Left Side) */}
        <div className="relative z-10 text-left">
          <span className="bg-[#172033]/90 backdrop-blur-md text-emerald-400 font-poppins font-bold text-xs px-4 py-2 rounded-full border border-emerald-500/30 inline-flex items-center gap-2 shadow-lg">
            <span>🏅 Join 50,000+ Happy Patients</span>
            <span>•</span>
            <span>24x7 Support Desk</span>
          </span>
        </div>

        {/* Center Hospital Showcase Card (Centered Horizontally & Vertically) */}
        <div className="relative z-10 max-w-lg mx-auto w-full space-y-4 my-auto bg-[#172033]/85 backdrop-blur-md p-6 rounded-3xl border border-white/15 shadow-2xl text-center">
          
          <div className="space-y-2 flex flex-col items-center">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest bg-secondaryLight/20 border border-secondary/40 px-4 py-1 rounded-full text-emerald-300 inline-block mx-auto shadow-xs">
              Brainware Medical College & Hospital
            </span>
            <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight text-center">
              Create Your Digital <br />
              <span className="text-secondaryLight">Healthcare Account</span>
            </h2>
          </div>

          <p className="text-slate-200 text-xs leading-relaxed font-medium text-center">
            Sign up for instant access to top-rated medical specialists, OPD token booking, health checkup packages, and digital health records.
          </p>

          <div className="space-y-2.5 pt-1 text-left">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15">
              <span className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                ⚡
              </span>
              <div>
                <h4 className="font-poppins font-bold text-xs text-white">Instant OPD & Video Consult Booking</h4>
                <p className="text-[11px] text-slate-200">Book doctor appointments in under 60 seconds</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15">
              <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                🏥
              </span>
              <div>
                <h4 className="font-poppins font-bold text-xs text-white">Multi-Specialty Clinical Access</h4>
                <p className="text-[11px] text-slate-200">Consult 100+ senior specialists across 25+ departments</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Cards Side-by-Side (Full Width of Image Panel) */}
        <div className="relative z-10 grid sm:grid-cols-2 gap-3 w-full">
          
          {/* Card 1: Doctor Slogan */}
          <div className="bg-[#172033]/90 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-start gap-2.5 shadow-md">
            <div className="w-7 h-7 rounded-full bg-emerald-400 text-darkNavy font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              🩺
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-slate-200 italic font-medium leading-snug">
                "Your Health & Well-being is Our Sacred Commitment."
              </p>
              <strong className="text-[10px] font-poppins text-emerald-300 block">
                — Dr. Rajesh Sen (Medical Director)
              </strong>
            </div>
          </div>

          {/* Card 2: Hospital Helpline */}
          <div className="bg-[#172033]/90 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center justify-between text-xs shadow-md">
            <div>
              <span className="text-slate-300 block text-[10px]">24x7 Emergency Helpline</span>
              <strong className="text-white font-poppins text-xs block">Dial 108 / +91 98765 43210</strong>
            </div>
            <span className="bg-emerald-500 text-white font-bold text-[9px] px-2.5 py-1 rounded-full shadow-sm flex-shrink-0">
              ACTIVE
            </span>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Signup Form */}
      <div className="col-span-12 md:col-span-6 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 h-screen max-h-screen overflow-y-auto w-full">
        
        <div className="my-auto space-y-3.5 max-w-2xl w-full mx-auto">
          
          {/* Upper Side: Back to Home Link */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slateText hover:text-primary transition bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm hover:shadow"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Title Header */}
          <div className="space-y-0.5 text-center sm:text-left">
            <h1 className="font-poppins font-extrabold text-xl sm:text-2xl text-darkNavy">
              Create New Account
            </h1>
            <p className="text-[11px] text-slateText">
              Fill in your details below to register for the hospital portal.
            </p>
          </div>

          {/* Main Form Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80 space-y-3 transition-transform duration-300 hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Account Role Selector */}
              <div>
                <label className="block text-[11px] font-bold text-darkNavy mb-0.5">Select Account Type *</label>
                <select
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-darkNavy focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="PATIENT">👤 Patient (Book OPD & View Reports)</option>
                  <option value="DOCTOR">🩺 Doctor (Manage Schedules & Patients)</option>
                  <option value="STAFF">📋 Hospital Staff Member (OPD & Reception Desk)</option>
                </select>
              </div>

              {/* Basic Info Inputs */}
              <div>
                <label className="block text-[11px] font-semibold text-darkNavy mb-0.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sen / Rahul Roy"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-darkNavy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-darkNavy mb-0.5">
                    {form.role === 'PATIENT' ? 'Email Address (Optional)' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required={form.role !== 'PATIENT'}
                    placeholder={form.role === 'PATIENT' ? 'name@example.com (optional)' : 'name@example.com'}
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-darkNavy focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-darkNavy mb-0.5">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-darkNavy focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                
                {/* Password Field with Show/Hide Toggle */}
                <div>
                  <label className="block text-[11px] font-semibold text-darkNavy mb-0.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 pr-16 bg-white text-darkNavy focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary text-xs font-semibold flex items-center gap-1 select-none focus:outline-none bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-lg transition"
                    >
                      {showPassword ? (
                        <><span>👁️</span><span className="text-[9px]">Hide</span></>
                      ) : (
                        <><span>🙈</span><span className="text-[9px]">Show</span></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field with Show/Hide Toggle */}
                <div>
                  <label className="block text-[11px] font-semibold text-darkNavy mb-0.5">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                      className={`w-full text-xs border rounded-xl px-3 py-2 pr-16 bg-white text-darkNavy focus:ring-2 focus:outline-none transition ${
                        form.confirmPassword.length > 0
                          ? form.password === form.confirmPassword
                            ? 'border-emerald-500 focus:ring-emerald-500'
                            : 'border-red-500 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-primary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary text-xs font-semibold flex items-center gap-1 select-none focus:outline-none bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-lg transition"
                    >
                      {showConfirmPassword ? (
                        <><span>👁️</span><span className="text-[9px]">Hide</span></>
                      ) : (
                        <><span>🙈</span><span className="text-[9px]">Show</span></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Full-Width Password Match Progress Bar (Spans from Password start to Confirm Password end) */}
                {form.confirmPassword.length > 0 && (() => {
                  const pw = form.password;
                  const cpw = form.confirmPassword;
                  const isMatch = pw === cpw;

                  // Calculate character-by-character match progress
                  let matchedChars = 0;
                  const maxLen = Math.max(pw.length, 1);
                  for (let i = 0; i < cpw.length && i < pw.length; i++) {
                    if (cpw[i] === pw[i]) matchedChars++;
                    else break; // stop at first mismatch
                  }
                  // If confirm is longer than password, it's a mismatch beyond password length
                  const lengthRatio = pw.length > 0 ? Math.min(cpw.length / pw.length, 1) : 0;
                  const charRatio = pw.length > 0 ? matchedChars / pw.length : 0;
                  const pct = isMatch ? 100 : Math.round(Math.min(charRatio, lengthRatio) * 90); // cap at 90% until exact match

                  const barColor = isMatch
                    ? 'bg-emerald-500'
                    : pct >= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500';

                  const textColor = isMatch ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600';

                  const label = isMatch
                    ? '✅ Passwords match perfectly!'
                    : cpw.length < pw.length
                      ? '⏳ Keep typing to match password...'
                      : '❌ Passwords do not match';

                  return (
                    <div className="sm:col-span-2 space-y-1 pt-0.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={textColor}>{label}</span>
                        <span className={`${textColor} font-extrabold`}>{pct}% Match</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5 border border-slate-300/50 shadow-inner">
                        <div
                          className={`h-full transition-all duration-500 ease-out rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Doctor Profile Specific Extra Fields */}
              {isDoctor && (
                <div className="border-t border-slate-200 pt-2.5 mt-1 space-y-2.5 bg-softBg p-3 rounded-2xl border">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wide">🩺 Professional Doctor Details</p>

                  {/* Doctor Profile Photo (Camera Capture or File Upload) */}
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-darkNavy">
                        Doctor Profile Photo <span className="text-slate-400 font-normal">(Upload file or take photo)</span>
                      </label>
                      {doctorPhoto && (
                        <button
                          type="button"
                          onClick={() => { setDoctorPhoto(''); stopCamera(); }}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md transition"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    {isCameraActive ? (
                      <div className="flex flex-col items-center gap-2 p-2 bg-slate-900 rounded-xl">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-44 h-44 object-cover rounded-xl border-2 border-emerald-400 shadow-md"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md transition flex items-center gap-1"
                          >
                            📷 Capture Photo
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {/* Avatar / Photo Thumbnail Preview */}
                        <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-primary/40 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                          {doctorPhoto ? (
                            <img src={doctorPhoto} alt="Doctor profile preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl text-slate-400">👨‍⚕️</span>
                          )}
                        </div>

                        {/* Control Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer bg-white hover:bg-slate-50 text-darkNavy border border-slate-300 font-semibold text-xs px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5">
                            <span>📁</span> Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={startCamera}
                            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold text-xs px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <span>📸</span> Take Photo with Camera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-darkNavy mb-0.5">Specialization *</label>
                      <select
                        required
                        value={form.specialization}
                        onChange={(e) => update('specialization', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-darkNavy"
                      >
                        <option value="">Select Specialization</option>
                        {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-darkNavy mb-0.5">Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 12"
                        value={form.experienceYears}
                        onChange={(e) => update('experienceYears', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-darkNavy"
                      />
                    </div>
                  </div>

                  {/* Multi-Qualification Entries with Location */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-darkNavy">Qualifications *</label>
                      <button
                        type="button"
                        onClick={() => setQualifications([...qualifications, { degree: '', location: '' }])}
                        className="text-[10px] font-bold text-primary hover:text-primaryDark bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-lg border border-primary/30 transition"
                      >
                        + Add More
                      </button>
                    </div>

                    {qualifications.map((q, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <select
                          value={q.degree}
                          onChange={(e) => {
                            const updated = [...qualifications];
                            updated[idx].degree = e.target.value;
                            setQualifications(updated);
                          }}
                          className="flex-1 text-xs border border-slate-300 rounded-xl px-2 py-1.5 bg-white text-darkNavy"
                        >
                          <option value="">Degree</option>
                          {QUALIFICATIONS.map((qual) => <option key={qual} value={qual}>{qual}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="Location (e.g. London)"
                          value={q.location}
                          onChange={(e) => {
                            const val = e.target.value;
                            const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                            const updated = [...qualifications];
                            updated[idx].location = capitalized;
                            setQualifications(updated);
                          }}
                          className="flex-1 text-xs border border-slate-300 rounded-xl px-2 py-1.5 bg-white text-darkNavy"
                        />
                        {qualifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Preview of combined qualification string */}
                    {qualifications.some(q => q.degree) && (
                      <p className="text-[10px] text-primary font-semibold bg-primary/5 border border-primary/20 rounded-lg px-2 py-1">
                        📋 {qualifications
                          .filter(q => q.degree)
                          .map(q => q.location ? `${q.degree} (${q.location})` : q.degree)
                          .join(', ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-darkNavy mb-0.5">Available Days</label>
                    <div className="grid grid-cols-7 gap-1 mt-0.5">
                      {DAYS.map((d) => (
                        <button
                          type="button"
                          key={d.code}
                          onClick={() => toggleDay(d.code)}
                          className={`text-[10px] px-1 py-1 rounded-md border font-semibold transition text-center ${
                            availableDays.includes(d.code)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-slateText border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-darkNavy mb-0.5">OPD Start Time</label>
                      <input
                        type="time"
                        value={form.availableFrom}
                        onChange={(e) => update('availableFrom', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-2 py-1 bg-white text-darkNavy"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-darkNavy mb-0.5">OPD End Time</label>
                      <input
                        type="time"
                        value={form.availableTo}
                        onChange={(e) => update('availableTo', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-2 py-1 bg-white text-darkNavy"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slateText font-bold italic bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    ⚠️ Note: Doctor profiles require admin approval before activation.
                  </p>
                </div>
              )}

              {/* Staff Member Admin Approval Note */}
              {form.role === 'RECEPTIONIST' && (
                <p className="text-[10px] text-slateText font-bold italic bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  ⚠️ Note: Hospital Staff Member accounts require admin approval before activation.
                </p>
              )}

              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium border border-emerald-200">
                  ✅ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-poppins font-bold text-xs sm:text-sm shadow-glow transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 mt-1"
              >
                {loading ? 'Creating Account...' : '✨ Create Account'}
              </button>

            </form>

            {/* Already registered? Sign In link moved BELOW form fields */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slateText flex items-center justify-center gap-1">
                Already registered?{' '}
                <button
                  onClick={handleSignInClick}
                  className="text-primary font-extrabold hover:underline cursor-pointer transition transform hover:scale-105 active:scale-95 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg border border-primary/30"
                >
                  Sign In to Account 🔑
                </button>
              </p>
            </div>
          </div>

        </div>

        {/* Copyright Pinned to Bottom Part of Website */}
        <p className="text-[11px] text-slateText text-center pt-3 pb-2 w-full mt-auto">
          © 2026 Brainware Medical College & Hospital. All rights reserved.
        </p>

      </div>

    </div>
  );
}
