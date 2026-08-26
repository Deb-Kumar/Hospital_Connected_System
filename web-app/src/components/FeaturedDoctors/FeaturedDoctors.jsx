import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function formatSingleTime12H(timeStr) {
  if (!timeStr) return '';
  const str = timeStr.trim();
  if (/am|pm/i.test(str)) return str;

  const parts = str.split(':');
  if (parts.length < 2) return str;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].substring(0, 2);
  if (isNaN(hours)) return str;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours < 10 ? `0${hours}` : hours;

  return `${formattedHours}:${minutes} ${ampm}`;
}

function formatTimeRange12H(rangeStr) {
  if (!rangeStr) return '09:00 AM - 01:00 PM';
  if (rangeStr.includes('-')) {
    const [fromTime, toTime] = rangeStr.split('-').map((s) => s.trim());
    return `${formatSingleTime12H(fromTime)} - ${formatSingleTime12H(toTime)}`;
  }
  return formatSingleTime12H(rangeStr);
}

function getDoctorScheduleFromDb(doc) {
  if (!doc) return [];
  if (doc.availabilitySchedule && typeof doc.availabilitySchedule === 'string' && doc.availabilitySchedule.trim()) {
    const items = doc.availabilitySchedule.split(',').map((s) => s.trim()).filter(Boolean);
    if (items.length > 0) {
      return items.map((item) => {
        const colonIdx = item.indexOf(':');
        if (colonIdx !== -1) {
          const day = item.substring(0, colonIdx).trim().toUpperCase();
          const rawTime = item.substring(colonIdx + 1).trim();
          return {
            day,
            time: formatTimeRange12H(rawTime),
          };
        }
        return { day: 'OPD', time: formatTimeRange12H(item) };
      });
    }
  }

  if (Array.isArray(doc.availableDays) && doc.availableDays.length > 0) {
    const fromTime = formatSingleTime12H(doc.availableFrom || '09:00');
    const toTime = formatSingleTime12H(doc.availableTo || '13:00');
    const formattedTime = `${fromTime} - ${toTime}`;
    return doc.availableDays.map((day) => ({
      day: String(day).toUpperCase(),
      time: formattedTime,
    }));
  }

  return [
    { day: 'MON', time: '09:00 AM - 01:00 PM' },
    { day: 'WED', time: '09:00 AM - 01:00 PM' },
    { day: 'FRI', time: '09:00 AM - 01:00 PM' },
  ];
}

const defaultDoctorPhotos = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1594824813572-c5112f10b777?auto=format&fit=crop&q=80&w=600',
];

function getDoctorAvatarUrl(doc) {
  if (!doc) return defaultDoctorPhotos[0];
  let photo = doc.avatarUrl || doc.profileImage || doc.photoUrl || (doc.user && (doc.user.avatarUrl || doc.user.profileImage || doc.user.avatar || doc.user.photoUrl));
  if (photo) {
    if (photo.startsWith('/uploads/')) {
      return `http://localhost:5000${photo}`;
    }
    return photo;
  }

  const rawName = (doc.user?.fullName || doc.fullName || '').toLowerCase();
  const isFemale = rawName.includes('ananya') || rawName.includes('meera') || rawName.includes('priya') || rawName.includes('sunita') || rawName.includes('roy') || rawName.includes('banerjee') || rawName.includes('female');

  if (isFemale) return defaultDoctorPhotos[1];
  return defaultDoctorPhotos[0];
}

export default function FeaturedDoctors({ doctors = [], onSelectDoctor }) {
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(null);

  // Maintain exactly 4 slots in grid layout (Database Doctors first, Empty Slots for remaining)
  const displaySlots = Array.from({ length: 4 }, (_, idx) => doctors[idx] || null);

  return (
    <section id="doctors" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-secondary font-bold text-xs uppercase tracking-widest bg-secondaryLight/50 px-3.5 py-1 rounded-full border border-secondary/20">
              Renowned Medical Experts
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
              Find Your Specialist Doctor
            </h2>
            <p className="text-slateText text-sm mt-2 max-w-xl">
              Book consultations with leading senior doctors who bring years of clinical excellence, empathy, and advanced surgical mastery.
            </p>
          </div>

          <Link
            to="/doctors"
            className="sm:self-end inline-flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs group"
          >
            <span>Show More Doctors</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Doctor Cards Grid (Exactly 4 Grid Slots) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displaySlots.map((doc, idx) => {
            if (!doc) {
              // Render Empty Doctor Position Card
              return (
                <div
                  key={`empty-slot-${idx}`}
                  className="bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col justify-between items-center text-center group hover:border-slate-300 transition duration-300 min-h-[380px]"
                >
                  <div className="w-full my-auto space-y-3.5 py-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 text-slate-400 group-hover:text-primary group-hover:border-primary/40 group-hover:scale-105 transition duration-300 flex items-center justify-center text-2xl mx-auto shadow-sm">
                      🩺
                    </div>

                    <div className="space-y-1">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                        Slot Available
                      </span>
                      <h3 className="font-poppins font-bold text-darkNavy text-base pt-1">
                        Specialist Position Available
                      </h3>
                      <p className="text-xs text-slateText max-w-[210px] mx-auto leading-relaxed">
                        Onboarding senior consultants & surgeons for this clinical department.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/contact"
                    className="w-full bg-white hover:bg-slate-100 text-slate-600 hover:text-darkNavy border border-slate-300 text-xs font-semibold py-2.5 rounded-xl transition shadow-2xs inline-flex items-center justify-center gap-1.5"
                  >
                    <span>➕ Join Medical Staff</span>
                  </Link>
                </div>
              );
            }

            const rawName = doc.user?.fullName || doc.fullName || 'Senior Specialist';
            const name = /^dr\.?/i.test(rawName.trim()) ? rawName.trim() : `Dr. ${rawName.trim()}`;
            const spec = doc.specialization || doc.department?.name || 'General Medicine';
            const qual = doc.qualification || 'MBBS, MD';
            const exp = doc.experienceYears || 5;
            const fee = doc.consultationFee || 700;
            const avatar = getDoctorAvatarUrl(doc);

            return (
              <div
                key={doc._id || idx}
                className="bg-softBg rounded-2xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-cardHover transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-darkNavy/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                      <span className="bg-primary/90 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        {spec}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-poppins font-bold text-darkNavy text-lg group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-slateText font-medium">{qual}</p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slateText pt-2 border-t border-slate-200">
                      <div className="pr-1">
                        <span className="block text-[10px] uppercase text-gray-400 font-semibold">Experience</span>
                        <span className="font-semibold text-darkNavy block">{exp}+ Years</span>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <span className="block text-[10px] uppercase text-gray-400 font-semibold">Department</span>
                        <span className="font-semibold text-primary truncate block">{doc.department?.name || spec}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 flex gap-2">
                  <button
                    onClick={() => setSelectedDoctorProfile(doc)}
                    className="w-1/2 bg-white text-darkNavy hover:bg-slate-100 border border-slate-300 text-xs font-semibold py-2.5 rounded-xl transition"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onSelectDoctor(doc)}
                    className="w-1/2 bg-primary hover:bg-primaryDark text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm transition"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctorProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedDoctorProfile(null)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl"
            >
              ✕
            </button>

            <div className="flex gap-4 items-center border-b border-slate-100 pb-4">
              <img
                src={getDoctorAvatarUrl(selectedDoctorProfile)}
                alt={selectedDoctorProfile.user?.fullName || selectedDoctorProfile.fullName}
                className="w-20 h-20 rounded-2xl object-cover shadow border border-slate-200"
              />
              <div>
                <h3 className="font-poppins font-bold text-xl text-darkNavy">
                  {(() => {
                    const raw = selectedDoctorProfile.user?.fullName || selectedDoctorProfile.fullName || 'Senior Specialist';
                    return /^dr\.?/i.test(raw.trim()) ? raw.trim() : `Dr. ${raw.trim()}`;
                  })()}
                </h3>
                <p className="text-xs text-primary font-semibold">{selectedDoctorProfile.specialization || selectedDoctorProfile.department?.name}</p>
                <p className="text-xs text-slateText">{selectedDoctorProfile.qualification}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-softBg p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hospital Department</span>
                <span className="font-bold text-darkNavy block truncate">{selectedDoctorProfile.department?.name || selectedDoctorProfile.specialization}</span>
              </div>
              <div className="bg-softBg p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Clinical Practice</span>
                <span className="font-bold text-darkNavy block">{selectedDoctorProfile.experienceYears || 12}+ Years Experience</span>
              </div>
            </div>

            {/* Doctor Biography & Clinical Overview */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Doctor Biography & Practice Profile
              </span>
              <p className="text-slate-700 leading-relaxed font-normal text-[11px] sm:text-xs">
                {selectedDoctorProfile.bio || selectedDoctorProfile.about || (
                  `Senior Consultant specializing in ${selectedDoctorProfile.specialization || selectedDoctorProfile.department?.name || 'General Medicine'} with ${selectedDoctorProfile.experienceYears || 10}+ years of clinical experience. Committed to advanced diagnostics, evidence-based therapy, and compassionate patient care.`
                )}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-darkNavy uppercase mb-2">Available OPD Days & Timings</h4>
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                {getDoctorScheduleFromDb(selectedDoctorProfile).map((sched, idx) => (
                  <div key={idx} className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-primary w-12 uppercase">{sched.day}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-darkNavy">{sched.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDoctorProfile(null)}
                className="px-4 py-2 text-xs font-semibold text-slateText hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const doc = selectedDoctorProfile;
                  setSelectedDoctorProfile(null);
                  onSelectDoctor(doc);
                }}
                className="px-6 py-2.5 text-xs font-semibold bg-primary text-white hover:bg-primaryDark rounded-xl shadow"
              >
                Confirm Appointment Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
