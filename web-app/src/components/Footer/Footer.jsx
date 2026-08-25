import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ onOpenAppointmentModal, onOpenEmergencyModal }) {
  return (
    <footer className="bg-[#172033] text-white pt-16 pb-10 font-inter border-t border-slate-700/80" style={{ backgroundColor: '#172033' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-700/80">
          
          {/* Col 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
              <img
                src="/hospital_logo.png"
                alt="Brainware Medical College & Hospital"
                className="h-14 sm:h-16 max-w-[280px] w-auto object-contain"
              />
            </div>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
              Brainware Medical College & Hospital is a super-specialty tertiary care institution committed to clinical excellence, medical education, advanced research, and compassionate patient care.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full">
                🏅 NABH & NABL Accredited
              </span>
              <span className="bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
                ISO 9001:2015
              </span>
            </div>
          </div>

          {/* Combined Container: Quick Links (Left) & Key Specialties (Right) on Small & Large Screens */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-6 sm:gap-8">
            {/* Quick Links (Left) */}
            <div className="space-y-3">
              <h4 className="font-poppins font-bold text-sm text-white uppercase tracking-wider border-b border-primary/40 pb-2 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200 font-medium">
                <li><Link to="/" className="hover:text-primaryLight hover:underline transition">Home</Link></li>
                <li><Link to="/about" className="hover:text-primaryLight hover:underline transition">About Us</Link></li>
                <li><Link to="/departments" className="hover:text-primaryLight hover:underline transition">Departments</Link></li>
                <li><Link to="/doctors" className="hover:text-primaryLight hover:underline transition">Doctor Directory</Link></li>
                <li><Link to="/services" className="hover:text-primaryLight hover:underline transition">Hospital Services</Link></li>
                <li><Link to="/contact" className="hover:text-primaryLight hover:underline transition">Contact Us</Link></li>
              </ul>
            </div>

            {/* Key Specialties (Right side of Quick Links) */}
            <div className="space-y-3">
              <h4 className="font-poppins font-bold text-sm text-white uppercase tracking-wider border-b border-primary/40 pb-2 inline-block">
                Key Specialties
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200 font-medium">
                <li><a href="#departments" className="hover:text-primaryLight hover:underline transition">Cardiology & Heart</a></li>
                <li><a href="#departments" className="hover:text-primaryLight hover:underline transition">Neurology & Neuro</a></li>
                <li><a href="#departments" className="hover:text-primaryLight hover:underline transition">Orthopedics & Joint</a></li>
                <li><a href="#departments" className="hover:text-primaryLight hover:underline transition">Pediatrics Care</a></li>
                <li><a href="#departments" className="hover:text-primaryLight hover:underline transition">Gynecology Care</a></li>
                <li><a href="#departments" className="hover:text-primaryLight hover:underline transition">Oncology & Cancer</a></li>
                <li><a href="#departments" className="hover:text-primaryLight hover:underline transition">24x7 Emergency</a></li>
              </ul>
            </div>
          </div>

          {/* Col 4: Emergency Helpline & CTAs (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-poppins font-bold text-sm text-white uppercase tracking-wider border-b border-emergency/40 pb-2 inline-block">
              Emergency Helpline
            </h4>
            
            <div className="p-4 bg-gradient-to-br from-red-950/40 via-emergency/25 to-red-900/30 border border-emergency/50 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0"></span>
                <p className="text-xs text-red-200 font-semibold tracking-wide">
                  24×7 Ambulance & ER Dispatch Hotline
                </p>
              </div>

              <div className="space-y-2">
                <a
                  href="tel:108"
                  className="flex items-center gap-2.5 bg-emergency/40 hover:bg-emergency/60 border border-red-500/40 px-3 py-2 rounded-xl text-white transition group"
                >
                  <span className="text-lg">📞</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-red-200 group-hover:text-yellow-300 transition">Toll-Free Emergency</span>
                    <span className="text-base font-poppins font-extrabold text-white tracking-wide group-hover:text-yellow-300 transition whitespace-nowrap">CALL 108</span>
                  </div>
                </a>

                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-white transition group"
                >
                  <span className="text-xl">📱</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300 group-hover:text-primaryLight transition">Direct ER Floor Desk</span>
                    <span className="text-base font-mono font-extrabold text-white tracking-wider group-hover:text-primaryLight transition whitespace-nowrap">+91 98765 43210</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <button
                onClick={onOpenAppointmentModal}
                className="w-full bg-primary hover:bg-primaryDark text-white text-xs sm:text-sm font-poppins font-semibold py-3 px-3 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>📅</span>
                <span>Book Appointment Online</span>
              </button>
              <button
                onClick={onOpenEmergencyModal}
                className="w-full bg-emergency hover:bg-emergencyDark text-white text-xs sm:text-sm font-poppins font-semibold py-3 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>🚨</span>
                <span>Emergency Assistance Desk</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-300 font-medium gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} Brainware Medical College & Hospital. All Rights Reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-slate-300">
            <Link to="/privacy-policy" className="hover:text-white hover:underline transition whitespace-nowrap">Privacy Policy</Link>
            <span className="text-slate-600 font-bold">•</span>
            <Link to="/terms-conditions" className="hover:text-white hover:underline transition whitespace-nowrap">Terms & Conditions</Link>
            <span className="text-slate-600 font-bold">•</span>
            <Link to="/patient-charter" className="hover:text-white hover:underline transition whitespace-nowrap">Patient Charter</Link>
            <span className="text-slate-600 font-bold">•</span>
            <Link to="/cookie-policy" className="hover:text-white hover:underline transition whitespace-nowrap">Cookie Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
