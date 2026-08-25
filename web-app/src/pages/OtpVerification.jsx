import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/verify-otp', { email, otp });
      const { token, user } = res.data;

      if (token && user) {
        login(user, token);
        setSuccess('OTP verified successfully! Redirecting to your portal dashboard...');

        setTimeout(() => {
          if (user.role === 'ADMIN') navigate('/admin');
          else if (user.role === 'DOCTOR') {
            if (user.approvalStatus === 'APPROVED') navigate('/doctor');
            else navigate('/login');
          } else if (user.role === 'STAFF') navigate('/staff');
          else navigate('/dashboard');
        }, 1200);
      } else {
        setSuccess('OTP verified successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please enter the valid OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-softBg px-4 font-inter">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card border border-slate-200/80 p-8 text-center space-y-5">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl mx-auto font-bold">
          🔑
        </div>
        
        <div>
          <h1 className="text-2xl font-poppins font-extrabold text-darkNavy">OTP Verification</h1>
          <p className="text-xs text-slateText mt-1">
            Enter the 6-digit verification code sent to <strong className="text-primary">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            required
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full text-center tracking-widest text-2xl font-bold border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50 text-darkNavy focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium border border-emerald-200">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-poppins font-bold text-xs sm:text-sm hover:bg-primaryDark transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 shadow-glow"
          >
            {loading ? 'Verifying Code...' : '✨ Verify OTP & Open Dashboard'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100">
          <Link to="/login" className="text-xs font-bold text-slateText hover:text-primary transition">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
