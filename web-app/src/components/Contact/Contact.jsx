import React from 'react';

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full">
            Get in Touch
          </span>
          <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
            Contact Us & Location Map
          </h2>
          <p className="text-slateText text-sm mt-2">
            Our healthcare team is available 24x7 to assist you with appointments, emergency admission, and medical queries.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Information Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-softBg p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center text-xl flex-shrink-0">
                📍
              </div>
              <div>
                <h4 className="font-poppins font-bold text-darkNavy text-sm">Hospital Address</h4>
                <p className="text-xs text-slateText mt-1 leading-relaxed">
                  Brainware Medical College & Hospital <br />
                  398, Ramkrishnapur Rd, Near Jagadighata Market, Barasat, Kolkata, West Bengal 700125
                </p>
              </div>
            </div>

            <div className="bg-emergencyLight p-5 rounded-2xl border border-emergency/20 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emergency text-white flex items-center justify-center text-xl flex-shrink-0">
                🚨
              </div>
              <div>
                <h4 className="font-poppins font-bold text-emergency text-sm">24×7 Emergency Hotline</h4>
                <p className="text-xs text-slateText mt-1">
                  Ambulance Dispatch: <strong className="text-emergency">108</strong> <br />
                  Emergency ER Desk: <strong className="text-darkNavy">+91 98765 43210</strong>
                </p>
              </div>
            </div>

            <div className="bg-softBg p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-secondary text-white flex items-center justify-center text-xl flex-shrink-0">
                📞
              </div>
              <div>
                <h4 className="font-poppins font-bold text-darkNavy text-sm">Reception & OPD Enquiries</h4>
                <p className="text-xs text-slateText mt-1">
                  Landline: +91 33 2584 1000 / 1001 <br />
                  OPD Desk: +91 98765 43211
                </p>
              </div>
            </div>

            <div className="bg-softBg p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center text-xl flex-shrink-0">
                🕒
              </div>
              <div>
                <h4 className="font-poppins font-bold text-darkNavy text-sm">Working Hours</h4>
                <p className="text-xs text-slateText mt-1">
                  OPD Consultations: Mon - Sat (8:00 AM - 8:00 PM) <br />
                  Emergency & ICU: 24 Hours, 365 Days
                </p>
              </div>
            </div>

          </div>

          {/* Interactive Map Visual Representation */}
          <div className="lg:col-span-7">
            <div className="bg-softBg rounded-3xl overflow-hidden border border-slate-200 shadow-card p-2 relative h-[420px]">
              <iframe
                title="Brainware Hospital Google Map Location"
                src="https://maps.google.com/maps?q=Brainware%20University%20Barasat&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full rounded-2xl border-0"
                loading="lazy"
              ></iframe>
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-darkNavy shadow-md border border-slate-200">
                🚗 Free Multi-Level Covered Parking Available
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
