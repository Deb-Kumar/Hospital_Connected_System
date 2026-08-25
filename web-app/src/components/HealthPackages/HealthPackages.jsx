import React, { useState } from 'react';

export default function HealthPackages({ onSelectPackage }) {
  const [selectedPkg, setSelectedPkg] = useState(null);

  const packagesList = [
    {
      id: 'pkg-1',
      title: 'Basic Health Screening',
      category: 'General Preventive',
      badge: 'POPULAR',
      testsCount: '35+ Tests Included',
      tests: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar', 'Lipid Profile (Basic)', 'Kidney Function Test (KFT)', 'Urine Routine & Microscopic', 'Doctor OPD Consultation'],
      originalPrice: 1999,
      discountPrice: 799,
      discountPercent: '60% OFF',
      icon: '🩺',
    },
    {
      id: 'pkg-2',
      title: 'Full Body Comprehensive Checkup',
      category: 'Full Body Wellness',
      badge: 'BEST VALUE',
      testsCount: '75+ Tests Included',
      tests: ['CBC & ESR', 'HbA1c & Fasting Glucose', 'Comprehensive LFT & KFT', 'Lipid Profile Extra', 'Thyroid Profile (T3, T4, TSH)', 'Vitamin D3 & B12 Level', 'ECG & Chest X-Ray', 'Senior Physician Consultation'],
      originalPrice: 4999,
      discountPrice: 1899,
      discountPercent: '62% OFF',
      icon: '🏋️‍♂️',
    },
    {
      id: 'pkg-3',
      title: 'Advanced Heart Care Package',
      category: 'Cardiac Wellness',
      badge: 'SPECIALTY',
      testsCount: '45+ Cardiac Parameters',
      tests: ['High-Sensitivity Troponin I', 'Lipid Fractionation Profile', 'High-Resolution 12-Lead ECG', 'TREADMILL TEST (TMT)', '2D Echo with Doppler', 'Cardiologist OPD Consultation'],
      originalPrice: 5999,
      discountPrice: 2499,
      discountPercent: '58% OFF',
      icon: '🫀',
    },
    {
      id: 'pkg-4',
      title: 'Diabetes Screening & Management',
      category: 'Metabolic Care',
      badge: 'CHRONIC CARE',
      testsCount: '40+ Metabolic Tests',
      tests: ['HbA1c (Glycated Hemoglobin)', 'Fasting & Post-Prandial Blood Sugar', 'Microalbuminuria Test', 'Comprehensive Renal Function', 'Fundus Retinal Eye Exam', 'Endocrinologist Consultation'],
      originalPrice: 2999,
      discountPrice: 1199,
      discountPercent: '60% OFF',
      icon: '🩸',
    },
    {
      id: 'pkg-5',
      title: 'Women’s Wellness Package',
      category: 'Women Health',
      badge: 'RECOMMENDED',
      testsCount: '55+ Women Specific Tests',
      tests: ['Complete Hemogram', 'Pap Smear Cytology', 'Ultrasound Pelvis/Abdomen', 'Mammography / Breast Screen', 'Thyroid & Iron Studies', 'Gynecologist OPD Consultation'],
      originalPrice: 4499,
      discountPrice: 1799,
      discountPercent: '60% OFF',
      icon: '🤰',
    },
    {
      id: 'pkg-6',
      title: 'Senior Citizen Care Package',
      category: 'Elderly Health',
      badge: 'GERIATRIC',
      testsCount: '65+ Comprehensive Parameters',
      tests: ['Complete Metabolic Panel', 'Bone Mineral Density Scan', 'Prostate / Mammogram Screen', 'Cardiac Risk Profile (ECG)', 'Audiometry & Eye Screening', 'Geriatrician Consultation'],
      originalPrice: 5499,
      discountPrice: 2199,
      discountPercent: '60% OFF',
      icon: '👴',
    },
  ];

  return (
    <section id="packages" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-accent font-bold text-xs uppercase tracking-widest bg-accentLight px-3 py-1 rounded-full">
            Preventive Healthcare
          </span>
          <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
            Preventive Health Checkup Packages
          </h2>
          <p className="text-slateText text-sm mt-2">
            Early detection saves lives. Choose from our discounted, NABL-certified laboratory health packages.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {packagesList.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-softBg rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-cardHover transition duration-300 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-primary text-white font-poppins font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow-sm">
                {pkg.badge}
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-white text-primary text-3xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  {pkg.icon}
                </div>
                <p className="text-[11px] font-bold text-slateText uppercase tracking-wider">{pkg.category}</p>
                <h3 className="font-poppins font-bold text-darkNavy text-xl mt-1 mb-2 group-hover:text-primary transition-colors">
                  {pkg.title}
                </h3>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-4">
                  ✓ {pkg.testsCount}
                </span>

                {/* Tests Checklist Preview */}
                <ul className="space-y-2 text-xs text-slateText mb-6">
                  {pkg.tests.slice(0, 5).map((test, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{test}</span>
                    </li>
                  ))}
                  {pkg.tests.length > 5 && (
                    <li className="text-[11px] text-primary font-semibold pt-1">
                      + {pkg.tests.length - 5} more tests & doctor consultation
                    </li>
                  )}
                </ul>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-xs text-gray-400 line-through mr-2">₹{pkg.originalPrice}</span>
                    <span className="font-poppins font-extrabold text-2xl text-darkNavy">₹{pkg.discountPrice}</span>
                  </div>
                  <span className="bg-red-100 text-red-700 font-bold text-xs px-2.5 py-1 rounded-full">
                    {pkg.discountPercent}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedPkg(pkg)}
                  className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-poppins font-bold text-xs shadow transition transform active:scale-95"
                >
                  Book Package Now
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Package Detail Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedPkg(null)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-12 h-12 rounded-xl bg-primaryLight text-primary text-3xl flex items-center justify-center">
                {selectedPkg.icon}
              </div>
              <div>
                <h3 className="font-poppins font-bold text-xl text-darkNavy">{selectedPkg.title}</h3>
                <p className="text-xs text-emerald-600 font-bold">₹{selectedPkg.discountPrice} ({selectedPkg.discountPercent})</p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs pr-2">
              <h4 className="font-bold text-darkNavy uppercase">Complete List of Included Medical Tests:</h4>
              <ul className="space-y-1.5 text-slateText">
                {selectedPkg.tests.map((t, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-softBg p-2 rounded-lg">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs space-y-1">
              <p className="font-bold">📍 Includes Complimentary Services:</p>
              <p>• Free Home Sample Collection in Kolkata & Barasat area.</p>
              <p>• Digital diagnostic report available on patient portal within 12 hours.</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPkg(null)}
                className="px-4 py-2 text-xs font-semibold text-slateText hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const p = selectedPkg;
                  setSelectedPkg(null);
                  if (onSelectPackage) onSelectPackage(p);
                }}
                className="px-6 py-2.5 text-xs font-bold bg-primary text-white hover:bg-primaryDark rounded-xl shadow"
              >
                Confirm Package Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
