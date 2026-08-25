import React from 'react';

export default function Statistics() {
  const stats = [
    { label: 'Years of Healthcare Experience', value: '20+', icon: '🏥' },
    { label: 'Experienced Specialist Doctors', value: '100+', icon: '👨‍⚕️' },
    { label: 'Happy Patients Served', value: '50,000+', icon: '😊' },
    { label: 'Super-Specialty Departments', value: '25+', icon: '🩺' },
    { label: 'Hospital Beds Capacity', value: '500+', icon: '🛏️' },
    { label: 'Successful Major Surgeries', value: '10,000+', icon: '🔪' },
    { label: '24×7 Emergency Care Units', value: '100%', icon: '🚨' },
    { label: 'Advanced Diagnostic Facilities', value: '15+', icon: '🔬' },
  ];

  return (
    <section className="py-16 bg-[#172033] text-white relative overflow-hidden" style={{ backgroundColor: '#172033' }}>
      {/* Glow Effect */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-950/80 border border-emerald-800 px-3.5 py-1 rounded-full">
            Impact in Numbers
          </span>
          <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white mt-3">
            Our Healthcare Statistics
          </h2>
        </div>

        {/* 8 Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((st, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center hover:bg-white/10 transition duration-300 transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">{st.icon}</div>
              <h3 className="font-poppins font-extrabold text-3xl sm:text-4xl text-yellow-400 mb-1">
                {st.value}
              </h3>
              <p className="text-slate-300 text-xs font-medium leading-snug">
                {st.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
