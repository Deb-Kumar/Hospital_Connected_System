import React from 'react';

export default function AboutUs() {
  return (
    <section id="about" className="py-20 bg-softBg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-cardHover border-4 border-white bg-white p-2">
              <div className="bg-gradient-to-br from-primary to-darkNavy rounded-2xl p-8 text-white space-y-6">
                <span className="bg-emerald-400 text-darkNavy font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Established Excellence
                </span>
                
                <h3 className="font-poppins font-extrabold text-2xl sm:text-3xl leading-snug">
                  Caring for Your Health, Every Step of the Way
                </h3>

                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                  Brainware Medical College & Hospital stands as a beacon of clinical distinction, medical education, and patient care in Kolkata and West Bengal. Built on a foundation of compassionate healing and state-of-the-art diagnostic innovation.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <h4 className="font-poppins font-bold text-2xl text-yellow-300">20+ Years</h4>
                    <p className="text-[11px] text-blue-100">Medical Excellence</p>
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-2xl text-emerald-300">NABH & NABL</h4>
                    <p className="text-[11px] text-blue-100">National Accreditation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accreditations Badge Floating (Visible on SM screens and above) */}
            <div className="hidden sm:flex absolute -bottom-6 -right-2 sm:-right-4 bg-white p-3.5 sm:p-4 rounded-2xl shadow-card border border-slate-100 items-center gap-3">
              <div className="text-2xl sm:text-3xl">🏅</div>
              <div>
                <p className="font-poppins font-bold text-xs text-darkNavy">ISO 9001:2015 Certified</p>
                <p className="text-[10px] text-slateText">Global Healthcare Quality Standard</p>
              </div>
            </div>
          </div>

          {/* Right Column: Text & Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full">
                About Brainware Hospital
              </span>
              <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
                Dedicated to Affordable, World-Class Healthcare
              </h2>
              <p className="text-slateText text-sm mt-3 leading-relaxed">
                Our institution combines super-specialty medical treatment with academic research and community health outreach. We empower patients through transparent care pathways, digital medical records, and expert multi-disciplinary tumor & cardiac boards.
              </p>
            </div>

            {/* Mission & Vision Tabs */}
            <div className="space-y-4 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primaryLight text-primary flex items-center justify-center font-bold text-xl flex-shrink-0">
                  🎯
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-darkNavy text-sm">Our Mission</h4>
                  <p className="text-slateText text-xs mt-1">
                    To deliver compassionate, ethically grounded, and affordable medical interventions using modern technological standards.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondaryLight text-secondaryDark flex items-center justify-center font-bold text-xl flex-shrink-0">
                  👁️
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-darkNavy text-sm">Our Vision</h4>
                  <p className="text-slateText text-xs mt-1">
                    To be recognized globally as a premier medical center for patient outcomes, medical education, and preventive care innovation.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
