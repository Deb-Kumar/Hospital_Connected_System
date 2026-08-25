import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';
import AppointmentSection from '../components/Appointment/AppointmentSection';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedService, setSelectedService] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const servicesList = [
    { category: 'Outpatient & Rehab', icon: '🩺', name: 'Outpatient Department (OPD)', timings: 'Mon-Sat (8:00 AM - 8:00 PM)', desc: 'Consultations across 25+ medical specialties with senior doctors, diagnostic ordering, and follow-ups.', highlights: ['25+ Specialty Clinics', 'Senior Professors & Surgeons', 'Instant Online Token Booking', 'Digital Health Record Integration'] },
    { category: 'Emergency & Critical', icon: '🛏️', name: 'Inpatient Department (IPD)', timings: '24×7 Admission Care', desc: 'Spacious private rooms, semi-private wards, and round-the-clock nursing for medical and surgical stays.', highlights: ['Deluxe & Deluxe Suite Rooms', '24x7 Resident Doctor Coverage', 'Central Oxygen Supply', 'Dietitian Consultation Included'] },
    { category: 'Emergency & Critical', icon: '🚨', name: 'Emergency & Trauma Care', timings: '24×7 Round-the-Clock', desc: 'Level-1 emergency unit for polytrauma, cardiac arrests, stroke management, and acute burns.', highlights: ['Triage Rapid Response Team', 'Dedicated Cardiac Cath Lab Access', 'Emergency Resuscitation Beds', 'Direct ICU Transfer Pipeline'] },
    { category: 'Emergency & Critical', icon: '🫁', name: 'Intensive Care Unit (ICU/CCU)', timings: '24×7 Monitoring', desc: 'Ultra-modern ventilator units, invasive arterial monitoring, and dedicated 1:1 patient care nurses.', highlights: ['HEPA Filtered Isolation Beds', 'High-End Mechanical Ventilators', '1:1 Nurse-to-Patient Ratio', 'Real-time Hemodynamic Monitors'] },
    { category: 'Emergency & Critical', icon: '🔪', name: 'Advanced Operation Theatre', timings: 'Scheduled & Emergency', desc: 'Ultra-clean laminar airflow surgical suites equipped for laparoscopic, orthopedic, and neurosurgeries.', highlights: ['Modular Stainless Steel OTs', 'Laminar Airflow Cleanroom System', '4K Laparoscopic Imaging Towers', 'C-Arm Fluoroscopy Imaging'] },
    { category: 'Diagnostics & Imaging', icon: '🧪', name: 'Diagnostic Laboratory', timings: '24×7 Sampling & Testing', desc: 'NABL accredited automated biochemistry, hematology, microbiology, and molecular pathology lab.', highlights: ['Automated Roche & Abbott Analyzers', 'Same-Day Digital Test Reports', 'Home Sample Collection Option', 'NABL Accredited Standard'] },
    { category: 'Diagnostics & Imaging', icon: '🩻', name: 'Digital X-Ray & Imaging', timings: '24×7 Service Available', desc: 'High-resolution low-radiation digital radiography for quick skeletal and chest diagnostics.', highlights: ['Low Radiation Exposure', 'PACS Digital Storage', 'Instant Radiologist Consultation', 'Bedside Portable X-Ray Unit'] },
    { category: 'Diagnostics & Imaging', icon: '🧠', name: '128-Slice CT & 3T MRI Scan', timings: '24×7 Fast Scanning', desc: 'State-of-the-art neuro, cardiac, and body MRI/CT imaging with instant digital radiologist reports.', highlights: ['High Definition 3T MRI Imaging', '128-Slice Ultra-Fast CT Scans', 'Cardiac Angiography Support', 'Quiet Scan Comfort Tech'] },
    { category: 'Diagnostics & Imaging', icon: '🔊', name: '3D/4D Color Ultrasound', timings: 'Mon-Sat (8:00 AM - 6:00 PM)', desc: 'High-end Doppler ultrasound for obstetrics, abdominal, vascular, and soft tissue assessments.', highlights: ['4D Anomaly Fetal Scanning', 'Color Doppler Vascular Mapping', 'Targeted Organ Biopsy Guidance', 'Expert Female Sonologists'] },
    { category: 'In-House Support', icon: '💊', name: '24×7 In-House Pharmacy', timings: '24×7 Open Continuous', desc: '100% genuine prescribed medicines, surgical consumables, and refrigerated biological storage.', highlights: ['100% Authentic Medications', 'Subsidized Pricing for IPD', 'Refrigerated Insulin & Biologics', 'Direct Bedside IPD Delivery'] },
    { category: 'In-House Support', icon: '🩸', name: 'Blood Bank & Components', timings: '24×7 Availability', desc: 'Licensed blood bank providing whole blood, packed red cells, fresh frozen plasma, and platelets.', highlights: ['Component Separation Facility', 'Single Donor Platelet (SDP) Tech', 'Voluntary Donor Camps', 'Strict Viral Marker Testing'] },
    { category: 'Emergency & Critical', icon: '🚑', name: 'ALS & Mobile ICU Ambulance', timings: '24×7 Dispatch Hotline', desc: 'GPS-tracked emergency ambulances equipped with ventilators, defibrillators, & paramedic staff.', highlights: ['Advance Life Support (ALS) Fitted', 'In-Transit Paramedics', 'GPS Live Tracking Link', 'Zero Dispatch Latency'] },
    { category: 'Outpatient & Rehab', icon: '🏃‍♂️', name: 'Physiotherapy & Rehab', timings: 'Mon-Sat (9:00 AM - 5:00 PM)', desc: 'Post-operative rehabilitation, stroke recovery therapy, sports injury management, & pain relief.', highlights: ['Electrotherapy & Ultrasound Unit', 'Custom Post-Surgery Exercise', 'Stroke Neurological Rehab', 'Certified Sports Physiotherapists'] },
    { category: 'Outpatient & Rehab', icon: '📋', name: 'Preventive Health Checkups', timings: 'Mon-Sat (7:30 AM - 2:00 PM)', desc: 'Customized wellness checkup packages for individuals, families, and corporate employees.', highlights: ['Comprehensive Full Body Screening', 'Corporate Wellness Audits', 'Senior Citizen Packages', 'Includes Specialist Consultation'] },
  ];

  const categories = ['All', 'Emergency & Critical', 'Diagnostics & Imaging', 'Outpatient & Rehab', 'In-House Support'];

  const filteredServices = servicesList.filter((srv) => {
    const matchesSearch = srv.name.toLowerCase().includes(searchTerm.toLowerCase()) || srv.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || srv.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-softBg font-inter text-darkNavy flex flex-col selection:bg-primary selection:text-white">
      {/* Header Navigation */}
      <Navbar
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-darkNavy via-slate-900 to-indigo-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-sky-300 border border-primary/30 px-3.5 py-1 rounded-full text-xs font-semibold">
            <span>🏥</span> 24×7 Comprehensive Clinical Services Directory
          </div>
          
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Major Hospital Medical Services
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Providing end-to-end diagnostic, therapeutic, emergency, and surgical care with advanced technology and round-the-clock medical specialists.
          </p>

          {/* Search & Category Filter Pills */}
          <div className="pt-4 space-y-3 max-w-5xl">
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search services (e.g. ICU, CT Scan, Pharmacy, Ambulance)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900/90 transition"
              />
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-2xl transition border shadow-xs ${
                    selectedCategory === cat
                      ? 'bg-primary text-white border-primary shadow-glow scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="font-poppins font-bold text-xl text-darkNavy flex items-center gap-2">
            <span>✨</span> Clinical & Auxiliary Services
          </h2>
          <span className="text-xs text-slateText font-medium">
            Category: <strong className="text-primary font-bold">{selectedCategory}</strong>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 shadow-card hover:shadow-cardHover border border-slate-200/80 transition duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primaryLight text-primary text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full uppercase">
                    {service.category}
                  </span>
                </div>

                <h3 className="font-poppins font-bold text-darkNavy text-lg group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-slateText text-xs leading-relaxed">
                  {service.desc}
                </p>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Key Features</span>
                  {service.highlights.slice(0, 2).map((h, i) => (
                    <p key={i} className="text-slate-700 font-medium flex items-center gap-1.5 text-[11px]">
                      <span className="text-emerald-500 font-bold">✓</span> {h}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="block text-[11px] font-bold text-slate-500">
                  🕒 {service.timings}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-darkNavy text-xs font-bold py-2.5 rounded-xl transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setIsAppointmentModalOpen(true)}
                    className="flex-1 bg-primary hover:bg-primaryDark text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-primaryLight text-primary text-3xl flex items-center justify-center">
                {selectedService.icon}
              </div>
              <div>
                <h3 className="font-poppins font-bold text-lg text-darkNavy">{selectedService.name}</h3>
                <p className="text-xs text-primary font-bold">🕒 {selectedService.timings}</p>
              </div>
            </div>

            <p className="text-xs text-slateText leading-relaxed">
              {selectedService.desc}
            </p>

            <div className="p-4 bg-softBg rounded-2xl border border-slate-200/80 text-xs space-y-2 text-darkNavy">
              <p className="font-bold text-xs text-primary">✨ Comprehensive Highlights & Features:</p>
              {selectedService.highlights.map((item, index) => (
                <p key={index} className="flex items-center gap-2 text-slate-700">
                  <span className="text-emerald-500 font-bold">✓</span> {item}
                </p>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slateText hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedService(null);
                  setIsAppointmentModalOpen(true);
                }}
                className="px-5 py-2.5 text-xs font-bold bg-primary text-white hover:bg-primaryDark rounded-xl shadow"
              >
                Book Service Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
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
