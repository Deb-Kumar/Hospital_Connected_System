import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import AboutUs from '../components/About/AboutUs';
import WhyChooseUs from '../components/WhyChooseUs/WhyChooseUs';
import Statistics from '../components/Statistics/Statistics';
import Facilities from '../components/Facilities/Facilities';
import Footer from '../components/Footer/Footer';
import AppointmentSection from '../components/Appointment/AppointmentSection';

export default function About() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path or query params (default: 'overview')
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (location.pathname.includes('/about/mission')) {
      setActiveTab('mission');
    } else if (location.pathname.includes('/about/careers')) {
      setActiveTab('careers');
    } else if (location.pathname.includes('/about/overview')) {
      setActiveTab('overview');
    } else {
      // Check query param e.g. /about?tab=careers
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'mission', 'careers'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [location]);

  function handleTabChange(tabKey) {
    setActiveTab(tabKey);
    navigate(`/about/${tabKey}`, { replace: true });
  }

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Job Application Form State
  const [careerForm, setCareerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: 'Senior Consultant Specialist',
    qualification: '',
    experienceYears: '',
    coverNote: '',
  });

  const [careerSubmitted, setCareerSubmitted] = useState(false);
  const [careerLoading, setCareerLoading] = useState(false);

  function handleCareerSubmit(e) {
    e.preventDefault();
    setCareerLoading(true);
    setTimeout(() => {
      setCareerLoading(false);
      setCareerSubmitted(true);
      setCareerForm({
        fullName: '',
        email: '',
        phone: '',
        position: 'Senior Consultant Specialist',
        qualification: '',
        experienceYears: '',
        coverNote: '',
      });
    }, 800);
  }

  return (
    <div className="min-h-screen bg-softBg font-inter text-darkNavy flex flex-col selection:bg-primary selection:text-white">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* 2. Hero Banner */}
      <div className="bg-gradient-to-r from-darkNavy via-slate-900 to-indigo-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-sky-300 border border-primary/30 px-4 py-1.5 rounded-full text-xs font-semibold">
            <span>🏛️</span> Institutional Excellence & Clinical Legacy
          </div>
          
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            About Brainware Medical College & Hospital
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Pioneering super-specialty medical treatment, academic research, and compassionate patient care in Kolkata & West Bengal. Built on a foundation of ethical healing, state-of-the-art diagnostic innovation, and accessible healthcare for all.
          </p>

          {/* 3 Interactive Section Tabs */}
          <div className="pt-6 flex flex-wrap justify-center sm:justify-start gap-3 text-xs sm:text-sm font-bold">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-6 py-3 rounded-2xl transition border shadow-sm flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-primary text-white border-primary shadow-glow scale-105'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/20'
              }`}
            >
              <span>🏛️</span> 1. Company Overview
            </button>

            <button
              onClick={() => handleTabChange('mission')}
              className={`px-6 py-3 rounded-2xl transition border shadow-sm flex items-center gap-2 ${
                activeTab === 'mission'
                  ? 'bg-primary text-white border-primary shadow-glow scale-105'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/20'
              }`}
            >
              <span>🎯</span> 2. Mission & Vision
            </button>

            <button
              onClick={() => handleTabChange('careers')}
              className={`px-6 py-3 rounded-2xl transition border shadow-sm flex items-center gap-2 ${
                activeTab === 'careers'
                  ? 'bg-primary text-white border-primary shadow-glow scale-105'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/20'
              }`}
            >
              <span>💼</span> 3. Careers & Openings
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content Sections based on Active Tab */}
      <main className="flex-1">
        
        {/* ==================== TAB 1: COMPANY OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-fadeIn py-8">
            <AboutUs />
            <Statistics />
            <WhyChooseUs />
            <Facilities />
          </div>
        )}

        {/* ==================== TAB 2: MISSION & VISION ==================== */}
        {activeTab === 'mission' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14 animate-fadeIn">
            
            {/* Vision & Mission Split Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Vision Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-4 relative overflow-hidden group hover:border-primary/40 transition">
                <div className="w-14 h-14 rounded-2xl bg-primaryLight text-primary flex items-center justify-center text-3xl font-bold mb-2">
                  👁️
                </div>
                <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full">
                  Future Horizon
                </span>
                <h2 className="font-poppins font-extrabold text-2xl text-darkNavy">
                  Our Institutional Vision
                </h2>
                <p className="text-slateText text-sm sm:text-base leading-relaxed">
                  To be globally recognized as a premier medical center of excellence—integrating compassionate clinical care, cutting-edge diagnostic technology, and pioneering medical education that transforms healthcare standards across Eastern India.
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <span>✨ Benchmark of Clinical Quality</span>
                  <span>•</span>
                  <span>Pioneering Research</span>
                </div>
              </div>

              {/* Mission Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-4 relative overflow-hidden group hover:border-secondary/40 transition">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-3xl font-bold mb-2">
                  🎯
                </div>
                <span className="text-secondary font-bold text-xs uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">
                  Daily Commitment
                </span>
                <h2 className="font-poppins font-extrabold text-2xl text-darkNavy">
                  Our Core Mission
                </h2>
                <p className="text-slateText text-sm sm:text-base leading-relaxed">
                  To deliver accessible, high-quality, and affordable multi-specialty clinical care to every patient. We prioritize patient safety, transparent medical counseling, continuous training of healthcare professionals, and 24x7 emergency responsiveness.
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <span>❤️ Patient-First Philosophy</span>
                  <span>•</span>
                  <span>Affordable Healthcare</span>
                </div>
              </div>
            </div>

            {/* 4 Core Pillars */}
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full border border-primary/20">
                  Core Philosophy
                </span>
                <h2 className="font-poppins font-extrabold text-3xl text-darkNavy">
                  The 4 Pillars of Brainware Hospital
                </h2>
                <p className="text-slateText text-sm">
                  Uncompromising principles governing clinical decisions, patient interactions, and medical research.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3 shadow-sm hover:shadow-cardHover transition">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold">
                    🤝
                  </div>
                  <h3 className="font-poppins font-bold text-darkNavy text-base">Compassionate Care</h3>
                  <p className="text-xs text-slateText leading-relaxed">
                    Treating every patient with dignity, empathy, and transparent counseling throughout their medical journey.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3 shadow-sm hover:shadow-cardHover transition">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold">
                    🧪
                  </div>
                  <h3 className="font-poppins font-bold text-darkNavy text-base">Scientific Precision</h3>
                  <p className="text-xs text-slateText leading-relaxed">
                    Utilizing evidence-based diagnostic protocols, multi-disciplinary tumor boards, and advanced robotic surgery options.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3 shadow-sm hover:shadow-cardHover transition">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                    🌱
                  </div>
                  <h3 className="font-poppins font-bold text-darkNavy text-base">Affordable Access</h3>
                  <p className="text-xs text-slateText leading-relaxed">
                    Providing transparent billing, government scheme support (Ayushman Bharat, Swasthya Sathi), and cashless insurance.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3 shadow-sm hover:shadow-cardHover transition">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-bold">
                    🎓
                  </div>
                  <h3 className="font-poppins font-bold text-darkNavy text-base">Academic Excellence</h3>
                  <p className="text-xs text-slateText leading-relaxed">
                    Educating future medical officers, postgraduate residents, and nursing staff to maintain Bengal's healthcare standard.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: CAREERS ==================== */}
        {activeTab === 'careers' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14 animate-fadeIn">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3.5 py-1 rounded-full">
                Work With Us
              </span>
              <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy">
                Careers at Brainware Hospital
              </h2>
              <p className="text-slateText text-sm leading-relaxed">
                Join a multi-specialty medical team committed to clinical excellence, continuous learning, and patient-first care.
              </p>
            </div>

            {/* Active Job Openings Grid */}
            <div className="space-y-6">
              <h3 className="font-poppins font-bold text-xl text-darkNavy flex items-center gap-2">
                <span>📋</span> Current Medical & Staff Openings
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-poppins font-bold text-darkNavy text-base">Senior Consultant Cardiologist</h4>
                      <p className="text-xs text-primary font-semibold">Department of Cardiology</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Full-Time
                    </span>
                  </div>
                  <p className="text-xs text-slateText leading-relaxed">
                    Requirement: MD / DM Cardiology with 5+ years experience in interventional cardiology and cardiac ICU management.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-poppins font-bold text-darkNavy text-base">ICU & Critical Care Staff Nurse</h4>
                      <p className="text-xs text-primary font-semibold">Critical Care Unit (CCU)</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Full-Time / Shifts
                    </span>
                  </div>
                  <p className="text-xs text-slateText leading-relaxed">
                    Requirement: B.Sc Nursing / GNM with 2+ years ICU ventilator & arterial monitoring experience.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-poppins font-bold text-darkNavy text-base">Radiologist & Imaging Specialist</h4>
                      <p className="text-xs text-primary font-semibold">Diagnostics (CT & MRI Wing)</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Full-Time
                    </span>
                  </div>
                  <p className="text-xs text-slateText leading-relaxed">
                    Requirement: MD Radiology / DMRD with proficiency in 3T MRI, 128-slice CT, and Doppler Ultrasound.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-poppins font-bold text-darkNavy text-base">Hospital Front Desk Executive</h4>
                      <p className="text-xs text-primary font-semibold">Patient Relations Desk</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Full-Time
                    </span>
                  </div>
                  <p className="text-xs text-slateText leading-relaxed">
                    Requirement: Graduate degree with excellent communication skills in English, Bengali & Hindi.
                  </p>
                </div>
              </div>
            </div>

            {/* Online Job Application Form */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card max-w-3xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full">
                  Online Job Application
                </span>
                <h3 className="font-poppins font-extrabold text-2xl text-darkNavy mt-2">
                  Apply for a Position
                </h3>
                <p className="text-xs text-slateText mt-1">
                  Submit your application to Brainware Hospital Human Resources Department.
                </p>
              </div>

              {careerSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto font-bold shadow">
                    ✓
                  </div>
                  <h4 className="font-poppins font-bold text-emerald-900 text-lg">Application Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Thank you for applying to Brainware Hospital. Our HR recruitment team will review your application and contact short-listed candidates.
                  </p>
                  <button
                    onClick={() => setCareerSubmitted(false)}
                    className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCareerSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-darkNavy mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. / Mr. / Ms. Full Name"
                        value={careerForm.fullName}
                        onChange={(e) => setCareerForm({ ...careerForm, fullName: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-darkNavy mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={careerForm.email}
                        onChange={(e) => setCareerForm({ ...careerForm, email: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-darkNavy mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={careerForm.phone}
                        onChange={(e) => setCareerForm({ ...careerForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-darkNavy mb-1">Position Applied For *</label>
                      <select
                        value={careerForm.position}
                        onChange={(e) => setCareerForm({ ...careerForm, position: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                      >
                        <option value="Senior Consultant Specialist">Senior Consultant Specialist</option>
                        <option value="Resident Doctor (MO)">Resident Doctor (MO)</option>
                        <option value="ICU & Critical Care Staff Nurse">ICU & Critical Care Staff Nurse</option>
                        <option value="Radiologist & Imaging Specialist">Radiologist & Imaging Specialist</option>
                        <option value="Hospital Front Desk Executive">Hospital Front Desk Executive</option>
                        <option value="Medical Lab Technician">Medical Lab Technician</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-darkNavy mb-1">Highest Medical Qualification *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MBBS, MD, B.Sc Nursing"
                        value={careerForm.qualification}
                        onChange={(e) => setCareerForm({ ...careerForm, qualification: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-darkNavy mb-1">Total Experience (Years) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="e.g. 5"
                        value={careerForm.experienceYears}
                        onChange={(e) => setCareerForm({ ...careerForm, experienceYears: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkNavy mb-1">Cover Note / Key Clinical Skills *</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Briefly describe your clinical background and key competencies..."
                      value={careerForm.coverNote}
                      onChange={(e) => setCareerForm({ ...careerForm, coverNote: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={careerLoading}
                    className="w-full bg-primary hover:bg-primaryDark text-white font-poppins font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-glow transition transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    {careerLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>💼 Submit Job Application</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

      </main>

      {/* 4. Footer */}
      <Footer
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Appointment Booking Modal */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl lg:max-w-6xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAppointmentModalOpen(false)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl z-20"
            >
              ✕
            </button>
            <AppointmentSection isModal={true} onBookingComplete={() => setIsAppointmentModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
