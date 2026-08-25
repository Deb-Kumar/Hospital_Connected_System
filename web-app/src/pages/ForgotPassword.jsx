import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || user?.email || '';

  const [step, setStep] = useState(initialEmail ? 2 : 1); // 1: Send OTP, 2: Enter OTP & New Password
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const matchPercentage = useMemo(() => {
    if (!confirmPassword && !newPassword) return 0;
    if (!confirmPassword || !newPassword) return 0;
    if (confirmPassword === newPassword) return 100;
    let matches = 0;
    const maxLen = Math.max(newPassword.length, confirmPassword.length);
    for (let i = 0; i < Math.min(newPassword.length, confirmPassword.length); i++) {
      if (newPassword[i] === confirmPassword[i]) matches++;
    }
    return Math.round((matches / maxLen) * 100);
  }, [newPassword, confirmPassword]);

  const isMatched = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  useEffect(() => {
    const targetEmail = location.state?.email || user?.email;
    if (targetEmail) {
      setEmail(targetEmail);
      sendOtpForEmail(targetEmail);
    }
  }, []);

  async function sendOtpForEmail(targetEmail) {
    if (!targetEmail) return;
    setError('');
    setMessage('');
    setDevOtpHint('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/forgot-password', { email: targetEmail.trim() });
      setMessage(res.data.message || `A 6-digit OTP code has been sent to ${targetEmail}.`);
      if (res.data.devOtp) {
        setDevOtpHint(res.data.devOtp);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset OTP code.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    sendOtpForEmail(email);
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!otp || !newPassword) return;
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setMessage(res.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please verify your OTP code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-softBg font-inter flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 animate-page-slide-left">
      <div className="my-auto max-w-md w-full mx-auto space-y-4">
        
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slateText hover:text-primary transition bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow"
          >
            ← Back to Login
          </Link>
        </div>

        <div className="space-y-1 text-center">
          <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-darkNavy">
            🔐 Reset Account Password
          </h1>
          <p className="text-xs text-slateText">
            {step === 1
              ? 'Enter your registered account email to receive a 6-digit verification code.'
              : 'Enter the verification OTP sent to your email along with your new password.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-5 transition-transform duration-300 hover:shadow-2xl">
          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium text-center">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium text-center">
              ⚠️ {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-darkNavy focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-poppins font-bold text-xs sm:text-sm shadow-glow transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
              >
                {loading ? 'Sending OTP Code...' : '📩 Send Reset OTP Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-indigo-900 block">
                  Reset code sent to: <span className="font-mono">{email}</span>
                </span>
                {devOtpHint && (
                  <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full inline-block">
                    💡 [Dev Code]: {devOtpHint}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1.5 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.4em] font-mono font-extrabold text-xl py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-slate-900 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-darkNavy focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50/50 pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary text-xs font-semibold select-none focus:outline-none bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-darkNavy focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50/50"
                />

                {/* Password Match Progress Bar with Percentage */}
                {confirmPassword.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={isMatched ? 'text-emerald-600' : 'text-rose-600'}>
                        {isMatched ? '✓ Passwords Match' : 'Password Mismatch'}
                      </span>
                      <span className={isMatched ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>
                        {matchPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isMatched ? 'bg-emerald-500 shadow-xs' : 'bg-rose-500'
                        }`}
                        style={{ width: `${matchPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6 || !newPassword}
                className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-poppins font-bold text-xs sm:text-sm shadow-glow transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
              >
                {loading ? 'Resetting Password...' : '✓ Reset & Update Password'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slateText hover:text-darkNavy font-bold transition"
                >
                  ← Change Email
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-primary hover:text-primaryDark font-bold transition hover:underline"
                >
                  🔄 Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      <p className="text-[11px] text-slateText text-center pt-3 pb-2 w-full mt-auto">
        © 2026 Brainware Medical College & Hospital. All rights reserved.
      </p>
    </div>
  );
}
