import React from 'react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Siddharth Roy',
      treatment: 'Angioplasty & Cardiac ICU',
      rating: 5,
      date: 'June 2026',
      review: 'The doctors and hospital staff at Brainware Medical College & Hospital were very professional and supportive. The emergency response for my cardiac procedure was instantaneous and saving.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Priyanka Das',
      treatment: 'Maternity & Pediatric Care',
      rating: 5,
      date: 'May 2026',
      review: 'The gynecology & NICU department treated us like family. From online booking to final discharge, every process was transparent, hygienic, and extremely well-managed.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Amitava Chaudhuri',
      treatment: 'Total Knee Replacement',
      rating: 5,
      date: 'July 2026',
      review: 'Dr. Mukherjee performed my knee surgery with utmost skill. Within 3 days I was walking with physiotherapy support. Excellent nursing care and clean private rooms.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    },
  ];

  return (
    <section className="py-20 bg-softBg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-secondary font-bold text-xs uppercase tracking-widest bg-secondaryLight/50 px-3 py-1 rounded-full">
            Patient Stories & Reviews
          </span>
          <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
            What Our Patients Say
          </h2>
          <p className="text-slateText text-sm mt-2">
            Real stories from patients and family members who experienced healing at Brainware Hospital.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 shadow-card hover:shadow-cardHover border border-slate-100 transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400 text-base">
                  {'⭐'.repeat(rev.rating)}
                </div>

                <p className="text-slateText text-xs italic leading-relaxed">
                  "{rev.review}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h4 className="font-poppins font-bold text-darkNavy text-sm">{rev.name}</h4>
                  <p className="text-[11px] text-primary font-semibold">{rev.treatment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
