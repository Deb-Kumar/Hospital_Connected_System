import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HospitalServices() {
  const [selectedService, setSelectedService] = useState(null);

  const servicesList = [
    { icon: '🩺', name: 'Outpatient Department (OPD)', timings: 'Mon-Sat (8:00 AM - 8:00 PM)', desc: 'Consultations across 25+ medical specialties with senior doctors, diagnostic ordering, and follow-ups.' },
    { icon: '🛏️', name: 'Inpatient Department (IPD)', timings: '24×7 Admission Care', desc: 'Spacious private rooms, semi-private wards, and round-the-clock nursing for medical and surgical stays.' },
    { icon: '🚨', name: 'Emergency & Trauma Care', timings: '24×7 Round-the-Clock', desc: 'Level-1 emergency unit for polytrauma, cardiac arrests, stroke management, and acute burns.' },
    { icon: '🫁', name: 'Intensive Care Unit (ICU/CCU)', timings: '24×7 Monitoring', desc: 'Ultra-modern ventilator units, invasive arterial monitoring, and dedicated 1:1 patient care nurses.' },
    { icon: '🔪', name: 'Advanced Operation Theatre', timings: 'Scheduled & Emergency', desc: 'Ultra-clean laminar airflow surgical suites equipped for laparoscopic, orthopedic, and neurosurgeries.' },
    { icon: '🧪', name: 'Diagnostic Laboratory', timings: '24×7 Sampling & Testing', desc: 'NABL accredited automated biochemistry, hematology, microbiology, and molecular pathology lab.' },
    { icon: '🩻', name: 'Digital X-Ray & Imaging', timings: '24×7 Service Available', desc: 'High-resolution low-radiation digital radiography for quick skeletal and chest diagnostics.' },
    { icon: '🧠', name: '128-Slice CT & 3T MRI Scan', timings: '24×7 Fast Scanning', desc: 'State-of-the-art neuro, cardiac, and body MRI/CT imaging with instant digital radiologist reports.' },
    { icon: '🔊', name: '3D/4D Color Ultrasound', timings: 'Mon-Sat (8:00 AM - 6:00 PM)', desc: 'High-end Doppler ultrasound for obstetrics, abdominal, vascular, and soft tissue assessments.' },
    { icon: '💊', name: '24×7 In-House Pharmacy', timings: '24×7 Open Continuous', desc: '100% genuine prescribed medicines, surgical consumables, and refrigerated biological storage.' },
    { icon: '🩸', name: 'Blood Bank & Components', timings: '24×7 Availability', desc: 'Licensed blood bank providing whole blood, packed red cells, fresh frozen plasma, and platelets.' },
    { icon: '🚑', name: 'ALS & Mobile ICU Ambulance', timings: '24×7 Dispatch Hotline', desc: 'GPS-tracked emergency ambulances equipped with ventilators, defibrillators, & paramedic staff.' },
    { icon: '🏃‍♂️', name: 'Physiotherapy & Rehab', timings: 'Mon-Sat (9:00 AM - 5:00 PM)', desc: 'Post-operative rehabilitation, stroke recovery therapy, sports injury management, & pain relief.' },
    { icon: '📋', name: 'Preventive Health Checkups', timings: 'Mon-Sat (7:30 AM - 2:00 PM)', desc: 'Customized wellness checkup packages for individuals, families, and corporate employees.' },
  ];

  return (
    <section id="services" className="py-20 bg-softBg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Right-Aligned Show More Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3.5 py-1 rounded-full border border-primary/20">
              Comprehensive Clinical Facilities
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy">
              Major Hospital Services
            </h2>
            <p className="text-slateText text-sm max-w-2xl leading-relaxed">
              Providing end-to-end diagnostic, therapeutic, emergency, and surgical care.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primaryDark text-white font-poppins font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs hover:shadow-cardHover transition transform hover:scale-105 whitespace-nowrap"
            >
              <span>Show More Services</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Services Grid - Only 4 displayed on home page */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesList.slice(0, 4).map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-cardHover border border-slate-100 transition duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primaryLight text-primary text-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="font-poppins font-bold text-darkNavy text-base mb-2 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-slateText text-xs leading-relaxed mb-3">
                  {service.desc}
                </p>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-slateText mb-3">
                  🕒 {service.timings}
                </span>
                <button
                  onClick={() => setSelectedService(service)}
                  className="w-full bg-softBg hover:bg-primary hover:text-white text-darkNavy border border-slate-200 text-xs font-semibold py-2 rounded-xl transition"
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primaryLight text-primary text-3xl flex items-center justify-center">
                {selectedService.icon}
              </div>
              <div>
                <h3 className="font-poppins font-bold text-lg text-darkNavy">{selectedService.name}</h3>
                <p className="text-xs text-primary font-medium">🕒 {selectedService.timings}</p>
              </div>
            </div>

            <p className="text-xs text-slateText leading-relaxed">
              {selectedService.desc}
            </p>

            <div className="p-3.5 bg-softBg rounded-xl text-xs space-y-1 text-darkNavy">
              <p className="font-bold">✨ Key Service Highlights:</p>
              <p>• 24x7 Duty doctor & support team available on floor.</p>
              <p>• Digital diagnostic report sync with patient portal.</p>
              <p>• Cashless insurance desk support for eligible procedures.</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 text-xs font-semibold text-slateText hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <a
                href="#booking"
                onClick={() => setSelectedService(null)}
                className="px-5 py-2 text-xs font-semibold bg-primary text-white hover:bg-primaryDark rounded-xl shadow"
              >
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
