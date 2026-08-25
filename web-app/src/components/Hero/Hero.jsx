import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ onOpenAppointmentModal, departments = [] }) {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  function handleQuickSearch(e) {
    e.preventDefault();
    const doctorsSection = document.getElementById('doctors');
    if (doctorsSection) {
      doctorsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <section id="hero" className="relative min-h-[85vh] lg:min-h-[88vh] flex flex-col justify-between bg-slate-900 overflow-hidden">
      
      {/* 1. Full-Bleed Background Image (Doctors on the Right) */}
      <img
        src="/hospital_hero.png?v=3"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1600";
        }}
        alt="Brainware Medical College & Hospital Healthcare Team"
        className="absolute inset-0 w-full h-full object-cover object-right md:object-right-top z-0"
      />

      {/* 2. Soft White/Light Gradient Overlay (Ensures 100% text readability on the left) */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 sm:via-white/80 to-transparent md:to-white/10 z-0"></div>

      {/* 3. Hero Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto py-12 lg:py-20 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center">

          {/* Left Content Column (Takes 7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 bg-primaryLight text-primary font-semibold text-xs px-3.5 py-1.5 rounded-full border border-primary/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              25 Years of Healing & Wellness • NABH & ISO Accredited
            </div>

            {/* Main Headline */}
            <h1 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold text-darkNavy leading-[1.15]">
              A Legacy of Healing, <br />
              <span className="bg-gradient-to-r from-primary via-primaryDark to-secondary bg-clip-text text-transparent">
                Hope and Health
              </span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-slateText text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              At the heart of our legacy lies a commitment to your well-being. Brainware Medical College & Hospital delivers world-class multi-specialty clinical care, advanced technology, and compassionate treatment 24/7.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenAppointmentModal}
                className="bg-primary hover:bg-primaryDark text-white px-7 py-3.5 rounded-xl font-poppins font-semibold text-sm shadow-glow hover:shadow-cardHover transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                📅 Book an Appointment
              </button>
              <Link
                to="/doctors"
                className="bg-white hover:bg-slate-50 text-darkNavy border border-slate-300 px-6 py-3.5 rounded-xl font-poppins font-semibold text-sm shadow-sm transition hover:border-primary hover:text-primary flex items-center gap-2"
              >
                🔍 Find a Doctor
              </Link>
              <a
                href="tel:108"
                className="text-xs font-bold text-emergency flex items-center gap-1.5 px-3.5 py-3 bg-emergencyLight rounded-xl border border-emergency/20"
              >
                🚨 Emergency: 108
              </a>
            </div>



          </div>

        </div>
      </div>

      {/* 4. Bottom Announcement & Updates Marquee Ticker */}
      <div className="relative z-10 bg-darkNavy text-white py-3 px-4 border-t border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-xs font-inter overflow-hidden">
          <span className="bg-primary text-white font-poppins font-bold px-3 py-1 rounded-md flex-shrink-0 uppercase tracking-wider text-[11px] shadow-sm z-10">
            Updates
          </span>
          <div className="overflow-hidden whitespace-nowrap text-gray-300 flex-1 relative">
            <div className="animate-marquee-infinite flex items-center gap-6 text-xs font-medium">
              <div className="flex items-center gap-6">
                <span>📢 24x7 Multi-Specialty Emergency & OPD Services Operational</span>
                <span className="text-primary">•</span>
                <span>🏅 NABH & NABL Accredited Super-Specialty Hospital</span>
                <span className="text-primary">•</span>
                <span>🚑 GPS Ambulance Dispatch Hotline: Dial 108</span>
                <span className="text-primary">•</span>
                <span>🩺 Free Community Health Checkup OPD Every Saturday</span>
                <span className="text-primary">•</span>
                <span>💊 24x7 Pharmacy & Diagnostics Laboratory Open</span>
                <span className="text-primary">•</span>
              </div>
              <div className="flex items-center gap-6">
                <span>📢 24x7 Multi-Specialty Emergency & OPD Services Operational</span>
                <span className="text-primary">•</span>
                <span>🏅 NABH & NABL Accredited Super-Specialty Hospital</span>
                <span className="text-primary">•</span>
                <span>🚑 GPS Ambulance Dispatch Hotline: Dial 108</span>
                <span className="text-primary">•</span>
                <span>🩺 Free Community Health Checkup OPD Every Saturday</span>
                <span className="text-primary">•</span>
                <span>💊 24x7 Pharmacy & Diagnostics Laboratory Open</span>
                <span className="text-primary">•</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Right Side Vertical Sticky Button (Peerless Hospital Style) */}
      <div className="hidden lg:block fixed right-0 top-1/3 z-40">
        <button
          onClick={onOpenAppointmentModal}
          className="bg-primary hover:bg-primaryDark text-white font-poppins font-bold text-xs py-4 px-3 rounded-l-2xl shadow-glow transition hover:px-4 flex items-center gap-2 border-l border-t border-b border-blue-400"
          style={{ writingMode: 'vertical-rl' }}
        >
          📅 Book an Appointment
        </button>
      </div>

    </section>
  );
}
