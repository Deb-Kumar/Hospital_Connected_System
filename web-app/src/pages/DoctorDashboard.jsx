import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon, Search, RefreshCw, UserCheck, Calendar, DollarSign, Clock, FileText, Activity, MapPin, Phone, Mail, Shield, AlertCircle, Bell, ChevronLeft, ChevronRight, Menu, Users, Megaphone, BarChart3 } from 'lucide-react';
import OpdSchedulePicker from '../components/Appointment/OpdSchedulePicker';

function DoctorHeroBanner({ docName, doctorProfile, title, subtitle, tag, showBadges = true, bgGradient }) {
  const displayDocName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;
  const deptName = doctorProfile?.department?.name || doctorProfile?.specialization || 'Clinical Specialist';

  const defaultTitle = `Welcome back, ${displayDocName} 👋`;
  const defaultSubtitle = `Manage today's live OPD patient queue, issue digital prescriptions, check patient medical histories, and monitor consultation schedules.`;
  const defaultTag = `OPD Clinical Portal Active`;
  const defaultGradient = `from-emerald-600 via-teal-700 to-indigo-800`;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${bgGradient || defaultGradient} p-6 sm:p-7 text-white shadow-xl`}>
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>{tag || defaultTag}</span>
            <span className="opacity-60">•</span>
            <span className="font-extrabold uppercase">{deptName}</span>
          </div>
          <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl tracking-tight">
            {title || defaultTitle}
          </h1>
          <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Doctor, Department, & Active Status Badges */}
        {showBadges && (
          <div className="flex flex-col items-center gap-2 shrink-0">
            {/* Top Row: Active Status Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-400/20 backdrop-blur-md border border-emerald-300/40 text-xs font-extrabold text-emerald-200 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{doctorProfile?.onLeave ? 'On Leave' : 'Active On Duty'}</span>
            </div>

            {/* Bottom Row: Doctor & Department Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
                <span>🩺</span>
                <span>Doctor</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-100 shadow-xs">
                <span>🏢</span>
                <span>{deptName}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State: 'overview' | 'patients' | 'prescriptions' | 'schedule' | 'leave' | 'revenue' | 'notices'
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notices, setNotices] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bookingChartRange, setBookingChartRange] = useState('week');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Modals & Action States
  const [prescribingFor, setPrescribingFor] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifyPopup, setNotifyPopup] = useState(null);

  // Dark Theme Sync
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  function showNotify(type, title, message) {
    setNotifyPopup({ type, title, message });
  }

  // Fetch All Doctor Data
  const loadDoctorData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [queueRes, profRes, patientsRes, rxRes, noticesRes, leaveReqsRes] = await Promise.allSettled([
        axiosClient.get(`/doctor/${user.id}/queue/today`),
        axiosClient.get(`/doctor/${user.id}/profile`),
        axiosClient.get(`/doctor/${user.id}/patients`),
        axiosClient.get(`/doctor/${user.id}/prescriptions`),
        axiosClient.get('/admin/notices'),
        axiosClient.get(`/doctor/${user.id}/leave-requests`),
      ]);

      if (queueRes.status === 'fulfilled') setQueue(queueRes.value.data || []);
      if (profRes.status === 'fulfilled') setDoctorProfile(profRes.value.data);
      if (patientsRes.status === 'fulfilled') setPatients(patientsRes.value.data || []);
      if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value.data || []);
      if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value.data || []);
      if (leaveReqsRes.status === 'fulfilled') setLeaveRequests(leaveReqsRes.value.data?.requests || []);
    } catch (err) {
      console.error('Error loading doctor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [user?.id]);

  // Appointment Status Updates
  async function handleUpdateStatus(appointmentId, newStatus) {
    try {
      await axiosClient.put(`/appointments/${appointmentId}/status`, null, {
        params: { status: newStatus },
      });
      showNotify('success', 'Status Updated', `Appointment status updated to ${newStatus}`);
      loadDoctorData();
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to update appointment status.');
    }
  }

  // End of Day OPD Shift Clearance: Mark all remaining unvisited patients as ABSENT
  async function handleMarkAllPendingAbsent() {
    const pendingItems = queue.filter(a => a.status === 'PENDING' || a.status === 'ACCEPTED' || a.status === 'SCHEDULED');
    if (pendingItems.length === 0) {
      showNotify('info', 'No Pending Patients', 'There are no remaining pending patients to mark as absent.');
      return;
    }
    if (!window.confirm(`Are you sure you want to mark all ${pendingItems.length} remaining pending patients as ABSENT for today?`)) {
      return;
    }
    try {
      await Promise.all(
        pendingItems.map(apt =>
          axiosClient.put(`/appointments/${apt._id}/status`, null, { params: { status: 'ABSENT' } })
        )
      );
      showNotify('success', 'OPD Shift Cleared', `Marked ${pendingItems.length} patients as ABSENT.`);
      loadDoctorData();
    } catch (err) {
      showNotify('error', 'Batch Update Failed', err.response?.data?.message || 'Failed to update remaining patients.');
    }
  }

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((apt) => {
      const patName = (apt.patient?.user?.fullName || apt.patient?.fullName || '').toLowerCase();
      const patPhone = (apt.patient?.user?.phone || apt.patient?.phone || '').toLowerCase();
      const tokenStr = String(apt.tokenNumber || apt.queueNumber || '');
      const searchMatch =
        patName.includes(searchTerm.toLowerCase()) ||
        patPhone.includes(searchTerm.toLowerCase()) ||
        tokenStr.includes(searchTerm);

      const statusMatch = statusFilter === 'ALL' || apt.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [queue, searchTerm, statusFilter]);

  // Booking Analytics Chart Data
  const bookingChartData = useMemo(() => {
    const now = new Date();
    const allDates = patients.map(p => p.lastVisitDate ? new Date(p.lastVisitDate) : null).filter(Boolean);
    // Also include queue dates
    queue.forEach(apt => {
      if (apt.appointmentDate || apt.createdAt) allDates.push(new Date(apt.appointmentDate || apt.createdAt));
    });

    if (bookingChartRange === 'day') {
      // Last 24 hours, grouped by hour
      const labels = [];
      const counts = [];
      for (let i = 23; i >= 0; i--) {
        const h = new Date(now);
        h.setHours(now.getHours() - i, 0, 0, 0);
        const hourStr = h.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
        labels.push(hourStr);
        counts.push(allDates.filter(d => d.getFullYear() === h.getFullYear() && d.getMonth() === h.getMonth() && d.getDate() === h.getDate() && d.getHours() === h.getHours()).length);
      }
      return { labels, counts };
    } else if (bookingChartRange === 'week') {
      // Last 7 days
      const labels = [];
      const counts = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        counts.push(allDates.filter(ad => ad.toDateString() === d.toDateString()).length);
      }
      return { labels, counts };
    } else if (bookingChartRange === 'month') {
      // Last 30 days grouped by 5-day chunks
      const labels = [];
      const counts = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - (i + 1) * 5);
        const end = new Date(now);
        end.setDate(now.getDate() - i * 5);
        labels.push(`${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
        counts.push(allDates.filter(ad => ad >= start && ad < end).length);
      }
      return { labels, counts };
    } else {
      // Year: last 12 months
      const labels = [];
      const counts = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
        counts.push(allDates.filter(ad => ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth()).length);
      }
      return { labels, counts };
    }
  }, [patients, queue, bookingChartRange]);

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((item) => {
      const pName = (item.patient?.user?.fullName || item.patient?.fullName || '').toLowerCase();
      const pPhone = (item.patient?.user?.phone || item.patient?.phone || '').toLowerCase();
      const pEmail = (item.patient?.user?.email || item.patient?.email || '').toLowerCase();
      return pName.includes(searchTerm.toLowerCase()) || pPhone.includes(searchTerm.toLowerCase()) || pEmail.includes(searchTerm.toLowerCase());
    });
  }, [patients, searchTerm]);

  // Filtered Prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const patName = (rx.appointment?.patient?.user?.fullName || rx.appointment?.patient?.fullName || '').toLowerCase();
      const meds = (rx.medicines || '').toLowerCase();
      return patName.includes(searchTerm.toLowerCase()) || meds.includes(searchTerm.toLowerCase());
    });
  }, [prescriptions, searchTerm]);

  const docName = user?.fullName ? `Dr. ${user.fullName}` : 'Specialist Doctor';

  return (
    <div className="min-h-screen bg-softBg dark:bg-slate-950 font-inter text-darkNavy dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* MOBILE OVERLAY SIDEBAR DRAWER */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs z-30 lg:hidden animate-fadeIn"
        />
      )}

      {/* LEFT SIDEBAR NAVBAR */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen flex-shrink-0 bg-darkNavy text-slate-300 flex flex-col justify-between border-r border-slate-800/60 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Top Brand Logo Header */}
          <div className="h-16 px-2 border-b border-slate-800/80 flex items-center justify-between gap-1 overflow-hidden">
            {isSidebarCollapsed ? (
              <div className="w-10 h-10 bg-white p-1 rounded-xl shadow-sm flex items-center justify-center shrink-0 mx-auto">
                <img
                  src="/hospital_logo.png"
                  alt="Brainware Logo"
                  className="h-6 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="flex-1 min-w-0 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center">
                <img
                  src="/hospital_logo.png"
                  alt="Brainware Medical College & Hospital"
                  className="h-7 w-auto object-contain max-w-[140px]"
                />
              </div>
            )}

            {/* Desktop Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex w-8 h-8 rounded-full bg-slate-800/90 hover:bg-emerald-600 text-slate-300 hover:text-white items-center justify-center border border-slate-700/80 shadow-md transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>



          {/* Navigation Links */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] text-xs font-bold">
            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Doctor Workspace
                </p>
              )}
              <div className="space-y-1">
                <SidebarNavLink
                  icon={<Activity size={18} />}
                  label="Overview"
                  badge={queue.length > 0 ? queue.length : undefined}
                  badgeColor="bg-emerald-500 text-white font-mono"
                  active={activeNav === 'overview'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('overview'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Calendar size={18} />}
                  label="Today's OPD Bookings"
                  badge={queue.length > 0 ? queue.length : undefined}
                  badgeColor="bg-blue-500 text-white font-mono"
                  active={activeNav === 'patients'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('patients'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<FileText size={18} />}
                  label="Rx Prescriptions Vault"
                  badge={prescriptions.length > 0 ? prescriptions.length : undefined}
                  badgeColor="bg-purple-500 text-white font-mono"
                  active={activeNav === 'prescriptions'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('prescriptions'); setIsMobileSidebarOpen(false); }}
                />
              </div>
            </div>

            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Practice Management
                </p>
              )}
              <div className="space-y-1">
                <SidebarNavLink
                  icon={<Calendar size={18} />}
                  label="OPD Schedule & Hours"
                  active={activeNav === 'schedule'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('schedule'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Clock size={18} />}
                  label="Leave Manager"
                  badge={doctorProfile?.onLeave ? 'ACTIVE' : undefined}
                  badgeColor="bg-amber-500 text-white font-mono"
                  active={activeNav === 'leave'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('leave'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Megaphone size={18} />}
                  label="Hospital Bulletins"
                  badge={notices.length > 0 ? notices.length : undefined}
                  badgeColor="bg-indigo-500 text-white font-mono"
                  active={activeNav === 'notices'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('notices'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Shield size={18} />}
                  label="Doctor Profile & Settings"
                  active={activeNav === 'doctor-profile'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('doctor-profile'); setIsMobileSidebarOpen(false); }}
                />
              </div>
            </div>
          </nav>
        </div>

        {/* Doctor Footer Profile & Sign Out */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <button
            type="button"
            onClick={() => { setActiveNav('doctor-profile'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
              activeNav === 'doctor-profile'
                ? 'bg-emerald-500/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80'
            }`}
            title={isSidebarCollapsed ? user?.fullName || 'Doctor' : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30 shrink-0">
              🩺
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden text-left min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Doctor'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
              </div>
            )}
          </button>

          {!isSidebarCollapsed && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
              title="Sign out of doctor portal"
            >
              <LogOut size={14} />
              <span>Sign Out Doctor</span>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col">
        
        {/* Top Header Bar (Identical to Admin Dashboard) */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-darkNavy dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition cursor-pointer shrink-0 shadow-2xs"
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-poppins font-extrabold text-darkNavy dark:text-white text-base sm:text-lg capitalize flex items-center gap-2">
              {activeNav === 'overview' && '📊 Doctor Dashboard Overview'}
              {activeNav === 'patients' && '📅 Today\'s Bookings'}
              {activeNav === 'prescriptions' && '📝 Issued Digital Prescriptions (Rx Vault)'}
              {activeNav === 'schedule' && '📅 OPD Availability & Timings Configuration'}
              {activeNav === 'leave' && '🏖️ Doctor Leave & Absence Management'}
              {activeNav === 'notices' && '📢 Hospital Broadcasts & System Notices'}
              {activeNav === 'doctor-profile' && '🛡️ Doctor Profile & Account Settings'}
            </h1>
          </div>

          {/* Right Header Widget Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderClockWidget />
            <ThemeToggleBtn isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <UserProfileBadgeWidget user={user} fallbackRole="DOCTOR" onProfileClick={() => setActiveNav('doctor-profile')} onLogout={() => setShowLogoutConfirm(true)} />
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="p-4 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1">
          {/* VIEW 1: OVERVIEW */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              {/* Doctor Welcome & Clinical Overview Hero Banner */}
              <DoctorHeroBanner
                docName={docName}
                doctorProfile={doctorProfile}
                title={`Welcome back, ${docName.startsWith('Dr.') ? docName : `Dr. ${docName}`} 👋`}
                subtitle="Clinical overview, patient booking analytics, queue metrics, and practice performance at a glance."
                tag="OPD Clinical Overview"
                bgGradient="from-emerald-600 via-teal-700 to-indigo-800"
              />

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Today's Queued Patients" value={queue.length} icon="👥" gradient="from-emerald-500/10 to-teal-600/5" borderColor="border-emerald-200 dark:border-emerald-800" textColor="text-emerald-700" badge="OPD Queue" />
                <StatCard label="Completed Consults" value={queue.filter((a) => a.status === 'COMPLETED').length} icon="✅" gradient="from-purple-500/10 to-purple-600/5" borderColor="border-purple-200 dark:border-purple-800" textColor="text-purple-700" badge="Finished" />
                <StatCard
                  label="Doctor OPD Schedule"
                  value={doctorProfile?.availabilitySchedule}
                  icon="⏰"
                  gradient="from-amber-500/10 to-amber-600/5"
                  borderColor="border-amber-200 dark:border-amber-800"
                  textColor="text-amber-700"
                  badge="OPD Shift"
                  isOpdSchedule={true}
                />
              </div>



              {/* Patient Booking Analytics Chart */}
              {(() => {
                const maxCount = Math.max(...bookingChartData.counts, 1);
                const totalBookings = bookingChartData.counts.reduce((a, b) => a + b, 0);
                const avgBookings = bookingChartData.counts.length > 0 ? (totalBookings / bookingChartData.counts.length).toFixed(1) : 0;
                const peakIdx = bookingChartData.counts.indexOf(Math.max(...bookingChartData.counts));
                const peakLabel = bookingChartData.labels[peakIdx] || '—';

                return (
                  <>
                    {/* Booking Summary Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Bookings', value: totalBookings, icon: '📊', color: 'from-blue-600 to-indigo-600' },
                        { label: 'Average / Period', value: avgBookings, icon: '📈', color: 'from-emerald-600 to-teal-600' },
                        { label: 'Peak Period', value: peakLabel, icon: '🔥', color: 'from-orange-500 to-rose-500' },
                        { label: 'Total Patients', value: patients.length, icon: '👥', color: 'from-purple-600 to-violet-600' },
                      ].map((stat, i) => (
                        <div key={i} className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-card">
                          <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-lg`} />
                          <div className="relative z-10">
                            <p className="text-xs font-bold text-slateText dark:text-slate-400 mb-1">{stat.icon} {stat.label}</p>
                            <p className="font-poppins font-extrabold text-xl text-darkNavy dark:text-white">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
                      {/* Chart Header with Range Selector */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                            📈 Patient Booking Trends
                          </h3>
                          <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                            Track patient booking patterns across different time periods.
                          </p>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                          {['day', 'week', 'month', 'year'].map(range => (
                            <button
                              key={range}
                              onClick={() => setBookingChartRange(range)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                bookingChartRange === range
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                                  : 'text-slateText dark:text-slate-400 hover:text-darkNavy dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Chart Area */}
                      <div className="p-6 pt-4">
                        <div className="relative h-72">
                          {/* Y-axis grid lines */}
                          {[0, 1, 2, 3, 4].map(i => {
                            const yVal = Math.round((maxCount / 4) * (4 - i));
                            return (
                              <div key={i} className="absolute w-full flex items-center" style={{ top: `${(i / 4) * 100}%` }}>
                                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 w-8 text-right pr-2 shrink-0">{yVal}</span>
                                <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700/60" />
                              </div>
                            );
                          })}

                          {/* Bars */}
                          <div className="absolute inset-0 pl-10 flex items-end gap-1 sm:gap-2 pb-6">
                            {bookingChartData.counts.map((count, i) => {
                              const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                  {/* Tooltip */}
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                    {count} bookings
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
                                  </div>

                                  {/* Bar */}
                                  <div
                                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 group-hover:from-emerald-500 group-hover:via-teal-400 group-hover:to-cyan-300 transition-all duration-500 ease-out relative overflow-hidden shadow-sm cursor-pointer"
                                    style={{
                                      height: `${Math.max(heightPercent, 2)}%`,
                                      animationDelay: `${i * 60}ms`,
                                    }}
                                  >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {/* Value on top of bar */}
                                    {count > 0 && (
                                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                        {count}
                                      </span>
                                    )}
                                  </div>

                                  {/* X-axis label */}
                                  <span className="text-[9px] sm:text-[10px] font-bold text-slateText dark:text-slate-500 mt-2 text-center leading-tight truncate w-full">
                                    {bookingChartData.labels[i]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* VIEW 2: TODAY'S OPD BOOKINGS */}
          {activeNav === 'patients' && (() => {
            // queue is already today's queue from /doctor/{id}/queue/today
            const todayQueue = queue;
            const filteredBookings = todayQueue.filter(apt => {
              const patName = (apt.patient?.user?.fullName || apt.patient?.fullName || '').toLowerCase();
              const patPhone = (apt.patient?.user?.phone || apt.patient?.phone || '').toLowerCase();
              const searchMatch = patName.includes(searchTerm.toLowerCase()) || patPhone.includes(searchTerm.toLowerCase());

              let statusMatch = true;
              if (bookingStatusFilter === 'COMPLETE') statusMatch = apt.status === 'COMPLETED';
              else if (bookingStatusFilter === 'ABSENT') statusMatch = apt.status === 'ABSENT';
              else if (bookingStatusFilter === 'RESCHEDULE') statusMatch = apt.status === 'RESCHEDULED';
              else if (bookingStatusFilter === 'PENDING') statusMatch = apt.status === 'PENDING' || apt.status === 'ACCEPTED' || apt.status === 'SCHEDULED';

              return searchMatch && statusMatch;
            });

            const completeCount = todayQueue.filter(a => a.status === 'COMPLETED').length;
            const absentCount = todayQueue.filter(a => a.status === 'ABSENT').length;
            const rescheduleCount = todayQueue.filter(a => a.status === 'RESCHEDULED').length;
            const pendingCount = todayQueue.filter(a => a.status === 'PENDING' || a.status === 'ACCEPTED' || a.status === 'SCHEDULED').length;

            return (
              <div className="space-y-5">
                {/* Doctor Clinical Hero Banner */}
                <DoctorHeroBanner
                  docName={docName}
                  doctorProfile={doctorProfile}
                  title="Today's OPD Patient Bookings 📅"
                  subtitle="Track today's live patient queue, mark patient consultations as complete, update absent no-shows, or reschedule follow-ups."
                  tag="Live OPD Patient Queue"
                  showBadges={false}
                  bgGradient="from-blue-600 via-indigo-700 to-purple-800"
                />
                {/* End of OPD Session Shift Clearance Banner */}
                {pendingCount > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                        ⏳
                      </div>
                      <div>
                        <h4 className="font-poppins font-bold text-darkNavy dark:text-white text-xs sm:text-sm">
                          OPD Shift Notice: {pendingCount} Patient{pendingCount > 1 ? 's' : ''} Pending Consultation Today
                        </h4>
                        <p className="text-[11px] text-slateText dark:text-slate-400">
                          All new bookings default to <strong>Pending</strong>. Change to <strong>Complete</strong> when visited, <strong>Reschedule</strong> for next day, or bulk mark non-visiting patients <strong>Absent</strong> when closing OPD.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleMarkAllPendingAbsent}
                      className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition active:scale-95 whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      🚫 Mark All ({pendingCount}) Absent
                    </button>
                  </div>
                )}

                {/* Summary Stats Row: Pending -> Complete -> Reschedule -> Absent */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Total Today', value: todayQueue.length, icon: '📅', color: 'from-blue-600 to-indigo-600' },
                    { label: 'Pending', value: pendingCount, icon: '⏳', color: 'from-amber-500 to-orange-500' },
                    { label: 'Completed', value: completeCount, icon: '✅', color: 'from-emerald-600 to-teal-600' },
                    { label: 'Rescheduled', value: rescheduleCount, icon: '🔄', color: 'from-purple-500 to-violet-600' },
                    { label: 'Absent', value: absentCount, icon: '🚫', color: 'from-slate-500 to-slate-700' },
                  ].map((stat, i) => (
                    <div key={i} className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-card">
                      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-lg`} />
                      <div className="relative z-10">
                        <p className="text-xs font-bold text-slateText dark:text-slate-400 mb-1">{stat.icon} {stat.label}</p>
                        <p className="font-poppins font-extrabold text-xl text-darkNavy dark:text-white">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bookings Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
                  {/* Header with Filters */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                        📅 Today's OPD Bookings
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                          {filteredBookings.length} Showing
                        </span>
                      </h3>
                      <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Refreshes daily at midnight.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      {/* Search */}
                      <div className="relative flex-1 sm:w-56">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by patient name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      {/* Status Filter Tabs: All -> Pending -> Complete -> Reschedule -> Absent */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 flex-wrap">
                        {[
                          { key: 'ALL', label: 'All', count: todayQueue.length },
                          { key: 'PENDING', label: 'Pending', count: pendingCount },
                          { key: 'COMPLETE', label: 'Complete', count: completeCount },
                          { key: 'RESCHEDULE', label: 'Reschedule', count: rescheduleCount },
                          { key: 'ABSENT', label: 'Absent', count: absentCount },
                        ].map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => setBookingStatusFilter(tab.key)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              bookingStatusFilter === tab.key
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                                : 'text-slateText dark:text-slate-400 hover:text-darkNavy dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                            }`}
                          >
                            {tab.label}
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                              bookingStatusFilter === tab.key
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {tab.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bookings List */}
                  <div className="p-6">
                    {loading ? (
                      <div className="py-12 text-center text-xs text-slateText dark:text-slate-400">Loading today's bookings...</div>
                    ) : filteredBookings.length === 0 ? (
                      <EmptyState icon="📅" message={bookingStatusFilter === 'ALL' ? 'No bookings for today yet.' : `No ${bookingStatusFilter.toLowerCase()} bookings found.`} />
                    ) : (
                      <div className="space-y-3">
                        {filteredBookings.map((apt, idx) => {
                          const patName = apt.patient?.user?.fullName || apt.patient?.fullName || 'Patient';
                          const patPhone = apt.patient?.user?.phone || apt.patient?.phone || '—';
                          const tokenNum = apt.tokenNumber || apt.queueNumber || idx + 1;
                          const isCompleted = apt.status === 'COMPLETED';
                          const isPending = apt.status === 'PENDING' || apt.status === 'ACCEPTED' || apt.status === 'SCHEDULED';
                          const isAbsent = apt.status === 'ABSENT';
                          const isRescheduled = apt.status === 'RESCHEDULED';

                          return (
                            <div
                              key={apt._id || idx}
                              className={`rounded-2xl p-4 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group shadow-2xs ${
                                isCompleted
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                                  : isAbsent
                                  ? 'bg-slate-100/80 dark:bg-slate-800/40 border-slate-300 dark:border-slate-600/60 opacity-75'
                                  : isRescheduled
                                  ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60'
                                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800'
                              }`}
                            >
                              {/* Left: Patient Info */}
                              <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-2xl font-poppins font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0 ${
                                  isCompleted
                                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                                    : isAbsent
                                    ? 'bg-gradient-to-tr from-slate-500 to-slate-600 text-white'
                                    : isRescheduled
                                    ? 'bg-gradient-to-tr from-purple-600 to-violet-500 text-white'
                                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                                }`}>
                                  {patName.slice(0, 2).toUpperCase()}
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={`font-poppins font-bold text-sm ${isAbsent ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-darkNavy dark:text-white'}`}>
                                      {patName}
                                    </h4>
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                                      Token #{tokenNum}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slateText dark:text-slate-400 flex-wrap">
                                    <span className="flex items-center gap-1">📞 <span className="font-mono">{patPhone}</span></span>
                                    <span className="flex items-center gap-1">⏰ {apt.appointmentTime || '—'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Status Badge + Actions */}
                              <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
                                {/* Status Badge */}
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${
                                  isCompleted
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                    : isAbsent
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                                    : isRescheduled
                                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                                    : apt.status === 'ACCEPTED'
                                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                }`}>
                                  {isCompleted ? '✅ Complete' : isAbsent ? '🚫 Absent' : isRescheduled ? '🔄 Rescheduled' : apt.status === 'ACCEPTED' ? '🔵 In Progress' : '⏳ Pending'}
                                </span>

                                {/* Actions for Pending bookings */}
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(apt._id, 'COMPLETED')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                                    >
                                      ✅ Complete
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(apt._id, 'ABSENT')}
                                      className="bg-slate-500 hover:bg-slate-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                                    >
                                      🚫 Absent
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(apt._id, 'RESCHEDULED')}
                                      className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                                    >
                                      🔄 Reschedule
                                    </button>
                                  </>
                                )}

                                {/* Reschedule option for Absent patients */}
                                {isAbsent && (
                                  <button
                                    onClick={() => handleUpdateStatus(apt._id, 'RESCHEDULED')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                                  >
                                    🔄 Reschedule
                                  </button>
                                )}

                                {/* Issue Rx for completed */}
                                {isCompleted && (
                                  <button
                                    onClick={() => setPrescribingFor(apt)}
                                    className="bg-primary hover:bg-primaryDark text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                                  >
                                    📝 Issue Rx
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* VIEW 3: PRESCRIPTIONS VAULT */}
          {activeNav === 'prescriptions' && (
            <div className="space-y-6">
              {/* Doctor Clinical Hero Banner */}
              <DoctorHeroBanner
                docName={docName}
                doctorProfile={doctorProfile}
                title="Issued Digital Prescriptions Vault 📝"
                subtitle="Search and review all historical digital prescriptions, prescribed medicine dosage guidelines, and clinical advice notes."
                tag="Digital Rx Archive"
                showBadges={false}
                bgGradient="from-purple-600 via-violet-700 to-indigo-900"
              />

              {/* Prescriptions Vault Coming Soon Feature Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-card text-center space-y-6 relative overflow-hidden">
                {/* Glow background circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-lg mx-auto space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-3xl flex items-center justify-center shadow-lg shadow-purple-500/20 animate-bounce">
                    💊
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    <span>Feature Coming Soon</span>
                  </div>

                  <h3 className="font-poppins font-extrabold text-2xl sm:text-3xl text-darkNavy dark:text-white tracking-tight">
                    Digital Prescription Vault 🚀
                  </h3>

                  <p className="text-xs sm:text-sm text-slateText dark:text-slate-400 leading-relaxed">
                    We are upgrading the digital prescription archive system with advanced PDF exports, AI dosage assistants, and direct pharmacy dispatch integration. Stay tuned!
                  </p>

                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      📄 PDF Export Coming Soon
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      💊 AI Dosage Guidance
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      🏥 Pharmacy Dispatch
                    </span>
                  </div>
                </div>
              </div>
          </div>
        )}

          {/* VIEW 4: OPD SCHEDULE & HOURS */}
          {activeNav === 'schedule' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                    📅 OPD Availability & Duty Hours Configuration
                  </h3>
                  <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                    Configure your weekly consultation timings shown on the hospital portal.
                  </p>
                </div>

                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-primary hover:bg-primaryDark text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs"
                >
                  ✏️ Edit Schedule
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
                  <span className="text-2xl block">🏬</span>
                  <h4 className="font-bold text-darkNavy dark:text-white text-sm">Assigned Hospital Wing</h4>
                  <p className="text-xs text-slateText dark:text-slate-300">
                    Department: <strong className="text-darkNavy dark:text-white">{doctorProfile?.department?.name || doctorProfile?.specialization || 'General Medicine'}</strong><br />
                    Consultation Fee: <strong className="text-emerald-700 dark:text-emerald-300 font-mono">₹{doctorProfile?.consultationFee ?? 500}</strong>
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
                  <span className="text-2xl block">⏰</span>
                  <h4 className="font-bold text-darkNavy dark:text-white text-sm">Configured Weekly Schedule</h4>
                  <p className="text-xs font-mono text-darkNavy dark:text-sky-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3">
                    {doctorProfile?.availabilitySchedule || 'MON - FRI • 09:00 AM - 01:00 PM'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: LEAVE MANAGER */}
          {activeNav === 'leave' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-5 animate-page-slide-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                <div>
                  <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                    🏖️ Doctor Absence & Leave Manager
                  </h3>
                  <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                    Submit leave applications for Admin approval and monitor application status.
                  </p>
                </div>

                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-darkNavy text-xs font-black px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  🏖️ Apply For Leave
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-darkNavy dark:text-white">Current Duty & Absence Status</span>
                  {doctorProfile?.onLeave ? (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      🏖️ ON LEAVE
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      ON DUTY (ACTIVE)
                    </span>
                  )}
                </div>

                {doctorProfile?.onLeave && (
                  <p className="text-xs text-slateText dark:text-slate-300">
                    Reason: <strong>{doctorProfile.leaveReason || 'Absence'}</strong>
                  </p>
                )}
              </div>

              {/* Leave Applications History */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-darkNavy dark:text-white text-sm flex items-center gap-2">
                  <span>📋 My Submitted Leave Applications ({leaveRequests.length})</span>
                </h4>

                {leaveRequests.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    You have not submitted any leave applications yet. Click "Apply For Leave" above to request leave.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3 rounded-l-xl">Reason</th>
                          <th className="py-2.5 px-3">Date Applied</th>
                          <th className="py-2.5 px-3">Approval Status</th>
                          <th className="py-2.5 px-3 rounded-r-xl">Admin Comment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {leaveRequests.map((req) => (
                          <tr key={req._id}>
                            <td className="py-3 px-3 font-semibold text-darkNavy dark:text-white">"{req.reason}"</td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3">
                              {req.status === 'PENDING' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                                  ⏳ PENDING APPROVAL
                                </span>
                              )}
                              {req.status === 'APPROVED' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                  ✅ APPROVED
                                </span>
                              )}
                              {req.status === 'REJECTED' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                                  ❌ REJECTED
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-500 italic text-[11px]">
                              {req.adminComment || 'No comment yet'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}



          {/* VIEW 7: HOSPITAL NOTICES */}
          {activeNav === 'notices' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                  📢 Hospital Broadcasts & Official Notices
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                    {notices.length} Published
                  </span>
                </h3>
                <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                  Announcements published by the hospital administration.
                </p>
              </div>

              {notices.length === 0 ? (
                <EmptyState icon="📢" message="No active hospital announcements." />
              ) : (
                <div className="space-y-3">
                  {notices.map((n) => (
                    <div
                      key={n._id}
                      className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-1.5"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-darkNavy dark:text-white text-xs sm:text-sm">{n.title}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 uppercase">
                          {n.type}
                        </span>
                      </div>
                      <p className="text-xs text-slateText dark:text-slate-300 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Published: {new Date(n.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 8: DOCTOR PROFILE & SETTINGS */}
          {activeNav === 'doctor-profile' && (
            <DoctorProfileView
              user={user}
              doctorProfile={doctorProfile}
              showNotify={showNotify}
              onProfileUpdated={loadDoctorData}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {prescribingFor && (
        <PrescriptionModal
          appointment={prescribingFor}
          onClose={() => setPrescribingFor(null)}
          onSuccess={() => {
            loadDoctorData();
            showNotify('success', 'Prescription Issued', 'Digital Rx successfully issued and saved.');
          }}
        />
      )}

      {showScheduleModal && (
        <ScheduleModal
          userId={user.id}
          currentSchedule={doctorProfile?.availabilitySchedule}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            loadDoctorData();
            showNotify('success', 'Schedule Saved', 'OPD Timings updated successfully.');
          }}
        />
      )}

      {showLeaveModal && (
        <LeaveModal
          userId={user.id}
          onClose={() => setShowLeaveModal(false)}
          onSuccess={() => {
            loadDoctorData();
            showNotify('success', 'Leave Request', 'Doctor leave status updated.');
          }}
        />
      )}

      {viewingPatient && (
        <PatientHistoryModal
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
        />
      )}

      {showLogoutConfirm && (
        <ConfirmSignOutModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={logout}
        />
      )}

      {notifyPopup && (
        <NotificationModal
          isOpen={!!notifyPopup}
          type={notifyPopup.type}
          title={notifyPopup.title}
          message={notifyPopup.message}
          onClose={() => setNotifyPopup(null)}
        />
      )}
    </div>
  );
}

// Subcomponents (Shared with Admin Dashboard style)
function SidebarNavLink({ icon, label, badge, badgeColor = 'bg-emerald-500 text-white', active, collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group cursor-pointer ${
        active
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
      }`}
    >
      <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center w-full' : ''}`}>
        <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'} shrink-0`}>
          {icon}
        </span>
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
      {!collapsed && badge !== undefined && (
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
      {badge !== undefined && collapsed && (
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      )}
    </button>
  );
}

function HeaderClockWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs shadow-2xs whitespace-nowrap shrink-0">
      <Clock size={14} className="text-emerald-500 shrink-0" />
      <span className="font-mono font-extrabold text-darkNavy dark:text-sky-300 tracking-wider">
        {timeStr}
      </span>
      <span className="text-slate-400 font-extrabold">•</span>
      <span className="font-bold text-darkNavy dark:text-white">
        {dateStr}
      </span>
    </div>
  );
}

function ThemeToggleBtn({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
      title="Toggle Light / Dark Theme"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
    </button>
  );
}

function UserProfileBadgeWidget({ user, fallbackRole = 'DOCTOR', onProfileClick, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const name = user?.fullName || 'Doctor';
  const roleBadge = (
    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 uppercase">
      🩺 DOCTOR
    </span>
  );

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="h-10 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1 rounded-2xl shadow-2xs transition-colors hover:ring-2 hover:ring-emerald-500/30 cursor-pointer"
        title="Account Options"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-poppins font-extrabold text-xs flex items-center justify-center shadow-xs">
          {initials}
        </div>
        <div className="flex flex-col text-left leading-tight hidden xs:flex">
          <span className="font-poppins font-bold text-darkNavy dark:text-white text-xs truncate max-w-[120px]">
            {name}
          </span>
          <div className="mt-0.5">{roleBadge}</div>
        </div>
      </button>

      {/* 2-Option Dropdown Menu (Profile & Logout) */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn z-50 space-y-1">
            {/* Option 1: Profile */}
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                if (onProfileClick) onProfileClick();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-darkNavy dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <span>👤</span>
              <span>Profile</span>
            </button>

            {/* Option 2: Logout */}
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function formatTime24to12(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function parseScheduleLines(scheduleStr) {
  if (!scheduleStr) {
    return [
      { day: 'TUE', time: '10:00 AM - 02:00 PM' },
      { day: 'THU', time: '10:00 AM - 02:00 PM' },
      { day: 'SAT', time: '10:00 AM - 01:00 PM' },
    ];
  }

  const rawLines = scheduleStr.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
  const items = [];

  for (let line of rawLines) {
    // Format: DAY:HH:MM-HH:MM  (e.g. MON:09:00-13:00)
    const dayTimeMatch = line.match(/^([A-Za-z]{2,3})\s*:\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    if (dayTimeMatch) {
      const day = dayTimeMatch[1].toUpperCase();
      const startTime = formatTime24to12(dayTimeMatch[2]);
      const endTime = formatTime24to12(dayTimeMatch[3]);
      items.push({ day, time: `${startTime} - ${endTime}` });
    }
    // Format: DAY • HH:MM AM - HH:MM PM
    else if (line.includes('•')) {
      const [dayPart, timePart] = line.split('•').map(s => s.trim());
      items.push({ day: dayPart.toUpperCase(), time: timePart });
    }
    // Fallback
    else {
      items.push({ day: 'OPD', time: line });
    }
  }

  return items.length > 0 ? items : [
    { day: 'TUE', time: '10:00 AM - 02:00 PM' },
    { day: 'THU', time: '10:00 AM - 02:00 PM' },
    { day: 'SAT', time: '10:00 AM - 01:00 PM' },
  ];
}

function StatCard({ label, value, icon, gradient, borderColor, textColor, badge, isOpdSchedule }) {
  const renderValue = () => {
    if (isOpdSchedule) {
      const scheduleItems = parseScheduleLines(value);
      return (
        <div className="space-y-1 font-mono text-[11px] sm:text-xs my-1 text-sky-600 dark:text-sky-400 font-bold leading-tight">
          {scheduleItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 truncate">
              <span className="text-sky-500 font-extrabold">•</span>
              <span className="font-extrabold text-sky-700 dark:text-sky-300">{item.day}</span>
              <span className="text-sky-400 opacity-80">•</span>
              <span className="font-mono text-darkNavy dark:text-sky-200">{item.time}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className={`font-poppins font-extrabold text-2xl sm:text-3xl ${textColor} dark:text-white truncate`}>
        {value ?? '—'}
      </p>
    );
  };

  return (
    <div className={`bg-gradient-to-br ${gradient} bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border ${borderColor} shadow-card relative overflow-hidden transition-colors flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-2xl">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs text-slateText dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {badge}
        </span>
      </div>
      <div>
        {renderValue()}
        <p className="text-xs font-semibold text-slateText dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="py-10 text-center space-y-2">
      <span className="text-3xl block">{icon}</span>
      <p className="text-xs font-medium text-slateText dark:text-slate-400">{message}</p>
    </div>
  );
}

// Modals
function PrescriptionModal({ appointment, onClose, onSuccess }) {
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const patName = appointment.patient?.user?.fullName || appointment.patient?.fullName || 'Patient Account';

  async function handleSave() {
    if (!medicines.trim()) {
      setError('Please enter at least one medicine prescription line.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await axiosClient.post('/doctor/prescription', {
        appointmentId: appointment._id,
        medicines,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue digital prescription.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
              📝 Digital Rx Prescription
            </h3>
            <p className="text-xs text-slateText dark:text-slate-400">Patient: <strong className="text-darkNavy dark:text-white">{patName}</strong></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Medicines & Dosage Instructions *</label>
            <textarea
              rows={4}
              placeholder="e.g. Paracetamol 500mg — 1 tablet twice daily after meals (5 days)&#10;Amoxicillin 250mg — 1 capsule every 8 hours (7 days)"
              value={medicines}
              onChange={(e) => setMedicines(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Clinical Advice & Dietary Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Drink warm fluids, avoid cold food. Follow up after 5 days if symptoms persist."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
          >
            {saving ? 'Issuing Rx...' : '✓ Issue Digital Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleModal({ userId, currentSchedule, onClose, onSuccess }) {
  const [schedule, setSchedule] = useState(currentSchedule || 'MON - FRI • 09:00 AM - 01:00 PM');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await axiosClient.put(`/doctor/${userId}/availability`, null, { params: { schedule } });
      onSuccess();
      onClose();
    } catch {
      alert('Failed to update OPD schedule.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-poppins font-black text-darkNavy dark:text-white text-xl flex items-center gap-2">
              <span>📅 Configure OPD Availability Schedule</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set weekly consultation hours displayed to patients on web and mobile booking systems.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-darkNavy dark:hover:text-white flex items-center justify-center font-bold text-base transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <OpdSchedulePicker
          value={schedule}
          onChange={setSchedule}
        />

        <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-3 rounded-2xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-3 rounded-2xl shadow-emerald-500/20 shadow-lg transition cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {saving ? 'Saving Timings...' : '✓ Save OPD Timings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaveModal({ userId, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleApply() {
    if (!reason.trim()) {
      alert('Please enter reason for leave.');
      return;
    }
    setSaving(true);
    try {
      await axiosClient.post(`/doctor/${userId}/leave-request`, { reason });
      alert('Leave application submitted! Awaiting Admin approval.');
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave application.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
          🏖️ Apply Doctor Leave
        </h3>

        <div>
          <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Reason for Leave *</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
            placeholder="e.g. Attending Medical Symposium"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={saving}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs disabled:opacity-60"
          >
            {saving ? 'Submitting...' : 'Submit Leave'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientHistoryModal({ patient, onClose }) {
  const patName = patient?.user?.fullName || patient?.fullName || 'Patient Account';
  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
            📋 Patient Profile History
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-darkNavy dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <div className="space-y-3 text-xs text-darkNavy dark:text-slate-200">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <p className="font-bold text-sm text-darkNavy dark:text-white">{patName}</p>
            <p className="text-slateText dark:text-slate-400">Gender: {patient?.gender || 'Male'} • Blood Group: <strong className="text-rose-600 dark:text-rose-400">{patient?.bloodGroup || 'B+'}</strong></p>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <p>📧 Email: {patient?.user?.email || patient?.email || '—'}</p>
            <p>📞 Phone: {patient?.user?.phone || patient?.phone || '—'}</p>
            <p>📍 Address: {patient?.address || 'Kolkata, West Bengal'}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}

function NotificationModal({ isOpen, type = 'success', title, message, onClose }) {
  if (!isOpen) return null;
  const isSuccess = type === 'success';
  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4 text-center">
        <div className={`w-14 h-14 rounded-2xl text-2xl flex items-center justify-center mx-auto shadow-xs border ${
          isSuccess ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
        }`}>
          {isSuccess ? '✅' : '⚠️'}
        </div>

        <div className="space-y-1">
          <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg">
            {title || (isSuccess ? 'Action Successful' : 'Action Failed')}
          </h3>
          <p className="text-xs text-slateText dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`w-full font-bold text-xs py-2.5 rounded-xl transition shadow-xs ${
            isSuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          OK, Got It
        </button>
      </div>
    </div>
  );
}

function ConfirmSignOutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-[70] animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800 shadow-xs text-2xl">
          🚪
        </div>

        <div className="space-y-1.5">
          <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg">
            Confirm Sign Out?
          </h3>
          <p className="text-xs text-slateText dark:text-slate-400 leading-relaxed">
            Are you sure you want to end your current session and sign out of the Doctor portal?
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function DoctorProfileView({ user, doctorProfile, showNotify, onProfileUpdated }) {
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form fields
  const [consultationFee, setConsultationFee] = useState(doctorProfile?.consultationFee || 500);
  const [qualification, setQualification] = useState(doctorProfile?.qualification || 'MBBS, MD');
  const [experienceYears, setExperienceYears] = useState(doctorProfile?.experienceYears || 5);
  const [phone, setPhone] = useState(doctorProfile?.phone || user?.phone || '');
  const [specialization, setSpecialization] = useState(doctorProfile?.specialization || '');
  const [bio, setBio] = useState(doctorProfile?.bio || '');

  // Dynamic Qualifications List State (Matching Image 2)
  const [qualList, setQualList] = useState(() => parseQualificationsString(doctorProfile?.qualification || 'MBBS, MD'));

  // Email & Phone update states
  const [newEmail, setNewEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const [customPhoneInput, setCustomPhoneInput] = useState(doctorProfile?.phone || user?.phone || '');
  const [showContactEditModal, setShowContactEditModal] = useState(false);
  const [activeSecurityTab, setActiveSecurityTab] = useState('email');

  // Password Reset & Change States
  const [passOtpSent, setPassOtpSent] = useState(false);
  const [passOtpCode, setPassOtpCode] = useState('');
  const [demoPassOtp, setDemoPassOtp] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [requestingPassOtp, setRequestingPassOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [lastPasswordChangedAt, setLastPasswordChangedAt] = useState(doctorProfile?.lastPasswordChangedAt || null);

  useEffect(() => {
    if (doctorProfile?.lastPasswordChangedAt) {
      setLastPasswordChangedAt(doctorProfile.lastPasswordChangedAt);
    }
  }, [doctorProfile]);

  function getPasswordStrength(pass) {
    if (!pass) return { percent: 0, label: 'Empty', color: 'bg-slate-300', textColor: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (pass.length >= 8) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[A-Z]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;

    if (score < 40) return { percent: Math.max(score, 15), label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500' };
    if (score < 75) return { percent: score, label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { percent: 100, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  }

  function parseQualificationsString(str) {
    if (!str || typeof str !== 'string') return [{ degree: 'MBBS', location: '' }];
    const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return [{ degree: 'MBBS', location: '' }];

    return parts.map((part) => {
      const match = part.match(/^(.*?)(?:\s*\((.*?)\))?$/);
      if (match && match[1]) {
        return { degree: match[1].trim(), location: match[2]?.trim() || '' };
      }
      return { degree: part, location: '' };
    });
  }

  function buildQualificationsString(rows) {
    return rows
      .map((r) => {
        const deg = r.degree?.trim();
        const loc = r.location?.trim();
        if (!deg) return null;
        return loc ? `${deg} (${loc})` : deg;
      })
      .filter(Boolean)
      .join(', ');
  }

  function addQualRow() {
    setQualList([...qualList, { degree: 'Degree', location: '' }]);
  }

  function removeQualRow(index) {
    setQualList(qualList.filter((_, i) => i !== index));
  }

  function updateQualRow(index, field, value) {
    const updated = [...qualList];
    updated[index][field] = value;
    setQualList(updated);
  }

  useEffect(() => {
    if (doctorProfile) {
      setConsultationFee(doctorProfile.consultationFee || 500);
      const qualStr = doctorProfile.qualification || 'MBBS, MD';
      setQualification(qualStr);
      setQualList(parseQualificationsString(qualStr));
      setExperienceYears(doctorProfile.experienceYears || 5);
      setPhone(doctorProfile.phone || user?.phone || '');
      setSpecialization(doctorProfile.specialization || '');
      setBio(doctorProfile.bio || '');
      setCustomPhoneInput(doctorProfile.phone || user?.phone || '');
    }
  }, [doctorProfile, user]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    const finalQualString = buildQualificationsString(qualList) || qualification;
    try {
      await axiosClient.put(`/doctor/${user.id}/profile`, {
        consultationFee: Number(consultationFee),
        qualification: finalQualString,
        experienceYears: Number(experienceYears),
        phone,
        specialization,
        bio,
      });
      setQualification(finalQualString);
      showNotify('success', 'Profile Updated', 'Doctor profile information updated successfully.');
      setEditMode(false);
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestOtp(e) {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      showNotify('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setRequestingOtp(true);
    try {
      const res = await axiosClient.post('/doctor/request-email-change-otp', {
        doctorId: user?.id,
        newEmail,
      });
      setOtpSent(true);
      setDemoOtpCode(res.data.otpCode || '');
      showNotify('success', 'OTP Sent!', res.data.message || `OTP sent to ${newEmail}`);
    } catch (err) {
      showNotify('error', 'Request Failed', err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setRequestingOtp(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      showNotify('error', 'Invalid OTP', 'Please enter the 6-digit OTP code.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await axiosClient.post('/doctor/verify-email-change-otp', {
        doctorId: user?.id,
        newEmail,
        otp: otpCode,
      });
      showNotify('success', 'Email Verified & Updated!', 'Official email updated in database and reflected across system.');
      setOtpSent(false);
      setOtpCode('');
      setDemoOtpCode('');
      setNewEmail('');

      // Update stored user in localStorage
      const storedUser = localStorage.getItem('hcs_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.email = res.data.email || newEmail;
          localStorage.setItem('hcs_user', JSON.stringify(parsed));
        } catch (e) {}
      }

      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      showNotify('error', 'Verification Failed', err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleUpdatePhone(e) {
    e.preventDefault();
    if (!customPhoneInput) {
      showNotify('error', 'Phone Required', 'Please enter a valid contact phone number.');
      return;
    }
    setUpdatingPhone(true);
    try {
      await axiosClient.put(`/doctor/${user?.id}/profile`, {
        phone: customPhoneInput,
      });
      showNotify('success', 'Phone Updated!', 'Contact phone number updated in database and admin portal.');
    } finally {
      setUpdatingPhone(false);
    }
  }
  async function handleRequestPassOtp(e) {
    e.preventDefault();
    if (!user?.email) return;
    setRequestingPassOtp(true);
    try {
      const res = await axiosClient.post('/auth/forgot-password', { email: user.email });
      setPassOtpSent(true);
      if (res.data?.devOtp) {
        setDemoPassOtp(res.data.devOtp);
      }
      showNotify('info', 'Password Reset OTP Sent!', res.data?.message || `OTP sent to ${user.email}`);
    } catch (err) {
      showNotify('error', 'OTP Request Failed', err.response?.data?.message || 'Failed to send OTP code.');
    } finally {
      setRequestingPassOtp(false);
    }
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!passOtpCode || !newPassInput || !confirmPassInput) {
      showNotify('error', 'Incomplete Form', 'Please enter OTP code, new password, and confirm password.');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      showNotify('error', 'Password Mismatch', 'New password and confirm password do not match.');
      return;
    }
    if (newPassInput.length < 6) {
      showNotify('error', 'Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setResettingPassword(true);
    try {
      const res = await axiosClient.post('/auth/reset-password', {
        email: user.email,
        otp: passOtpCode,
        newPassword: newPassInput,
      });
      showNotify('success', 'Password Updated!', 'Your account password has been updated successfully.');
      setPassOtpSent(false);
      setPassOtpCode('');
      setDemoPassOtp('');
      setNewPassInput('');
      setConfirmPassInput('');
      if (res.data?.lastPasswordChangedAt) {
        setLastPasswordChangedAt(res.data.lastPasswordChangedAt);
      } else {
        setLastPasswordChangedAt(new Date().toISOString());
      }
    } catch (err) {
      showNotify('error', 'Password Reset Failed', err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setResettingPassword(false);
    }
  }

  const docName = user?.fullName ? `Dr. ${user.fullName}` : 'Specialist Doctor';

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-primary text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-emerald-400/30">
              🩺
            </div>
            <div className="space-y-1">
              <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
                {docName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-poppins font-extrabold text-xs sm:text-sm text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-xl border border-emerald-500/40 shadow-xs inline-flex items-center gap-1.5 shrink-0">
                  <span>🏬</span>
                  <span>{doctorProfile?.department?.name || doctorProfile?.specialization || 'Clinical Department'}</span>
                </span>

                {qualification && (
                  <span className="font-poppins font-extrabold text-xs sm:text-sm text-sky-200 bg-sky-950/90 px-3 py-1 rounded-xl border border-sky-500/40 shadow-xs inline-flex items-center gap-1.5 break-words">
                    <span>🎓</span>
                    <span>{qualification}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: ON DUTY / ON LEAVE Badge */}
          <div className="flex items-center self-start md:self-center">
            {doctorProfile?.onLeave ? (
              <span className="text-xs font-black px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg tracking-wide uppercase inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>ON LEAVE</span>
              </span>
            ) : (
              <span className="text-xs font-black px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg tracking-wide uppercase inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ON DUTY</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">OPD Consultation Fee</p>
              <h4 className="font-poppins font-extrabold text-xl text-darkNavy dark:text-white">₹{doctorProfile?.consultationFee || 500}</h4>
            </div>
          </div>
          <p className="text-[11px] text-slateText dark:text-slate-400">Standard fee charged per patient OPD visit.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase">Qualifications</p>
              <h4 className="font-poppins font-bold text-xs sm:text-sm text-darkNavy dark:text-white leading-snug break-words">{doctorProfile?.qualification || qualification || 'MBBS, MD'}</h4>
            </div>
          </div>
          <p className="text-[11px] text-slateText dark:text-slate-400">{doctorProfile?.experienceYears || 5}+ years of clinical experience.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏬</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase">Hospital Department</p>
              <h4 className="font-poppins font-bold text-xs sm:text-sm text-darkNavy dark:text-white truncate">{doctorProfile?.department?.name || 'General OPD'}</h4>
            </div>
          </div>
          <p className="text-[11px] text-slateText dark:text-slate-400">Brainware Medical College & Hospital</p>
        </div>
      </div>

      {/* 2-COLUMN SIDE-BY-SIDE GRID: LEFT = DOCTOR CREDENTIALS, RIGHT = EMAIL & PHONE VERIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT SIDE: Doctor Credentials & Details View Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap gap-3">
            <div>
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base sm:text-lg flex items-center gap-2">
                🛡️ Doctor Credentials & Details
              </h3>
              <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                Verified clinical qualifications and consultation details.
              </p>
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md cursor-pointer flex items-center gap-2 shrink-0"
            >
              ✏️ Edit Profile Info
            </button>
          </div>

          <div className="space-y-3 text-xs text-darkNavy dark:text-slate-200">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
              <p className="font-bold text-sm text-darkNavy dark:text-white">{docName}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Qualifications & Degrees</span>
              <p className="font-bold text-darkNavy dark:text-white break-words">{qualification}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Clinical Specialization</span>
              <p className="font-bold text-darkNavy dark:text-white">{specialization || doctorProfile?.department?.name || 'General Medicine'}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>✅ Verified & Active Doctor</span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: EMAIL & SECURITY SETTINGS (VIEW CARD) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap gap-3">
            <div>
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base sm:text-lg flex items-center gap-2">
                📧 Email & Security Settings
              </h3>
              <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                Official email, primary contact phone, and security options.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-darkNavy dark:text-slate-200">
            {/* Field 1: Official Email Address */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Official Email Address</span>
                <p className="font-mono font-bold text-darkNavy dark:text-white break-all">{user?.email || 'N/A'}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewEmail(user?.email || '');
                  setActiveSecurityTab('email');
                  setShowContactEditModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
              >
                <span>✏️</span>
                <span>Edit Email</span>
              </button>
            </div>

            {/* Field 2: Contact Phone Number */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone Number</span>
                <p className="font-mono font-bold text-darkNavy dark:text-white">{phone || doctorProfile?.phone || user?.phone || 'Not set'}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomPhoneInput(phone || doctorProfile?.phone || user?.phone || '');
                  setActiveSecurityTab('phone');
                  setShowContactEditModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
              >
                <span>✏️</span>
                <span>Edit Phone</span>
              </button>
            </div>

            {/* Field 3: Account Password */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Account Password</span>
                <p className="font-mono font-bold text-darkNavy dark:text-white">••••••••••••</p>
                <p className="text-[10px] text-slate-400">
                  Last Change: {lastPasswordChangedAt ? new Date(lastPasswordChangedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'At registration'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSecurityTab('password');
                  setShowContactEditModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
              >
                <span>✏️</span>
                <span>Edit Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT EMAIL, PHONE & PASSWORD POPUP MODAL */}
      {showContactEditModal && (
        <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 z-[80] animate-page-slide-left overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                  📧 Edit Contact & Security Settings
                </h3>
                <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                  Update email via OTP, edit primary phone number, and change account password.
                </p>
              </div>
              <button
                onClick={() => setShowContactEditModal(false)}
                className="text-slate-400 hover:text-darkNavy dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* TAB SELECTOR BUTTONS FOR EMAIL, PHONE, AND PASSWORD */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveSecurityTab('email')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSecurityTab === 'email'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-md'
                    : 'text-slate-500 hover:text-darkNavy dark:hover:text-white'
                }`}
              >
                <span>📩</span>
                <span>Edit Email</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSecurityTab('phone')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSecurityTab === 'phone'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300 shadow-md'
                    : 'text-slate-500 hover:text-darkNavy dark:hover:text-white'
                }`}
              >
                <span>📞</span>
                <span>Edit Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSecurityTab('password')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSecurityTab === 'password'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-300 shadow-md'
                    : 'text-slate-500 hover:text-darkNavy dark:hover:text-white'
                }`}
              >
                <span>🔑</span>
                <span>Edit Password</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* TAB 1: EMAIL CHANGE */}
              {(activeSecurityTab === 'email' || activeSecurityTab === 'all') && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📩</span>
                    <div>
                      <h4 className="font-bold text-darkNavy dark:text-white text-xs sm:text-sm">Update Official Email Address</h4>
                      <p className="text-[10px] text-slate-400">Requires 6-digit OTP verification sent to new address.</p>
                    </div>
                  </div>

                  <div className="text-xs text-slateText dark:text-slate-300">
                    Current Email: <strong className="font-mono text-darkNavy dark:text-white break-all">{user?.email || 'N/A'}</strong>
                  </div>

                  <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">New Email Address</label>
                      <input
                        type="email"
                        required
                        disabled={otpSent}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. dr.newemail@hospital.com"
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                      />
                    </div>

                    {otpSent && (
                      <div className="space-y-3 pt-1">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium space-y-1">
                          <p className="font-bold flex items-center gap-1">
                            <span>📩 OTP Code Sent!</span>
                          </p>
                          <p className="text-[11px]">A 6-digit verification code has been sent to <strong>{newEmail}</strong>. Please check your email inbox and enter the code below.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Enter 6-Digit OTP</label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="e.g. 123456"
                            className="w-full text-xs font-mono tracking-widest text-center border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      {otpSent ? (
                        <>
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtpCode(''); setDemoOtpCode(''); }}
                            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                          >
                            Change Email
                          </button>
                          <button
                            type="submit"
                            disabled={verifyingOtp}
                            className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-60"
                          >
                            {verifyingOtp ? 'Verifying...' : '✅ Verify OTP & Update Email'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="submit"
                          disabled={requestingOtp}
                          className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-60"
                        >
                          {requestingOtp ? 'Sending OTP...' : '📩 Request Email Change OTP'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: CONTACT PHONE UPDATE */}
              {(activeSecurityTab === 'phone' || activeSecurityTab === 'all') && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📞</span>
                    <div>
                      <h4 className="font-bold text-darkNavy dark:text-white text-xs sm:text-sm">Update Contact Phone Number</h4>
                      <p className="text-[10px] text-slate-400">Primary phone number for patient & hospital contact.</p>
                    </div>
                  </div>

                  <div className="text-xs text-slateText dark:text-slate-300">
                    Current Phone: <strong className="font-mono text-darkNavy dark:text-white">{phone || doctorProfile?.phone || user?.phone || 'Not set'}</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">New Phone Number</label>
                    <input
                      type="text"
                      required
                      value={customPhoneInput}
                      onChange={(e) => setCustomPhoneInput(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleUpdatePhone}
                      disabled={updatingPhone}
                      className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <span>💾</span>
                      <span>{updatingPhone ? 'Updating...' : 'Save & Update Phone Number'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PASSWORD CHANGE */}
              {(activeSecurityTab === 'password' || activeSecurityTab === 'all') && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔑</span>
                      <div>
                        <h4 className="font-bold text-darkNavy dark:text-white text-xs sm:text-sm">Change Account Password</h4>
                        <p className="text-[10px] text-slate-400">Requires OTP verification sent to {user?.email || 'registered email'}.</p>
                      </div>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-bold text-sky-500 hover:text-sky-600 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between flex-wrap gap-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Last Password Change:</span>
                    <span className="font-mono font-bold text-darkNavy dark:text-white">
                      {lastPasswordChangedAt
                        ? new Date(lastPasswordChangedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                        : 'Default set at registration'}
                    </span>
                  </div>

                  <form onSubmit={passOtpSent ? handleResetPasswordSubmit : handleRequestPassOtp} className="space-y-4">
                    {!passOtpSent ? (
                      <button
                        type="submit"
                        disabled={requestingPassOtp}
                        className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        <span>📩</span>
                        <span>{requestingPassOtp ? 'Sending Reset OTP...' : 'Request Password Reset OTP'}</span>
                      </button>
                    ) : (
                      <div className="space-y-3.5 pt-1">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium space-y-1">
                          <p className="font-bold flex items-center gap-1">
                            <span>📩 Password Reset OTP Sent!</span>
                          </p>
                          <p className="text-[11px]">A 6-digit password reset code has been sent to <strong>{user?.email}</strong>. Please check your email inbox and enter the code below.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Enter 6-Digit Reset OTP *</label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={passOtpCode}
                            onChange={(e) => setPassOtpCode(e.target.value)}
                            placeholder="e.g. 123456"
                            className="w-full text-xs font-mono tracking-widest text-center border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                          />
                        </div>

                        {/* New Password with Eye Toggle */}
                        <div>
                          <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">New Password *</label>
                          <div className="relative">
                            <input
                              type={showNewPass ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={newPassInput}
                              onChange={(e) => setNewPassInput(e.target.value)}
                              placeholder="Enter new strong password"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl pl-3 pr-10 py-2.5 bg-white dark:bg-slate-900 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass(!showNewPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-darkNavy dark:hover:text-white text-sm font-bold cursor-pointer"
                            >
                              {showNewPass ? '🙈' : '👁️'}
                            </button>
                          </div>

                          {/* Password Strength Progress Bar */}
                          {newPassInput.length > 0 && (
                            <div className="space-y-1 mt-2">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-400">Password Strength:</span>
                                <span className={getPasswordStrength(newPassInput).textColor}>
                                  {getPasswordStrength(newPassInput).label}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${getPasswordStrength(newPassInput).color}`}
                                  style={{ width: `${getPasswordStrength(newPassInput).percent}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password with Eye Toggle */}
                        <div>
                          <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Confirm New Password *</label>
                          <div className="relative">
                            <input
                              type={showConfirmPass ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={confirmPassInput}
                              onChange={(e) => setConfirmPassInput(e.target.value)}
                              placeholder="Re-enter new password to confirm"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl pl-3 pr-10 py-2.5 bg-white dark:bg-slate-900 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPass(!showConfirmPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-darkNavy dark:hover:text-white text-sm font-bold cursor-pointer"
                            >
                              {showConfirmPass ? '🙈' : '👁️'}
                            </button>
                          </div>

                          {/* Confirm Password Matching Progress Bar */}
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-slate-400">Password Match Status:</span>
                              <span className={
                                confirmPassInput.length === 0
                                  ? 'text-slate-400'
                                  : confirmPassInput === newPassInput
                                  ? 'text-emerald-500 font-extrabold'
                                  : 'text-rose-500 font-extrabold'
                              }>
                                {confirmPassInput.length === 0
                                  ? 'Pending confirmation'
                                  : confirmPassInput === newPassInput
                                  ? '✅ Passwords Match'
                                  : '⚠️ Passwords Do Not Match'}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  confirmPassInput.length === 0
                                    ? 'bg-slate-300 w-0'
                                    : confirmPassInput === newPassInput
                                    ? 'bg-emerald-500 w-full'
                                    : 'bg-rose-500 w-full animate-pulse'
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPassOtpSent(false);
                              setPassOtpCode('');
                              setDemoPassOtp('');
                              setNewPassInput('');
                              setConfirmPassInput('');
                            }}
                            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                          >
                            Cancel Reset
                          </button>
                          <button
                            type="submit"
                            disabled={resettingPassword || (confirmPassInput.length > 0 && newPassInput !== confirmPassInput)}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <span>🔐</span>
                            <span>{resettingPassword ? 'Updating Password...' : 'Reset & Save New Password'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowContactEditModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
      {/* EDIT DOCTOR CREDENTIALS & DETAILS POPUP MODAL */}
      {editMode && (
        <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 z-[80] animate-page-slide-left overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                  🛡️ Edit Doctor Credentials & Details
                </h3>
                <p className="text-xs text-slateText dark:text-slate-400 mt-0.5">
                  Update clinical qualifications, experience, specialization, and doctor bio.
                </p>
              </div>
              <button
                onClick={() => setEditMode(false)}
                className="text-slate-400 hover:text-darkNavy dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Dynamic Qualifications Field (Matching Image 2) */}
              <div className="space-y-3 border border-slate-200 dark:border-slate-700/80 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-darkNavy dark:text-white">Qualifications *</label>
                  <button
                    type="button"
                    onClick={addQualRow}
                    className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>+ Add More</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {qualList.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={q.degree}
                        onChange={(e) => updateQualRow(idx, 'degree', e.target.value)}
                        className="w-1/2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 bg-white dark:bg-slate-900 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                      >
                        <option value="MBBS">MBBS</option>
                        <option value="MD">MD</option>
                        <option value="MS">MS</option>
                        <option value="DM">DM</option>
                        <option value="MCh">MCh</option>
                        <option value="DNB">DNB</option>
                        <option value="BDS">BDS</option>
                        <option value="MDS">MDS</option>
                        <option value="PhD">PhD</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Degree">Degree</option>
                        {!['MBBS', 'MD', 'MS', 'DM', 'MCh', 'DNB', 'BDS', 'MDS', 'PhD', 'Diploma', 'Degree'].includes(q.degree) && (
                          <option value={q.degree}>{q.degree}</option>
                        )}
                      </select>

                      <input
                        type="text"
                        placeholder="Location (e.g. London)"
                        value={q.location}
                        onChange={(e) => updateQualRow(idx, 'location', e.target.value)}
                        className="w-1/2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 bg-white dark:bg-slate-900 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />

                      {qualList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQualRow(idx)}
                          className="text-rose-500 hover:text-rose-700 font-bold text-sm px-1.5 py-1 cursor-pointer transition shrink-0"
                          title="Remove qualification"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Live Preview Pill */}
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <span>📋</span>
                  <span className="truncate">{buildQualificationsString(qualList) || 'No qualifications specified'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Clinical Experience (Years)</label>
                <input
                  type="number"
                  min={0}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Specialization / Clinical Focus</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Interventional Cardiology & Heart Failure"
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Doctor Bio / Clinical Summary</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short bio for patient guidance..."
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving...' : '💾 Save Profile Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
