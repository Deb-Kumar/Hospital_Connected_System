import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

export default function FindDoctor({ onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const [dbDoctors, setDbDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      .catch((err) => console.error('Failed to load doctors in FindDoctor component:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = dbDoctors.filter((doc) => {
    const rawName = doc.fullName || doc.user?.fullName || '';
    const deptName = doc.department?.name || doc.specialization || '';
    const matchesSearch =
      rawName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.qualification || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept
      ? (doc.department?.name === selectedDept || doc.department?._id === selectedDept)
      : true;

    return matchesSearch && matchesDept;
  });

  return (
    <section className="py-20 bg-softBg border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full">
            Doctor Directory
          </span>
          <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy mt-3">
            Find Your Specialist Doctor
          </h2>
          <p className="text-slateText text-sm mt-2">
            Search by doctor name, medical department, or qualification.
          </p>
        </div>

        {/* Search Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-card mb-8 border border-slate-100">
          <div className="grid md:grid-cols-12 gap-4 items-center">
            
            <div className="md:col-span-7">
              <label className="block text-xs font-semibold text-darkNavy mb-1">Search Doctor Name or Specialty</label>
              <input
                type="text"
                placeholder="Search 'Dr. Rajesh' or 'Cardiology'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-softBg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-darkNavy mb-1">Filter Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-softBg focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">All Departments ({departments.length})</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name} (₹{dept.consultationFee || 500})
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Doctor Results Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            Loading active doctors...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center space-y-3 border border-slate-100 shadow-xs max-w-md mx-auto">
            <span className="text-3xl block">🩺</span>
            <h3 className="font-poppins font-bold text-darkNavy text-base">No Doctors Found</h3>
            <p className="text-xs text-slateText">
              No registered doctors matched your search criteria.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedDept(''); }}
              className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primaryDark transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc) => {
              const rawName = doc.fullName || doc.user?.fullName || 'Senior Specialist';
              const name = /^dr\.?/i.test(rawName.trim()) ? rawName.trim() : `Dr. ${rawName.trim()}`;
              const deptName = doc.department?.name || doc.specialization || 'General Medicine';
              const qual = doc.qualification || 'MBBS, MD';
              const exp = doc.experienceYears || 10;
              const fee = doc.consultationFee || doc.department?.consultationFee || 500;
              const avatar = doc.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-cardHover transition duration-300 flex gap-4 items-center group"
                >
                  <img
                    src={avatar}
                    alt={name}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold text-primary bg-primaryLight border border-primary/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        🏬 {deptName}
                      </span>
                    </div>
                    <h4 className="font-poppins font-extrabold text-darkNavy text-sm truncate group-hover:text-primary transition-colors pt-0.5">
                      {name}
                    </h4>
                    <p className="text-[11px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                      🎓 {qual}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-extrabold pt-0.5">
                      ₹{fee} • {exp}+ Yrs Exp
                    </p>

                    <button
                      onClick={() => onSelectDoctor && onSelectDoctor(doc)}
                      className="mt-2 text-xs font-bold text-white bg-primary hover:bg-primaryDark px-3 py-1.5 rounded-lg w-full transition shadow-xs cursor-pointer"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
