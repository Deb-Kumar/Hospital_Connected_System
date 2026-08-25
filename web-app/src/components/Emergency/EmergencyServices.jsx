import React, { useState } from 'react';

export default function EmergencyServices({ onOpenEmergencyModal }) {
  const emergencyFeatures = [
    { icon: '🚨', title: '24×7 Emergency Care', desc: 'Round-the-clock emergency room staffed with senior trauma specialists and triage nurses.' },
    { icon: '🚑', title: 'GPS Ambulance Fleet', desc: 'Advanced Life Support (ALS) & Mobile ICU ambulances dispatched instantly across Kolkata & Barasat.' },
    { icon: '🏥', title: 'Level-1 Trauma Unit', desc: 'Dedicated surgical suites equipped for accidental, cardiac, burn, and neuro trauma cases.' },
    { icon: '🫀', title: 'Critical Care (ICU/CCU)', desc: 'Ultra-modern ventilator units, central cardiac monitoring, and 1:1 patient nursing ratio.' },
    { icon: '👨‍⚕️', title: 'On-Duty Emergency Docs', desc: 'Senior ER consultants, Anesthetists, and Cardiac Surgeons available on floor continuously.' },
    { icon: '🩸', title: '24x7 Blood & Lab', desc: 'Instant cross-matching, component blood bank, and emergency statutory lab reporting within 20 mins.' },
  ];

  return (
    <section id="emergency" className="py-16 bg-gradient-to-b from-emergency/5 via-white to-softBg border-y border-emergency/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Alert */}
        <div className="bg-gradient-to-r from-emergencyDark via-emergency to-red-600 rounded-3xl p-6 sm:p-10 text-white shadow-glow relative overflow-hidden mb-12">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="grid md:grid-cols-12 gap-6 items-center relative z-10">
            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-yellow-300">
                ⚡ Medical Emergency? We Are Available 24×7
              </div>
              <h2 className="font-poppins font-extrabold text-2xl sm:text-4xl leading-tight">
                Immediate Critical Support When Every Second Counts
              </h2>
              <p className="text-red-100 text-sm sm:text-base max-w-xl">
                Call our dedicated Emergency Response Desk directly or request an instant GPS ambulance dispatch to your home location.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-end">
              <a
                href="tel:108"
                className="w-full bg-white hover:bg-yellow-300 text-emergency font-poppins font-extrabold text-center py-3.5 px-6 rounded-xl shadow transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
              >
                📞 CALL AMBULANCE: 108
              </a>
              <button
                onClick={onOpenEmergencyModal}
                className="w-full bg-black/30 hover:bg-black/40 text-white font-poppins font-semibold text-center py-3.5 px-6 rounded-xl border border-white/30 backdrop-blur-md transition text-sm flex items-center justify-center gap-2"
              >
                🚨 Get Emergency Help Desk
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="text-center mb-8">
          <h3 className="font-poppins font-bold text-2xl text-darkNavy">
            Comprehensive Emergency Infrastructure
          </h3>
          <p className="text-slateText text-sm mt-1 max-w-xl mx-auto">
            Brainware Medical College & Hospital maintains full emergency readiness to manage complex medical situations.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyFeatures.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-cardHover border border-slate-100 transition duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emergencyLight text-emergency text-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="font-poppins font-bold text-darkNavy text-lg mb-2">{item.title}</h4>
                <p className="text-slateText text-xs leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emergency font-semibold">
                <span>Active 24x7</span>
                <span className="group-hover:translate-x-1 transition-transform">Emergency Ready →</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
