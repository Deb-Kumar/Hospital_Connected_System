import React, { useState } from 'react';

export default function Facilities() {
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const facilitiesList = [
    { icon: '🛋️', title: 'Modern Patient Suite', desc: 'Air-conditioned deluxe private suites with motorized beds, attendant couch, & SMART TV.', cat: 'Comfort' },
    { icon: '🛏️', title: 'Private & Semi-Private Wards', desc: 'Hygienic, comfortable ward options with 24/7 dedicated nursing staff call buttons.', cat: 'Comfort' },
    { icon: '🫁', title: 'Super-Specialty ICU & CCU', desc: 'Infection-controlled critical care beds with central cardiac monitoring & ventilators.', cat: 'Clinical' },
    { icon: '🔪', title: 'Modular Operation Theatres', desc: 'Laminar airflow HEPA filtered surgical suites with HD laparoscopic & robotic systems.', cat: 'Clinical' },
    { icon: '🔬', title: 'Digital Diagnostic Centre', desc: 'Automated pathology lab, 3T MRI, 128-slice CT scan, and digital X-ray suites.', cat: 'Diagnostic' },
    { icon: '💊', title: '24×7 In-House Pharmacy', desc: 'Comprehensive stock of critical emergency medications, vaccines, and surgical supplies.', cat: 'Emergency' },
    { icon: '🩸', title: 'Component Blood Bank', desc: 'Licensed blood bank facility equipped for whole blood, plasma, & apheresis platelets.', cat: 'Emergency' },
    { icon: '☕', title: 'Hygienic Hospital Cafeteria', desc: 'Nutritious meals curated by clinical dietitians for patients and visitors.', cat: 'Comfort' },
    { icon: '🏬', title: 'Patient Waiting Lounge', desc: 'Spacious air-conditioned waiting areas with digital token display screens.', cat: 'Comfort' },
    { icon: '📶', title: 'Free High-Speed Wi-Fi', desc: 'Seamless wireless connectivity throughout hospital wards and consultation floors.', cat: 'Comfort' },
    { icon: '♿', title: '100% Wheelchair Accessible', desc: 'Ramps, tactile flooring, wide elevators, and dedicated assistant porters.', cat: 'Comfort' },
    { icon: '🅿️', title: 'Covered Multi-Level Parking', desc: 'Secure parking facility for 300+ vehicles with 24x7 CCTV surveillance.', cat: 'Comfort' },
    { icon: '🚑', title: '24×7 ALS Ambulance Service', desc: 'Fully equipped Mobile ICUs with paramedic staff for rapid patient transport.', cat: 'Emergency' },
    { icon: '💳', title: 'Cashless Insurance Desk', desc: 'On-site helpdesk to process TPA pre-authorization & cashless hospital bills.', cat: 'Comfort' },
  ];

  // Filter facilities by active category if selected
  const filteredList = activeCategory === 'All'
    ? facilitiesList
    : facilitiesList.filter(f => f.cat === activeCategory);

  // Show only 8 items initially unless showAll is true or category is filtered
  const visibleFacilities = (showAll || activeCategory !== 'All')
    ? filteredList
    : filteredList.slice(0, 8);

  return (
    <section id="facilities" className="py-20 bg-softBg border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Right Side Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl text-left">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest bg-secondaryLight/50 px-3 py-1 rounded-full border border-secondary/20">
              World-Class Infrastructure
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
              Hospital Facilities & Patient Amenities
            </h2>
            <p className="text-slateText text-sm mt-2">
              Designed for optimal patient comfort, clinical precision, safety, and seamless visitor experience.
            </p>
          </div>

          {/* Right Side Options & Expand Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => {
                setActiveCategory('All');
                setShowAll(!showAll);
              }}
              className="bg-primary hover:bg-primaryDark text-white text-xs font-poppins font-bold px-5 py-3 rounded-xl shadow-glow transition flex items-center gap-2"
            >
              {showAll ? 'Show Less ↑' : 'View All Facilities →'}
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200/80 pb-4">
          <span className="text-xs font-semibold text-slateText mr-2">Filter Category:</span>
          {['All', 'Clinical', 'Comfort', 'Emergency', 'Diagnostic'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition border ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary shadow-sm font-bold'
                  : 'bg-white text-darkNavy hover:bg-slate-100 border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Facilities Grid (Shows 8 cards initially) */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleFacilities.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-cardHover border border-slate-100 transition duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-secondaryLight/50 text-secondaryDark text-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition duration-300">
                {fac.icon}
              </div>
              <h3 className="font-poppins font-bold text-darkNavy text-base mb-1.5 group-hover:text-secondaryDark transition-colors">
                {fac.title}
              </h3>
              <p className="text-slateText text-xs leading-relaxed">
                {fac.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Show Less Button when expanded */}
        {showAll && (
          <div className="text-center pt-10">
            <button
              onClick={() => {
                setShowAll(false);
                const section = document.getElementById('facilities');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white hover:bg-slate-50 text-primary border border-primary/30 hover:border-primary px-8 py-3 rounded-xl text-xs font-poppins font-bold shadow-sm transition inline-flex items-center gap-2"
            >
              Show Less ↑
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
