import React, { useState } from 'react';

export default function WhyChooseUs() {
  const [showAll, setShowAll] = useState(false);

  const reasons = [
    { icon: '👨‍⚕️', title: 'Experienced Doctors', desc: '100+ senior consultants & surgeons with international fellowships.' },
    { icon: '🔬', title: 'Advanced Medical Tech', desc: '3T MRI, 128-Slice CT Scan, Robotic Surgery, and Cath Labs.' },
    { icon: '🚨', title: '24×7 Emergency Support', desc: 'Immediate trauma resuscitation, Mobile ICU, and cardiac ER.' },
    { icon: '🏥', title: 'Modern Infrastructure', desc: '500+ beds, modular operation theatres, and infection-controlled ICUs.' },
    { icon: '❤️', title: 'Patient-Centered Care', desc: 'Empathetic nursing, personal care managers, and transparent billing.' },
    { icon: '✨', title: 'Hygienic & Safe', desc: 'HEPA filtered air, continuous sterilization, and strict infection control.' },
    { icon: '💻', title: 'Online Appointment Booking', desc: 'Book doctor slots instantly from web or mobile app in under 60 seconds.' },
    { icon: '📑', title: 'Digital Medical Records', desc: 'Secure cloud access to lab test reports, prescriptions, and visit logs.' },
    { icon: '💰', title: 'Affordable Healthcare', desc: 'Transparent package prices, government health schemes, & insurance desks.' },
    { icon: '🩺', title: 'Specialized Treatment', desc: 'Dedicated multi-specialty centers for heart, brain, cancer, & joints.' },
    { icon: '🧪', title: 'Quick Diagnostic Services', desc: 'Rapid lab testing with digital reporting sent via SMS & patient portal.' },
    { icon: '🤝', title: 'Dedicated Patient Support', desc: 'Multilingual assistance desk to support patients and family members.' },
  ];

  const visibleReasons = showAll ? reasons : reasons.slice(0, 8);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Right-Aligned Show More Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-secondary font-bold text-xs uppercase tracking-widest bg-secondaryLight/50 px-3.5 py-1 rounded-full border border-secondary/20">
              Why Patients Trust Us
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
              Why Choose Brainware Medical College & Hospital?
            </h2>
            <p className="text-slateText text-sm mt-2 max-w-xl">
              We are committed to delivering clinical excellence with warmth, safety, and modern technological convenience.
            </p>
          </div>

          <button
            onClick={() => setShowAll(!showAll)}
            className="sm:self-end inline-flex items-center gap-2 bg-primary hover:bg-primaryDark text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-md hover:shadow-lg group shrink-0 active:scale-95"
          >
            <span>{showAll ? 'Show Less' : 'Show More Reasons'}</span>
            <span className="group-hover:translate-x-1 transition-transform">
              {showAll ? '↑' : '→'}
            </span>
          </button>
        </div>

        {/* Reason Cards Grid (8 initially, 12 when expanded) */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleReasons.map((item, idx) => (
            <div
              key={idx}
              className="bg-softBg rounded-2xl p-6 border border-slate-100 hover:border-primary/30 shadow-sm hover:shadow-cardHover transition duration-300 group animate-fadeIn"
            >
              <div className="w-12 h-12 rounded-xl bg-white text-primary text-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary group-hover:text-white transition duration-300">
                {item.icon}
              </div>
              <h3 className="font-poppins font-bold text-darkNavy text-base mb-1 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-slateText text-xs leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
