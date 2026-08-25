import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PatientPortalBanner() {
  const { user } = useAuth();

  const features = [
    { icon: '📅', title: 'View Appointments', desc: 'Track upcoming OPD visits, queue tokens, & booking history.' },
    { icon: '📄', title: 'Download Prescriptions', desc: 'Instant access to doctor advice, dosage schedules, & e-prescriptions.' },
    { icon: '🧪', title: 'Test Reports & Pathology', desc: 'View high-res diagnostic lab results & digital radiologist reports.' },
    { icon: '💳', title: 'Online Hospital Billing', desc: 'Pay OPD/IPD invoices securely via UPI, Card, or Net Banking.' },
  ];

  return (
    <section className="py-16 bg-softBg border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-r from-primaryDark via-primary to-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-cardHover relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Header */}
            <div className="lg:col-span-5 space-y-4">
              <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-yellow-300">
                🔒 Secure Digital Patient Portal
              </span>
              <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl leading-tight">
                Manage Your Medical History Anywhere
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                Access your health records, lab reports, prescriptions, and appointment history 24x7 from any device.
              </p>

              <div className="pt-2">
                {user ? (
                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : user.role === 'DOCTOR' ? '/doctor' : '/patient'}
                    className="inline-block bg-white text-primary hover:bg-yellow-300 hover:text-darkNavy font-poppins font-bold px-6 py-3 rounded-xl text-xs shadow transition transform hover:-translate-y-0.5"
                  >
                    🚀 Launch My Patient Portal
                  </Link>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      className="bg-white text-primary hover:bg-yellow-300 hover:text-darkNavy font-poppins font-bold px-6 py-3 rounded-xl text-xs shadow transition"
                    >
                      Login to Patient Portal
                    </Link>
                    <Link
                      to="/register"
                      className="bg-white/20 hover:bg-white/30 text-white font-poppins font-semibold px-5 py-3 rounded-xl text-xs border border-white/30 transition"
                    >
                      Register New Account
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Grid Cards */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition duration-300"
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h4 className="font-poppins font-bold text-sm text-white mb-1">{f.title}</h4>
                  <p className="text-[11px] text-blue-100 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
