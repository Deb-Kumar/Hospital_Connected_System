import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';
import AppointmentSection from '../components/Appointment/AppointmentSection';
import axiosClient from '../api/axiosClient';

const ICON_MAP = {
  'Cardio Thoracic Surgery': '🫀',
  'Cardiology': '❤️',
  'Child Guidance Clinic': '🧸',
  'Dental': '🦷',
  'Dermatology': '🧴',
  'Diabetology & Endocrinology': '🧪',
  'ENT': '👂',
  'Gastro Surgery': '🔪',
  'Gastroenterology': '🫄',
  'General Medicine': '🩺',
  'General Surgery': '🔬',
  'Gynae Oncology': '🎀',
  'Gynaecology': '🤰',
  'Haematology': '🩸',
  'Nephrology': '💧',
  'Neuro Medicine': '🧠',
  'Neuro Surgery': '⚡',
  'Nuclear Medicine': '☢️',
  'Onco Surgery': '✂️',
  'Oncology': '🎗️',
  'Oncology Team': '👥',
  'Orthopaedics': '🦴',
  'Paediatric Nephrology': '👶',
  'Paediatric Orthopaedics': '🩼',
  'Paediatric Surgery': '🍼',
  'Paediatrics': '🚼',
  'Physical Medicine': '🏋️',
  'Plastic Surgery': '🩹',
  'Psychiatry': '🗣️',
  'Radiation Oncology': '📡',
  'Resp Medicine & Allergy': '🫁',
  'Rheumatology': '🤲',
  'Thalassaemia & Haemoglobinopathies': '🧬',
  'Urology': '🚿',
  'Emergency & Trauma Care': '🚨',
};

function getDeptIcon(deptName = '') {
  if (!deptName) return '🏬';
  const nameLower = deptName.toLowerCase();
  const foundKey = Object.keys(ICON_MAP).find((key) =>
    nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)
  );
  return foundKey ? ICON_MAP[foundKey] : '🏬';
}

// Full Catalogue — provides icons, categories, and descriptions only.
// consultationFee is fetched strictly from the MongoDB database via API.
const DEFAULT_CATALOGUE = [
  { icon: '🫀', name: 'Cardio Thoracic Surgery', cat: 'Surgical', description: 'Open heart surgery, bypass grafting, valve replacement, and thoracic procedures.' },
  { icon: '❤️', name: 'Cardiology', cat: 'Specialized', description: 'Advanced heart care, angioplasty, pacemaker implantation, and cardiac rehabilitation.' },
  { icon: '🧸', name: 'Child Guidance Clinic', cat: 'Primary', description: 'Behavioral assessment, developmental disorders, autism spectrum, and child psychology.' },
  { icon: '🦷', name: 'Dental', cat: 'Primary', description: 'Root canal treatment, dental implants, oral surgeries, and cosmetic dentistry.' },
  { icon: '🧴', name: 'Dermatology', cat: 'Specialized', description: 'Skin, hair, nail treatments, clinical dermatology, and aesthetic laser therapy.' },
  { icon: '🧪', name: 'Diabetology & Endocrinology', cat: 'Specialized', description: 'Diabetes management, thyroid disorders, hormonal imbalance, and metabolic care.' },
  { icon: '👂', name: 'ENT', cat: 'Surgical', description: 'Ear, nose, throat surgeries, hearing loss solutions, and sinus endoscopic treatments.' },
  { icon: '🔪', name: 'Gastro Surgery', cat: 'Surgical', description: 'Laparoscopic surgery, bariatric surgery, hernia repair, and GI tract procedures.' },
  { icon: '🫄', name: 'Gastroenterology', cat: 'Specialized', description: 'Endoscopy, colonoscopy, liver disease treatment, and digestive system care.' },
  { icon: '🩺', name: 'General Medicine', cat: 'Primary', description: 'Comprehensive diagnosis and treatment for acute & chronic systemic adult health conditions.' },
  { icon: '🔬', name: 'General Surgery', cat: 'Surgical', description: 'Appendectomy, cholecystectomy, trauma surgery, and minimally invasive procedures.' },
  { icon: '🎀', name: 'Gynae Oncology', cat: 'Specialized', description: 'Female reproductive cancer care, cervical, ovarian, and uterine cancer treatment.' },
  { icon: '🤰', name: 'Gynaecology', cat: 'Primary', description: 'Women\'s reproductive health, maternity care, high-risk pregnancy management, & IVF.' },
  { icon: '🩸', name: 'Haematology', cat: 'Specialized', description: 'Blood disorders, anaemia, leukaemia, lymphoma, and bone marrow transplant services.' },
  { icon: '💧', name: 'Nephrology', cat: 'Specialized', description: 'Kidney disease management, dialysis, renal transplant, and electrolyte disorders.' },
  { icon: '🧠', name: 'Neuro Medicine', cat: 'Specialized', description: 'Brain, spinal cord, and peripheral nerve disorders treatment including stroke management.' },
  { icon: '⚡', name: 'Neuro Surgery', cat: 'Surgical', description: 'Brain tumor surgery, spinal surgery, craniotomy, and neurovascular procedures.' },
  { icon: '☢️', name: 'Nuclear Medicine', cat: 'Specialized', description: 'PET-CT scans, radioactive iodine therapy, and nuclear imaging diagnostics.' },
  { icon: '✂️', name: 'Onco Surgery', cat: 'Surgical', description: 'Surgical oncology, tumor excision, radical surgeries, and reconstructive cancer care.' },
  { icon: '🎗️', name: 'Oncology', cat: 'Specialized', description: 'Comprehensive cancer care including chemotherapy, immunotherapy, and targeted therapy.' },
  { icon: '👥', name: 'Oncology Team', cat: 'Specialized', description: 'Multidisciplinary tumor board, coordinated cancer treatment planning and review.' },
  { icon: '🦴', name: 'Orthopaedics', cat: 'Surgical', description: 'Bone, joint replacements, arthroscopic surgery, fracture repair, and spine care.' },
  { icon: '👶', name: 'Paediatric Nephrology', cat: 'Specialized', description: 'Childhood kidney diseases, congenital urinary disorders, and paediatric dialysis.' },
  { icon: '🩼', name: 'Paediatric Orthopaedics', cat: 'Surgical', description: 'Children\'s bone and joint disorders, congenital deformities, and growth plate injuries.' },
  { icon: '🍼', name: 'Paediatric Surgery', cat: 'Surgical', description: 'Neonatal surgery, congenital anomaly repair, and minimally invasive paediatric procedures.' },
  { icon: '🚼', name: 'Paediatrics', cat: 'Primary', description: 'Compassionate healthcare, immunizations, and neonatal intensive care (NICU) for children.' },
  { icon: '🏋️', name: 'Physical Medicine', cat: 'Primary', description: 'Rehabilitation, physiotherapy, electrotherapy, and musculoskeletal disorder management.' },
  { icon: '🩹', name: 'Plastic Surgery', cat: 'Surgical', description: 'Reconstructive surgery, burn care, cosmetic procedures, and microsurgery services.' },
  { icon: '🗣️', name: 'Psychiatry', cat: 'Specialized', description: 'Mental health counseling, depression, anxiety therapy, and de-addiction care.' },
  { icon: '📡', name: 'Radiation Oncology', cat: 'Specialized', description: 'External beam radiation, brachytherapy, and intensity-modulated radiation therapy.' },
  { icon: '🫁', name: 'Resp Medicine & Allergy', cat: 'Specialized', description: 'Asthma, COPD, lung infection management, allergy testing, and sleep apnea diagnosis.' },
  { icon: '🤲', name: 'Rheumatology', cat: 'Specialized', description: 'Arthritis, lupus, autoimmune disorders, and joint inflammation management.' },
  { icon: '🧬', name: 'Thalassaemia & Haemoglobinopathies', cat: 'Specialized', description: 'Thalassaemia treatment, sickle cell disease management, and genetic blood disorder care.' },
  { icon: '🚿', name: 'Urology', cat: 'Surgical', description: 'Kidney stone laser surgery, prostate treatment, and reconstructive urological care.' },
  { icon: '🚨', name: 'Emergency & Trauma Care', cat: 'Primary', description: '24x7 level-1 emergency response, resuscitation, critical care, and acute trauma management.' },
];

export default function DepartmentsPage() {
  const navigate = useNavigate();
  const [dbDepartments, setDbDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Booking Modal State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [bookingDept, setBookingDept] = useState('');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const fetchData = () => {
    Promise.all([
      axiosClient.get('/departments'),
      axiosClient.get('/doctor/all'),
    ])
      .then(([deptRes, docRes]) => {
        setDbDepartments(deptRes.data || []);
        setDoctors(docRes.data || []);
      })
      .catch((err) => console.error('Failed to fetch real database data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();

    // Listen for live updates from admin dashboard (same tab & cross-tab)
    const handleUpdate = () => fetchData();
    window.addEventListener('department_fee_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    // Auto-poll every 5s for real-time live sync
    const interval = setInterval(fetchData, 5000);

    return () => {
      window.removeEventListener('department_fee_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  function handleBookDepartment(deptName) {
    setBookingDept(deptName);
    setIsAppointmentModalOpen(true);
  }

  // Base list source: Use MongoDB departments if present, else DEFAULT_CATALOGUE
  const baseList = dbDepartments && dbDepartments.length > 0 ? dbDepartments : DEFAULT_CATALOGUE;

  // Map each department to its REAL MongoDB fee and REAL assigned doctor count
  const departmentsWithRealData = baseList.map((dept) => {
    const matchingDefault = DEFAULT_CATALOGUE.find(
      (d) => d.name.toLowerCase() === dept.name.toLowerCase()
    );
    const realAssignedDocs = doctors.filter((doc) => {
      const docDeptId = doc.department?._id || doc.department;
      const docDeptName = doc.department?.name || doc.specialization || '';
      return (
        (dept._id && String(docDeptId) === String(dept._id)) ||
        (docDeptName && docDeptName.toLowerCase() === dept.name.toLowerCase())
      );
    });

    return {
      id: dept._id || dept.name,
      name: dept.name,
      icon: getDeptIcon(dept.name),
      cat: matchingDefault?.cat || 'Specialized',
      consultationFee: dept.consultationFee ?? 500,
      description: dept.description || matchingDefault?.description || 'Advanced clinical diagnosis and procedure management.',
      docsCount: realAssignedDocs.length,
    };
  });

  // Filtered Departments by Category Pills & Search
  const filteredDepts = departmentsWithRealData.filter((dept) => {
    const matchesCategory =
      activeCategory === 'All' ||
      dept.cat?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <span>🏥</span> Brainware Hospital Clinical Wings
          </div>
          
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Specialized Medical Departments
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Equipped with state-of-the-art diagnostic & surgical technology, managed by top specialists fetched live from our system database.
          </p>

          {/* Search Bar & Category Pills */}
          <div className="pt-4 space-y-4 max-w-4xl">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search department (e.g. Cardiology, Urology)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900/90 transition"
              />
            </div>

            {/* Category Filter Pills (All, Primary, Specialized, Surgical) */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
              {['All', 'Primary', 'Specialized', 'Surgical'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-2xl transition border shadow-xs ${
                    activeCategory === cat
                      ? 'bg-primary text-white border-primary shadow-glow scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                  }`}
                >
                  {cat === 'All' ? 'All Departments' : `${cat} Departments`}
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
            <span>🏬</span> Hospital Wings Directory
          </h2>
          <span className="text-xs text-slateText font-medium">
            Filtering by: <strong className="text-primary font-bold">{activeCategory} Category</strong>
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slateText font-bold">Connecting to hospital database...</p>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200 shadow-xs max-w-lg mx-auto">
            <span className="text-4xl">🏥</span>
            <h3 className="font-poppins font-bold text-darkNavy text-lg">No Departments Found</h3>
            <p className="text-xs text-slateText">
              No medical departments matched category "{activeCategory}" and search term "{searchTerm}". Try resetting filters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
              className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primaryDark transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepts.map((dept) => (
              <div
                key={dept.id}
                className="bg-white border border-slate-200 hover:border-primary/40 rounded-3xl p-6 shadow-xs hover:shadow-cardHover transition duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary text-3xl flex items-center justify-center border border-primary/20 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition duration-300 shadow-2xs">
                      {dept.icon}
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                      ACTIVE WING
                    </span>
                  </div>

                  {/* Department Name */}
                  <div>
                    <h3 className="font-poppins font-bold text-darkNavy text-lg group-hover:text-primary transition-colors">
                      {dept.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slateText leading-relaxed line-clamp-3">
                    {dept.description}
                  </p>
                </div>

                {/* Footer Info & Booking Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      👨‍⚕️ {dept.docsCount} Doctor{dept.docsCount !== 1 ? 's' : ''} Assigned
                    </span>
                    <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      💳 ₹{dept.consultationFee} / Visit
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookDepartment(dept.name)}
                    className="w-full bg-gradient-to-r from-primary to-primaryDark hover:from-primaryDark hover:to-primary text-white font-poppins font-bold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-2 group-hover:shadow-glow"
                  >
                    <span>📅 Book Appointment</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

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
              initialDept={bookingDept}
              isModal={true}
              onBookingComplete={() => {
                setIsAppointmentModalOpen(false);
                setBookingDept('');
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
