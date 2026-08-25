import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [role, setRole] = useState('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // 2FA state
  const [require2FA, setRequire2FA] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleCreateAccountClick(e) {
    e.preventDefault();
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/register');
    }, 280);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResendStatus('');
    setApprovalStatus(null);
    setLoading(true);

    try {
      const res = await login(email, password, role, require2FA ? otp.trim() : undefined);

      if (res?.require2FA) {
        setRequire2FA(true);
        setOtpMessage(res.message || '2FA authentication is enabled. Please enter the 6-digit OTP code sent to your registered email.');
        setTargetEmail(res.email || email);
        if (res.devOtp) setDevOtpHint(res.devOtp);
        setLoading(false);
        return;
      }

      const user = res;
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'DOCTOR') navigate('/doctor');
      else if (user.role === 'STAFF') navigate('/staff');
      else navigate('/patient');
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.code === 'UNVERIFIED_EMAIL') {
        setError('Your email address is not verified yet. Redirecting to OTP verification...');
        setTimeout(() => navigate('/verify-otp', { state: { email } }), 1500);
        return;
      }

      if (resp?.code === 'DOCTOR_NOT_APPROVED') {
        setApprovalStatus(resp.approvalStatus);
        setError(resp.message || 'Your doctor account status is pending admin approval.');
        return;
      }

      if (resp?.code === 'STAFF_NOT_APPROVED') {
        setApprovalStatus(resp.approvalStatus);
        setError(resp.message || 'Your staff account is pending admin approval.');
        return;
      }

      if (resp?.code === 'GUEST_ACCOUNT') {
        setError('This phone/email was used for a guest booking. Redirecting you to sign up to set a password...');
        setTimeout(() => navigate('/register', { state: { phone: resp.phone } }), 2000);
        return;
      }

      setError(resp?.message || 'Invalid email or password credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp(e) {
    e.preventDefault();
    setResendStatus('');
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password, role);
      if (res?.require2FA) {
        setOtpMessage(res.message || 'A new 2FA OTP code has been generated and sent to your email.');
        setResendStatus('✓ A fresh 6-digit OTP code has been sent to your email!');
        if (res.devOtp) setDevOtpHint(res.devOtp);
        setOtp('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleBackToLogin() {
    setRequire2FA(false);
    setOtp('');
    setError('');
    setResendStatus('');
    setDevOtpHint('');
  }

  return (
    <div className={`min-h-screen grid md:grid-cols-12 bg-softBg font-inter transition-all duration-300 ${
      isNavigating ? 'opacity-0 scale-95 translate-x-6' : 'animate-page-slide-left opacity-100 scale-100'
    }`}>
      
      {/* LEFT COLUMN: Login Form & Navigation */}
      <div className="col-span-12 md:col-span-6 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 h-screen max-h-screen overflow-y-auto w-full">
        
        <div className="my-auto space-y-3.5 max-w-2xl w-full mx-auto">
          
          {/* Upper Side: Back to Home Link */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slateText hover:text-primary transition bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Title Header */}
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-darkNavy">
              {require2FA ? '🛡️ 2FA Verification' : 'Portal Sign In'}
            </h1>
            <p className="text-xs text-slateText">
              {require2FA
                ? 'Two-Factor Authentication is active. Please enter your 6-digit security code to proceed.'
                : 'Access your medical history, book OPD consultations, and manage records securely.'}
            </p>
          </div>

          {/* Login Form Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-5 transition-transform duration-300 hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {require2FA ? (
                /* 2FA Verification Screen */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-1.5 text-center">
                    <span className="text-2xl">🔐</span>
                    <h3 className="font-bold text-xs text-indigo-950">
                      Security Verification Required
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {otpMessage || `Enter the 6-digit security code sent to your registered email (${targetEmail}).`}
                    </p>
                    {devOtpHint && (
                      <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        💡 [Dev Code]: {devOtpHint}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-darkNavy mb-1.5 text-center">
                      Enter 6-Digit 2FA OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      autoFocus
                      required
                      className="w-full text-center tracking-[0.4em] font-mono font-extrabold text-2xl py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-slate-900 shadow-inner"
                    />
                  </div>

                  {resendStatus && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium text-center animate-fadeIn">
                      {resendStatus}
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium text-center">
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full bg-primary hover:bg-primaryDark text-white py-3.5 rounded-xl font-poppins font-bold text-xs sm:text-sm shadow-glow transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                  >
                    {loading ? 'Verifying 2FA Code...' : '✓ Verify & Sign In'}
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-3 border-t border-slate-100 font-medium">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="text-slateText hover:text-darkNavy font-bold transition flex items-center gap-1"
                      >
                        ← Back to Sign In
                      </button>

                      <span className="text-slate-300">•</span>

                      <Link
                        to="/forgot-password"
                        className="text-primary hover:text-primaryDark font-bold hover:underline transition"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleResendOtp}
                      className="text-primary font-extrabold hover:underline cursor-pointer transition transform hover:scale-105 active:scale-95 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg border border-primary/30 disabled:opacity-50"
                    >
                      🔄 Resend OTP Code
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Login Form */
                <>
                  {/* Account Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-darkNavy mb-1.5">
                      Select Account Type / Role
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'PATIENT', label: 'Patient', icon: '👤' },
                        { id: 'DOCTOR', label: 'Doctor', icon: '🩺' },
                        { id: 'STAFF', label: 'Staff', icon: '📋' },
                        { id: 'ADMIN', label: 'Admin', icon: '🛡️' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                            role === r.id
                              ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/30'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-sm">{r.icon}</span>
                          <span>{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email / Phone Field */}
                  <div>
                    <label className="block text-xs font-bold text-darkNavy mb-1">
                      {role === 'PATIENT' ? 'Email Address or Phone Number' : 'Email Address'}
                    </label>
                    <input
                      type={role === 'PATIENT' ? 'text' : 'email'}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'PATIENT' ? 'name@example.com or 10-digit phone' : 'name@example.com'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-darkNavy focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50/50"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-darkNavy mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-darkNavy focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50/50 pr-16"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary text-xs font-semibold flex items-center gap-1 select-none focus:outline-none bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition"
                      >
                        {showPassword ? (
                          <><span>👁️</span><span className="text-[10px]">Hide</span></>
                        ) : (
                          <><span>🙈</span><span className="text-[10px]">Show</span></>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className={`p-3.5 rounded-xl text-xs font-medium leading-relaxed ${
                      approvalStatus === 'PENDING' ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : approvalStatus === 'REJECTED' ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryDark text-white py-3.5 rounded-xl font-poppins font-bold text-xs sm:text-sm shadow-glow transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                  >
                    {loading ? 'Authenticating Credentials...' : '🔐 Sign In to Portal'}
                  </button>

                  {/* Form Options */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-3 border-t border-slate-100 font-medium">
                    <Link
                      to="/forgot-password"
                      className="text-primary hover:text-primaryDark font-bold hover:underline transition"
                    >
                      Forgot Password?
                    </Link>

                    <p className="text-slateText flex items-center gap-1">
                      Don't have an account?{' '}
                      <button
                        onClick={handleCreateAccountClick}
                        className="text-primary font-extrabold hover:underline cursor-pointer transition transform hover:scale-105 active:scale-95 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg border border-primary/30"
                      >
                        Create Account ✨
                      </button>
                    </p>
                  </div>
                </>
              )}

            </form>
          </div>

        </div>

        {/* Copyright Pinned to Bottom Part of Website */}
        <p className="text-[11px] text-slateText text-center pt-3 pb-2 w-full mt-auto">
          © 2026 Brainware Medical College & Hospital. All rights reserved.
        </p>

      </div>

      {/* RIGHT COLUMN: Hospital Info Showcase (Hidden on Small Screens) */}
      <div className="hidden md:flex md:col-span-6 relative h-screen bg-slate-900 overflow-hidden flex-col justify-between p-6 sm:p-8 lg:p-10 text-white">
        
        {/* Clean Background Image */}
        <img
          src="/login_bg.png?v=2"
          alt="Brainware Medical College & Hospital"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />

        {/* Deep Dark Overlay for 100% Text High Contrast & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/95 via-[#172033]/80 to-[#172033]/60 z-0"></div>

        {/* Top Accreditation Pill (Aligned to Left Side) */}
        <div className="relative z-10 text-left">
          <span className="bg-[#172033]/90 backdrop-blur-md text-yellow-300 font-poppins font-bold text-xs px-4 py-2 rounded-full border border-yellow-400/30 inline-flex items-center gap-2 shadow-lg">
            <span>🛡️ 256-Bit Encrypted Gateway</span>
            <span>•</span>
            <span>NABH Accredited</span>
          </span>
        </div>
        
        {/* Center Hospital Showcase Card (Centered Horizontally & Vertically) */}
        <div className="relative z-10 max-w-lg mx-auto w-full space-y-5 my-auto bg-[#172033]/85 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl text-center">
          
          <div className="space-y-3 flex flex-col items-center">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest bg-secondaryLight/20 border border-secondary/40 px-4 py-1.5 rounded-full text-emerald-300 inline-block mx-auto shadow-xs">
              Brainware Medical College & Hospital
            </span>
            <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight text-center">
              Advanced Digital <br />
              <span className="text-primaryLight font-extrabold">Patient Portal Gateway</span>
            </h2>
          </div>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
            Brainware Medical College & Hospital provides patient-first digital healthcare services. Access your digital health records, live doctor queue tokens, diagnostic radiology reports, and online billing anytime.
          </p>

          <div className="space-y-2.5 pt-2 text-left">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-white/15">
              <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                📱
              </span>
              <div>
                <h4 className="font-poppins font-bold text-xs text-white">Instant OPD Token Tracking</h4>
                <p className="text-[11px] text-slate-200">Live queue token updates directly on your phone</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-white/15">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                🧪
              </span>
              <div>
                <h4 className="font-poppins font-bold text-xs text-white">24/7 Digital Pathology Reports</h4>
                <p className="text-[11px] text-slate-200">Instant PDF download of verified lab test results</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Cards Side-by-Side (Full Width of Image Panel) */}
        <div className="relative z-10 grid sm:grid-cols-2 gap-3 w-full">
          
          {/* Card 1: Doctor Slogan */}
          <div className="bg-[#172033]/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex items-start gap-2.5 shadow-md">
            <div className="w-7 h-7 rounded-full bg-yellow-400 text-darkNavy font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              🩺
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-slate-200 italic font-medium leading-snug">
                "Patient Comfort & Digital Care Always Come First."
              </p>
              <strong className="text-[10px] font-poppins text-yellow-300 block">
                — Dr. Ananya Sharma (Cardiology)
              </strong>
            </div>
          </div>

          {/* Card 2: Digital Portal Support */}
          <div className="bg-[#172033]/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex items-center justify-between text-xs shadow-md">
            <div>
              <span className="text-slate-300 block text-[10px]">24x7 Digital Portal Support</span>
              <strong className="text-white font-poppins text-xs block">Dial 108 / +91 98765 43210</strong>
            </div>
            <span className="bg-primary text-white font-bold text-[9px] px-2.5 py-1 rounded-full shadow-sm flex-shrink-0">
              ACTIVE
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
