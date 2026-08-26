import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';
import AppointmentSection from '../components/Appointment/AppointmentSection';
import axiosClient from '../api/axiosClient';

// Helper to convert 24-hour time string ("14:00") to 12-hour format ("02:00 PM")
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

// Helper to dynamically extract OPD schedule from MongoDB Doctor documents
function getDoctorScheduleFromDb(doc) {
  if (!doc) return [];
  // 1. Parse availabilitySchedule string from MongoDB document (e.g. "MON:09:00-13:00,WED:09:00-13:00")
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

  // 2. Parse availableDays array + availableFrom / availableTo
  if (Array.isArray(doc.availableDays) && doc.availableDays.length > 0) {
    const fromTime = formatSingleTime12H(doc.availableFrom || '09:00');
    const toTime = formatSingleTime12H(doc.availableTo || '13:00');
    const formattedTime = `${fromTime} - ${toTime}`;
    return doc.availableDays.map((day) => ({
      day: String(day).toUpperCase(),
      time: formattedTime,
    }));
  }

  // 3. Standard OPD Fallback Schedule
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
  if (doc.profileImage) return doc.profileImage;
  if (doc.avatarUrl) return doc.avatarUrl;
  if (doc.user && doc.user.profileImage) return doc.user.profileImage;
  if (doc.user && doc.user.avatarUrl) return doc.user.avatarUrl;

  const rawName = (doc.user?.fullName || doc.fullName || '').toLowerCase();
  const isFemale = rawName.includes('ananya') || rawName.includes('meera') || rawName.includes('priya') || rawName.includes('sunita') || rawName.includes('roy') || rawName.includes('banerjee') || rawName.includes('female');

  if (isFemale) return defaultDoctorPhotos[1];
  return defaultDoctorPhotos[0];
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [dbDoctors, setDbDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activeFilterPill, setActiveFilterPill] = useState('All');

  // Modal States
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get('/doctor/all'),
      axiosClient.get('/departments'),
    ])
      .then(([docRes, deptRes]) => {
        setDbDoctors(docRes.data || []);
        setDepartments(deptRes.data || []);
      })
      .catch((err) => console.error('Failed to fetch doctors from API:', err))
      .finally(() => setLoading(false));
  }, []);

  // Database doctors directly
  const doctorList = dbDoctors || [];

  // Extract clean department names dynamically from database
  const departmentOptions = (
    departments.length > 0
      ? departments.map((d) => d.name)
      : doctorList.map((d) => d.department?.name || d.specialization)
  )
    .filter(Boolean)
    .filter((val, idx, arr) => arr.indexOf(val) === idx)
    .sort();

  // Filtered Doctors List
  const filteredDoctors = doctorList.filter((doc) => {
    const docName = doc.user?.fullName || doc.fullName || '';
    const docSpec = doc.specialization || '';
    const docQual = doc.qualification || '';
    const docDeptName = doc.department?.name || doc.specialization || '';

    const matchesSearch =
      docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docSpec.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docQual.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docDeptName.toLowerCase().includes(searchTerm.toLowerCase());

    const targetDept = selectedDept.toLowerCase().trim();
    const docDeptLower = docDeptName.toLowerCase().trim();
    const docSpecLower = docSpec.toLowerCase().trim();

    const matchesDept =
      selectedDept === 'ALL' ||
      docDeptLower === targetDept ||
      docDeptLower.includes(targetDept) ||
      targetDept.includes(docDeptLower) ||
      docSpecLower.includes(targetDept) ||
      targetDept.includes(docSpecLower);

    const matchesPill =
      activeFilterPill === 'All' ||
      (activeFilterPill === 'Available Today' && !doc.onLeave) ||
      (activeFilterPill === 'Senior (15+ Yrs)' && (doc.experienceYears || 10) >= 15) ||
      (activeFilterPill === 'Top Rated (4.9+)' && (doc.rating || 4.9) >= 4.9);

    return matchesSearch && matchesDept && matchesPill;
  });

  function handleOpenBookingForDoctor(doc) {
    setBookingDoctor(doc);
    setIsAppointmentModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-softBg font-inter text-darkNavy selection:bg-primary selection:text-white flex flex-col justify-between">
      
      {/* 1. Header & Navigation */}
      <Navbar
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* 2. Page Hero Banner */}
      <div className="bg-gradient-to-r from-darkNavy via-slate-900 to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-sky-300 border border-primary/30 px-3.5 py-1 rounded-full text-xs font-semibold">
            <span>🩺</span> Verified Senior Medical Specialists & Surgeons
          </div>
          
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Our Specialist Doctors Directory
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Consult with leading senior consultants, surgeons, and medical professors bringing years of clinical expertise, empathy, and surgical precision.
          </p>

          {/* Search Bar & Dropdown Filters */}
          <div className="pt-4 space-y-3 max-w-5xl">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search by doctor name or qualification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900/90 transition"
                />
              </div>

              {/* Dynamic Department Filter Options from Database */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white/10 text-white text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900 transition font-medium"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  🏥 All Specializations & Departments
                </option>
                {departmentOptions.map((deptName) => (
                  <option key={deptName} value={deptName} className="bg-slate-900 text-white">
                    {deptName}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
              {['All', 'Available Today', 'Senior (15+ Yrs)'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActiveFilterPill(pill)}
                  className={`px-4 py-2 text-xs font-bold rounded-2xl transition border shadow-xs ${
                    activeFilterPill === pill
                      ? 'bg-primary text-white border-primary shadow-glow scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="font-poppins font-bold text-xl text-darkNavy flex items-center gap-2">
            <span>👨‍⚕️</span> Hospital Medical Faculty
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slateText font-bold">Connecting to hospital medical roster...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200 shadow-xs max-w-lg mx-auto">
            <span className="text-4xl">👨‍⚕️</span>
            <h3 className="font-poppins font-bold text-darkNavy text-lg">No Doctors Found</h3>
            <p className="text-xs text-slateText">
              No medical specialists matched search term "{searchTerm}". Try clearing filter parameters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedDept('ALL'); setActiveFilterPill('All'); }}
              className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primaryDark transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredDoctors.map((doc, idx) => {
              const rawName = doc.user?.fullName || doc.fullName || 'Senior Specialist';
              const name = /^dr\.?/i.test(rawName.trim()) ? rawName.trim() : `Dr. ${rawName.trim()}`;
              const spec = doc.specialization || doc.department?.name || 'General Medicine';
              const qual = doc.qualification || 'MBBS, MD';
              const exp = doc.experienceYears || 12;
              const fee = doc.consultationFee || 700;
              const rating = doc.rating || 4.9;
              const avatar = getDoctorAvatarUrl(doc);

              return (
                <div
                  key={doc._id || idx}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-primary/40 overflow-hidden shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo Header */}
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-darkNavy/80 via-transparent to-transparent"></div>
                      
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                        <span className="bg-primary/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-bold">
                          {spec}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-poppins font-bold text-darkNavy text-base group-hover:text-primary transition-colors">
                          {name}
                        </h3>
                        <p className="text-xs text-slateText font-medium line-clamp-1">{qual}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="block text-[10px] uppercase text-slate-400 font-semibold">Experience</span>
                          <span className="font-bold text-darkNavy">{exp}+ Years</span>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                          <span className="block text-[10px] uppercase text-indigo-600 font-semibold">Department</span>
                          <span className="font-bold text-indigo-900 truncate block">{doc.department?.name || spec}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => setSelectedDoctorProfile(doc)}
                      className="w-1/2 bg-slate-50 text-darkNavy hover:bg-slate-100 border border-slate-200 text-xs font-bold py-2.5 rounded-xl transition"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleOpenBookingForDoctor(doc)}
                      className="w-1/2 bg-gradient-to-r from-primary to-primaryDark hover:from-primaryDark hover:to-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

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
                    const rawN = selectedDoctorProfile.user?.fullName || selectedDoctorProfile.fullName || '';
                    return /^dr\.?/i.test(rawN.trim()) ? rawN.trim() : `Dr. ${rawN.trim()}`;
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
                  handleOpenBookingForDoctor(doc);
                }}
                className="px-6 py-2.5 text-xs font-bold bg-primary text-white hover:bg-primaryDark rounded-xl shadow"
              >
                Book Appointment Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl lg:max-w-6xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAppointmentModalOpen(false)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl"
            >
              ✕
            </button>

            <AppointmentSection
              initialDoctor={bookingDoctor}
              isModal={true}
              onBookingComplete={() => {
                setIsAppointmentModalOpen(false);
                setBookingDoctor(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Emergency Helpline Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl z-20"
            >
              ✕
            </button>

            <div className="w-16 h-16 bg-emergencyLight text-emergency rounded-full flex items-center justify-center text-3xl mx-auto font-bold">
              🚨
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-poppins font-extrabold text-2xl text-emergency">
                24×7 Emergency Desk
              </h3>
              <p className="text-xs text-slateText">
                Brainware Medical College & Hospital — Critical Response Unit
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs">
              <p className="font-bold text-red-900">🚑 Ambulance Dispatch Hotline:</p>
              <a href="tel:108" className="block text-2xl font-poppins font-extrabold text-emergency hover:underline">
                CALL 108 (Toll Free)
              </a>
              <p className="text-red-700">Direct ER Floor Desk: <strong>+91 98765 43210</strong></p>
            </div>

            <a
              href="tel:108"
              className="block w-full bg-emergency hover:bg-emergencyDark text-white py-3 rounded-xl font-poppins font-bold text-center text-sm shadow transition"
            >
              📞 Call Emergency Now
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
