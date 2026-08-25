import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/Appointment/AppointmentCard';
import { LogOut, Trash2, ShieldAlert, AlertTriangle, KeyRound, Phone, User, RefreshCw, ChevronLeft, ChevronRight, Menu, LayoutDashboard, Calendar, Clock, FileText, Bot, MessageSquare } from 'lucide-react';

/* ─────────────── Sidebar Navigation Link Component ─────────────── */
function SidebarNavLink({ icon, label, badge, badgeColor = 'bg-sky-500 text-white', active, collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group cursor-pointer ${
        active
          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
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

/* ─────────────── Live Clock Widget ─────────────── */
function HeaderClockWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs shadow-2xs whitespace-nowrap shrink-0">
      <Clock size={14} className="text-sky-500 shrink-0" />
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

const STATUS_TABS = [
  { key: 'ALL', label: 'All', icon: '📋' },
  { key: 'ACCEPTED', label: 'Active', icon: '✅' },
  { key: 'PENDING', label: 'Pending', icon: '⏳' },
  { key: 'COMPLETED', label: 'Completed', icon: '🏁' },
  { key: 'CANCELLED', label: 'Cancelled', icon: '❌' },
];

export default function PatientDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Navigation State
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') || location.state?.tab;
    if (tabParam) {
      setActiveNav(tabParam);
    }
  }, [location, searchParams]);

  // Data States
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Book Appointment States
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookReason, setBookReason] = useState('');
  const [videoConsultation, setVideoConsultation] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState('');

  // Profile Edit States
  const [profileForm, setProfileForm] = useState({
    fullName: '', phone: '', email: '', gender: '', age: '', bloodGroup: '',
    address: '', emergencyContact: '', allergies: '', insuranceProvider: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditingSection1, setIsEditingSection1] = useState(false);
  const [isEditingSection2, setIsEditingSection2] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(t => ({ ...t, show: false }));
    }, 4000);
  };

  // Cancel & Reschedule Modals State
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [cancelReasonOption, setCancelReasonOption] = useState('Schedule Conflict');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [rescheduleModalAppointment, setRescheduleModalAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Feedback Form State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('OPD Consultation');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Profile Dropdown State
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match!' });
      showToast('New passwords do not match!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    setChangingPassword(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      const res = await axiosClient.post('/auth/change-password', {
        userId: user?.id,
        currentPassword,
        newPassword,
      });
      const msg = res.data?.message || 'Password updated successfully!';
      setPasswordMsg({ type: 'success', text: msg });
      showToast(msg, 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed.';
      setPasswordMsg({ type: 'error', text: msg });
      showToast(msg, 'error');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await axiosClient.post('/patient/feedback', {
        patientId: user?.id,
        rating: feedbackRating,
        category: feedbackCategory,
        comments: feedbackText,
      }).catch(() => {});
      setFeedbackSubmitted(true);
      setFeedbackText('');
    } finally {
      setSubmittingFeedback(false);
    }
  }

  // SOS & Account Modals
  const [showSosModal, setShowSosModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      await axiosClient.delete(`/patient/${user.id}`);
      showToast('Account deleted successfully', 'success');
      logout();
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete account', 'error');
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirmModal(false);
    }
  }

  // Dark Theme
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDark]);

  // ─── Data Loading ───
  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [aptsRes, recsRes, profRes, deptsRes, noticesRes] = await Promise.allSettled([
        axiosClient.get(`/appointments/patient/${user.id}`),
        axiosClient.get(`/patient/${user.id}/records`),
        axiosClient.get(`/patient/${user.id}/profile`),
        axiosClient.get('/departments'),
        axiosClient.get('/admin/notices'),
      ]);
      if (aptsRes.status === 'fulfilled') setAppointments(aptsRes.value.data || []);
      if (recsRes.status === 'fulfilled') setRecords(recsRes.value.data || []);
      if (profRes.status === 'fulfilled') {
        const pData = profRes.value.data;
        setProfile(pData);
        if (pData?.fullName) {
          updateUser({ fullName: pData.fullName, email: pData.email || user?.email, phone: pData.phone || user?.phone });
        }
        setProfileForm({
          fullName: pData?.fullName || user?.fullName || '',
          phone: pData?.phone || user?.phone || '',
          email: pData?.email || user?.email || '',
          gender: pData?.gender || '',
          age: pData?.age !== undefined && pData?.age !== null ? pData.age : '',
          bloodGroup: pData?.bloodGroup || '',
          address: pData?.address || '',
          emergencyContact: pData?.emergencyContact || '',
          allergies: pData?.allergies || '',
          insuranceProvider: pData?.insuranceProvider || '',
        });
      }
      if (deptsRes.status === 'fulfilled') setDepartments(deptsRes.value.data || []);
      if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [user?.id]);

  // Load doctors when department changes
  useEffect(() => {
    if (!departmentId) { setDoctors([]); return; }
    axiosClient.get(`/doctor/department/${departmentId}`).then(r => setDoctors(r.data)).catch(() => {});
  }, [departmentId]);

  // ─── Actions ───
  const activeAppointments = appointments.filter(a => a.status === 'ACCEPTED' || a.status === 'PENDING');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
  const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'REJECTED');
  const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
  const acceptedAppointments = appointments.filter(a => a.status === 'ACCEPTED');

  const stats = useMemo(() => ({
    total: appointments.length,
    active: acceptedAppointments.length,
    pending: pendingAppointments.length,
    completed: completedAppointments.length,
    cancelled: cancelledAppointments.length,
  }), [appointments, acceptedAppointments, pendingAppointments, completedAppointments, cancelledAppointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const statusMatch = statusFilter === 'ALL' || a.status === statusFilter;
      const docName = (a.doctor?.user?.fullName || a.doctor?.fullName || '').toLowerCase();
      const token = String(a.tokenNumber || '');
      const dept = (a.departmentName || a.department?.name || '').toLowerCase();
      const searchMatch = !searchTerm || docName.includes(searchTerm.toLowerCase()) || token.includes(searchTerm) || dept.includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [appointments, statusFilter, searchTerm]);

  function openCancelModal(appointment) {
    setCancelModalAppointment(appointment);
    setCancelReasonOption('Schedule Conflict');
    setCustomCancelReason('');
  }

  async function confirmCancelAppointment() {
    if (!cancelModalAppointment) return;
    setCancelling(true);
    const reason = cancelReasonOption === 'Other Reason' ? (customCancelReason || 'Cancelled by patient') : cancelReasonOption;
    try {
      await axiosClient.put(`/appointments/${cancelModalAppointment._id}/cancel`, null, { params: { reason } });
      setCancelModalAppointment(null);
      showToast('Appointment cancelled successfully!', 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel appointment', 'error');
    } finally {
      setCancelling(false);
    }
  }

  function openRescheduleModal(appointment) {
    setRescheduleModalAppointment(appointment);
    setRescheduleDate(appointment.appointmentDate || '');
    setRescheduleTime(appointment.appointmentTime || '');
  }

  async function confirmRescheduleAppointment() {
    if (!rescheduleModalAppointment || !rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    try {
      await axiosClient.put(`/appointments/${rescheduleModalAppointment._id}/reschedule`, null, {
        params: { date: rescheduleDate, time: rescheduleTime },
      });
      setRescheduleModalAppointment(null);
      showToast('Appointment rescheduled successfully!', 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reschedule appointment', 'error');
    } finally {
      setRescheduling(false);
    }
  }

  async function handleBookAppointment(e) {
    e.preventDefault();
    setBookError(''); setBookSuccess(''); setBookLoading(true);
    try {
      const { data } = await axiosClient.post('/appointments/book', {
        patientId: user.id, doctorId: doctorId || undefined, departmentName: departments.find(d => d._id === departmentId)?.name,
        appointmentDate: bookDate, appointmentTime: bookTime, reasonForVisit: bookReason, videoConsultation,
      });
      setBookSuccess(`✅ Appointment Booked! Token: ${data.tokenNumber || 'Assigned'}`);
      showToast(`Appointment Booked! Token: ${data.tokenNumber || 'Assigned'}`, 'success');
      setDepartmentId(''); setDoctorId(''); setBookDate(''); setBookTime(''); setBookReason(''); setVideoConsultation(false);
      loadData();
    } catch (err) {
      setBookError(err.response?.data?.message || 'Booking failed.');
      showToast(err.response?.data?.message || 'Booking failed.', 'error');
    }
    finally { setBookLoading(false); }
  }

  async function handleSaveProfile() {
    if (profileForm.phone && profileForm.phone.length !== 10) {
      showToast('Primary Phone Number must be exactly 10 digits', 'error');
      return;
    }
    if (profileForm.emergencyContact && profileForm.emergencyContact.length !== 10) {
      showToast('Emergency Phone Number must be exactly 10 digits', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await axiosClient.put(`/patient/${user.id}/profile`, profileForm);
      showToast('Profile updated successfully!', 'success');
      setIsEditingSection1(false);
      setIsEditingSection2(false);

      // Instantly sync AuthContext & localStorage user object
      if (data?.user) {
        updateUser(data.user);
      } else if (profileForm.fullName) {
        updateUser({ fullName: profileForm.fullName, email: profileForm.email, phone: profileForm.phone });
      }

      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
    finally { setSavingProfile(false); }
  }

  function handleCancelSection1() {
    setIsEditingSection1(false);
    setProfileForm({
      fullName: profile?.fullName || user?.fullName || '',
      phone: profile?.phone || user?.phone || '',
      email: profile?.email || user?.email || '',
      gender: profile?.gender || '',
      age: profile?.age !== undefined && profile?.age !== null ? profile.age : '',
      bloodGroup: profile?.bloodGroup || '',
      address: profile?.address || '',
      emergencyContact: profile?.emergencyContact || '',
      allergies: profile?.allergies || '',
      insuranceProvider: profile?.insuranceProvider || '',
    });
  }

  function handleCancelSection2() {
    setIsEditingSection2(false);
    setProfileForm({
      fullName: profile?.fullName || user?.fullName || '',
      phone: profile?.phone || user?.phone || '',
      email: profile?.email || user?.email || '',
      gender: profile?.gender || '',
      age: profile?.age !== undefined && profile?.age !== null ? profile.age : '',
      bloodGroup: profile?.bloodGroup || '',
      address: profile?.address || '',
      emergencyContact: profile?.emergencyContact || '',
      allergies: profile?.allergies || '',
      insuranceProvider: profile?.insuranceProvider || '',
    });
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-softBg dark:bg-slate-950 font-inter text-darkNavy dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">

      {/* MOBILE OVERLAY */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs z-30 lg:hidden animate-fadeIn"
        />
      )}

      {/* ──────────── LEFT SIDEBAR ──────────── */}
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
              className="hidden lg:flex w-8 h-8 rounded-full bg-slate-800/90 hover:bg-sky-600 text-slate-300 hover:text-white items-center justify-center border border-slate-700/80 shadow-md transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Sidebar Nav */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] text-xs font-bold">
            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Health Dashboard
                </p>
              )}
              <div className="space-y-1">
                <SidebarNavLink
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard Overview"
                  active={activeNav === 'overview'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('overview'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Clock size={18} />}
                  label="Appointment History"
                  badge={appointments.length > 0 ? appointments.length : undefined}
                  badgeColor="bg-blue-500 text-white font-mono"
                  active={activeNav === 'history'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('history'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<FileText size={18} />}
                  label="Medical Records & Rx"
                  badge={records.length > 0 ? records.length : undefined}
                  badgeColor="bg-purple-500 text-white font-mono"
                  active={activeNav === 'records'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('records'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<Bot size={18} />}
                  label="AI Health Assistant"
                  active={activeNav === 'ai'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('ai'); setIsMobileSidebarOpen(false); }}
                />
                <SidebarNavLink
                  icon={<MessageSquare size={18} />}
                  label="Feedback & Care Rating"
                  active={activeNav === 'feedback'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('feedback'); setIsMobileSidebarOpen(false); }}
                />
              </div>
            </div>
          </nav>
        </div>

        {/* Footer Profile & Sign Out */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <button
            type="button"
            onClick={() => { setActiveNav('profile'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
              activeNav === 'profile'
                ? 'bg-sky-500/20 border-sky-500/50 ring-1 ring-sky-500/30'
                : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80'
            }`}
            title={isSidebarCollapsed ? profile?.fullName || user?.fullName || 'Patient' : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs border border-sky-500/30 shrink-0">
              👤
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden text-left min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{profile?.fullName || user?.fullName || 'Patient'}</p>
                <p className="text-[10px] text-slate-400 truncate">{profile?.email || user?.email || ''}</p>
              </div>
            )}
          </button>

          {!isSidebarCollapsed && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
              title="Sign out of patient portal"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* ──────────── MAIN CONTENT ──────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top Header Bar */}
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
              {activeNav === 'overview' && '📊 Patient Health Dashboard'}
              {activeNav === 'book' && '📅 Book New OPD Appointment'}
              {activeNav === 'history' && '🗂️ Appointment History & Records'}
              {activeNav === 'records' && '📄 Medical Records & Digital Prescriptions'}
              {activeNav === 'profile' && '👤 My Health Profile & Settings'}
              {activeNav === 'ai' && '🤖 AI Health Assistant'}
              {activeNav === 'feedback' && '💬 Feedback & Patient Rating'}
              {activeNav === 'notices' && '📢 Hospital Bulletins & Notices'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              title="Refresh Dashboard Data"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700/80 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-white' : 'text-slate-300'} />
              <span className="font-extrabold text-white text-xs hidden xs:inline">Refresh Data</span>
            </button>
            <HeaderClockWidget />
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-darkNavy dark:text-white transition cursor-pointer border border-slate-200 dark:border-slate-700">
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Profile Avatar Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="User Account Menu"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-indigo-600 text-white font-poppins font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {((profile?.fullName || user?.fullName || 'P')).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-darkNavy dark:text-white hidden sm:inline truncate max-w-[90px]">
                  {(profile?.fullName || user?.fullName)?.split(' ')[0] || 'Profile'}
                </span>
              </button>

              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="px-3.5 py-2">
                      <p className="text-xs font-bold text-darkNavy dark:text-white truncate">{profile?.fullName || user?.fullName || 'Patient'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{profile?.email || user?.email || ''}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveNav('profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-darkNavy dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                      >
                        <span>👤</span>
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition cursor-pointer"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* ═══════ OVERVIEW ═══════ */}
          {activeNav === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-primaryDark via-darkNavy to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-sky-200 border border-white/10 mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Patient Health Portal Active
                    </div>
                    <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl tracking-tight">
                      Welcome back, {profile?.fullName || user?.fullName || 'Patient'} 👋
                    </h1>
                    <p className="text-sm text-slate-200 mt-1 max-w-xl">
                      Manage your appointments, prescriptions, and health records from this unified dashboard.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-52">
                    <button
                      onClick={() => setActiveNav('book')}
                      className="w-full bg-primary hover:bg-primaryDark text-white px-5 py-3 rounded-2xl font-extrabold text-xs shadow-lg hover:shadow-primary/30 transition active:scale-95 flex items-center justify-center gap-2 border border-primary/30 cursor-pointer"
                    >
                      <span className="text-sm">📅</span>
                      <span>BOOK APPOINTMENT</span>
                    </button>
                    <button
                      onClick={() => setShowSosModal(true)}
                      className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white px-5 py-3 rounded-2xl font-extrabold text-xs shadow-lg hover:shadow-rose-500/30 transition active:scale-95 flex items-center justify-center gap-2 border border-rose-400/30 cursor-pointer"
                    >
                      <span className="text-sm">🚨</span>
                      <span>EMERGENCY SOS</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Active Appointments', value: activeAppointments.length, icon: '📅', color: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-200 dark:border-blue-800', textColor: 'text-blue-600' },
                  { label: 'Completed Visits', value: completedAppointments.length, icon: '✅', color: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-200 dark:border-emerald-800', textColor: 'text-emerald-600' },
                  { label: 'Medical Records', value: records.length, icon: '📄', color: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-200 dark:border-purple-800', textColor: 'text-purple-600' },
                  { label: 'Cancelled', value: cancelledAppointments.length, icon: '❌', color: 'from-rose-500/10 to-rose-500/5', border: 'border-rose-200 dark:border-rose-800', textColor: 'text-rose-600' },
                ].map((s, i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.color} bg-white dark:bg-slate-900 rounded-2xl p-4 border ${s.border} shadow-card`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slateText dark:text-slate-400">{s.label}</span>
                    </div>
                    <p className={`font-poppins font-extrabold text-2xl ${s.textColor}`}>{s.value}</p>
                  </div>
                ))}
              </div>



              {/* Upcoming Appointments */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-card">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div>
                    <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                      Upcoming Appointments
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{activeAppointments.length} Active</span>
                    </h2>
                    <p className="text-xs text-slateText dark:text-slate-400">Your scheduled OPD consultations and queue status.</p>
                  </div>
                  <button onClick={() => setActiveNav('book')}
                    className="text-xs font-bold text-primary hover:text-primaryDark bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl transition cursor-pointer">
                    + Book New OPD
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs text-slateText dark:text-slate-400">Loading your appointments...</div>
                ) : activeAppointments.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <span className="text-4xl block">📅</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white">No Active Appointments Found</p>
                    <p className="text-xs text-slateText dark:text-slate-400 max-w-sm mx-auto">
                      You have no upcoming OPD appointments scheduled. Click below to book a consultation.
                    </p>
                    <button onClick={() => setActiveNav('book')}
                      className="inline-block bg-primary hover:bg-primaryDark text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer">
                      Book OPD Appointment Now
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {activeAppointments.slice(0, 4).map(a => (
                      <AppointmentCard key={a._id} appointment={a} onCancel={openCancelModal} onReschedule={openRescheduleModal} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ BOOK APPOINTMENT ═══════ */}
          {activeNav === 'book' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-lg">📅 Schedule New OPD Appointment</h2>
                  <p className="text-xs text-slateText dark:text-slate-400 mt-1">Select your department, doctor, and preferred date/time.</p>
                </div>

                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Department *</label>
                    <select required value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                      className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Doctor (Optional — leave empty for Any Specialist)</label>
                    <select value={doctorId} onChange={e => setDoctorId(e.target.value)}
                      className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" disabled={!departmentId}>
                      <option value="">Any Available Specialist</option>
                      {doctors.map(d => {
                        const raw = d.user?.fullName || d.fullName || 'Doctor';
                        const name = /^dr\.?/i.test(raw.trim()) ? raw.trim() : `Dr. ${raw.trim()}`;
                        return <option key={d._id} value={d._id}>{name} {d.onLeave ? '(On Leave)' : ''}</option>;
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Appointment Date *</label>
                      <input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Appointment Time *</label>
                      <input type="time" required value={bookTime} onChange={e => setBookTime(e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Reason for Visit</label>
                    <textarea value={bookReason} onChange={e => setBookReason(e.target.value)} rows={2} placeholder="Describe your symptoms or reason..."
                      className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-darkNavy dark:text-white cursor-pointer">
                    <input type="checkbox" checked={videoConsultation} onChange={e => setVideoConsultation(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary" />
                    Video Consultation (Telemedicine)
                  </label>

                  {bookError && <p className="text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-200 dark:border-rose-800">❌ {bookError}</p>}
                  {bookSuccess && <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">{bookSuccess}</p>}

                  <button type="submit" disabled={bookLoading}
                    className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-60 cursor-pointer">
                    {bookLoading ? '⏳ Booking...' : '📅 Confirm OPD Booking'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════ APPOINTMENT HISTORY ═══════ */}
          {activeNav === 'history' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-primaryDark via-darkNavy to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-sky-200 border border-white/10 mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Appointment Management Console
                    </div>
                    <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl tracking-tight">
                      🗂️ Your Appointment History
                    </h1>
                    <p className="text-sm text-slate-200 mt-1 max-w-xl">
                      Track, manage, reschedule, or cancel your OPD consultations. All your past and upcoming visits in one place.
                    </p>
                  </div>

                  <button onClick={() => setActiveNav('book')}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-2 self-start md:self-auto border border-white/20 cursor-pointer">
                    <span className="text-base">📅</span>
                    <span>Book New OPD</span>
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Total', value: stats.total, icon: '📋', color: 'text-darkNavy dark:text-white', bg: 'bg-white dark:bg-slate-900', border: 'border-slate-200 dark:border-slate-800' },
                  { label: 'Active', value: stats.active, icon: '✅', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
                  { label: 'Pending', value: stats.pending, icon: '⏳', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
                  { label: 'Completed', value: stats.completed, icon: '🏁', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
                  { label: 'Cancelled', value: stats.cancelled, icon: '❌', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800' },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-2xl p-3.5 border ${s.border} shadow-card text-center`}>
                    <span className="text-lg block">{s.icon}</span>
                    <p className={`font-poppins font-extrabold text-xl ${s.color} mt-1`}>{s.value}</p>
                    <p className="text-[10px] font-bold text-slateText dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-card">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  {/* Search Input (Left Side) */}
                  <div className="relative w-full md:w-72 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
                    <input type="text" placeholder="Search doctor, department, token..."
                      value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>

                  {/* Status Tabs (Right Side) */}
                  <div className="flex flex-wrap items-center md:justify-end gap-1.5">
                    {STATUS_TABS.map(tab => {
                      const count = tab.key === 'ALL' ? stats.total
                        : tab.key === 'ACCEPTED' ? stats.active
                        : tab.key === 'PENDING' ? stats.pending
                        : tab.key === 'COMPLETED' ? stats.completed
                        : stats.cancelled;
                      return (
                        <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            statusFilter === tab.key
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slateText dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}>
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] ${
                            statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slateText dark:text-slate-400'
                          }`}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Results Info Bar */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slateText dark:text-slate-400">
                  Showing <span className="text-darkNavy dark:text-white font-bold">{filteredAppointments.length}</span> of {appointments.length} appointments
                  {statusFilter !== 'ALL' && <span className="ml-1">• Filter: <span className="text-primary font-bold">{statusFilter}</span></span>}
                </p>
                <button onClick={loadData}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700/80 px-3.5 py-1.5 rounded-full transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <RefreshCw size={13} className={loading ? 'animate-spin text-white' : 'text-slate-300'} />
                  <span>Refresh Data</span>
                </button>
              </div>

              {/* Cards Grid */}
              {loading ? (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
                  <div className="animate-pulse space-y-3">
                    <span className="text-4xl block">⏳</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white">Loading Appointments...</p>
                    <p className="text-xs text-slateText dark:text-slate-400">Fetching your OPD consultation records</p>
                  </div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
                  <span className="text-5xl block">📋</span>
                  <p className="text-sm font-bold text-darkNavy dark:text-white">No Appointments Found</p>
                  <p className="text-xs text-slateText dark:text-slate-400 max-w-sm mx-auto">
                    {searchTerm ? 'No results match your search query. Try different keywords.' : 'You have no appointments in this category yet.'}
                  </p>
                  <button onClick={() => setActiveNav('book')}
                    className="inline-block bg-primary hover:bg-primaryDark text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition mt-2 cursor-pointer">
                    📅 Book OPD Appointment
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAppointments.map(a => (
                    <AppointmentCard key={a._id} appointment={a} onCancel={openCancelModal} onReschedule={openRescheduleModal} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════ MEDICAL RECORDS ═══════ */}
          {activeNav === 'records' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-lg">Medical Records & Prescriptions</h2>
                  <p className="text-xs text-slateText dark:text-slate-400">Your uploaded lab reports, prescriptions, and medical documents.</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slateText dark:text-slate-400">Loading...</div>
              ) : records.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-5xl block">📄</span>
                  <p className="text-sm font-bold text-darkNavy dark:text-white">No Medical Records Found</p>
                  <p className="text-xs text-slateText dark:text-slate-400 max-w-sm mx-auto">Your digital prescriptions and lab reports from doctor consultations will appear here.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {records.map(r => (
                    <div key={r._id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-sm">{r.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">{r.recordType}</span>
                      </div>
                      {r.aiSummary && <p className="text-xs text-slateText dark:text-slate-400 italic">{r.aiSummary}</p>}
                      <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-primary text-xs font-bold hover:underline">📥 Download / View</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════ PROFILE ═══════ */}
          {activeNav === 'profile' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="font-poppins font-extrabold text-darkNavy dark:text-white text-xl sm:text-2xl flex items-center gap-2">
                  <span>👤</span>
                  <span>My Health Profile & Account Security</span>
                </h2>
                <p className="text-xs text-slateText dark:text-slate-400 mt-1">
                  Manage your patient details, contact numbers, email address, and security credentials.
                </p>
              </div>

              {/* 3-Container Section Layout */}
              {/* 2-Column Responsive Grid Layout for Profile Containers */}
              <div className="grid lg:grid-cols-2 gap-6 items-stretch">
                
                {/* ──────── CONTAINER 1: ABOUT PATIENT ──────── */}
                {/* Mobile Order: 1st | Desktop: Row 1 Left */}
                <div className="order-1 lg:order-1 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-5 h-full">
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-500/20">
                          🩺
                        </div>
                        <div>
                          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base">About Patient Information</h3>
                          <p className="text-[11px] text-slateText dark:text-slate-400">Personal details & medical demographics</p>
                        </div>
                      </div>

                      {!isEditingSection1 ? (
                        <button
                          onClick={() => setIsEditingSection1(true)}
                          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-sky-400 text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-blue-500/20 cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleCancelSection1}
                          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 border border-slate-300 dark:border-slate-700 cursor-pointer active:scale-95"
                        >
                          <span>✕</span>
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>

                    {!isEditingSection1 ? (
                      /* Read-Only Data Cards */
                      <div className="space-y-3.5">
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3 shadow-2xs">
                          <div>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</p>
                            <p className="text-sm font-bold text-darkNavy dark:text-white mt-0.5">{profileForm.fullName || profile?.fullName || user?.fullName || 'Not Provided'}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/50 text-xs">
                            <div>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Gender</p>
                              <p className="font-bold text-darkNavy dark:text-white mt-0.5">{profileForm.gender || 'Not Set'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Age</p>
                              <p className="font-bold text-darkNavy dark:text-white mt-0.5">{profileForm.age ? `${profileForm.age} Yrs` : 'Not Set'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Blood Group</p>
                              <p className="font-extrabold text-rose-500 dark:text-rose-400 mt-0.5">{profileForm.bloodGroup || 'Not Set'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-2.5">
                            <span className="text-base mt-0.5">📍</span>
                            <div>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Residential Address</p>
                              <p className="text-xs font-semibold text-darkNavy dark:text-slate-200 mt-0.5">{profileForm.address || 'No residential address recorded'}</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2.5">
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-2.5">
                              <span className="text-base mt-0.5">🚨</span>
                              <div>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Emergency Phone</p>
                                <p className="text-xs font-bold text-darkNavy dark:text-slate-200 mt-0.5">{profileForm.emergencyContact || 'Not Provided'}</p>
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-2.5">
                              <span className="text-base mt-0.5">🛡️</span>
                              <div>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Insurance Provider</p>
                                <p className="text-xs font-bold text-darkNavy dark:text-slate-200 mt-0.5">{profileForm.insuranceProvider || 'Not Specified'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-2.5">
                            <span className="text-base mt-0.5">⚠️</span>
                            <div>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Known Allergies / Medical Notes</p>
                              <p className="text-xs font-semibold text-darkNavy dark:text-slate-200 mt-0.5">{profileForm.allergies || 'None Specified'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Editable Form Inputs */
                      <form id="patient-info-form" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4 animate-fade-in">
                        <div>
                          <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Full Name *</label>
                          <input type="text" required value={profileForm.fullName} onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Enter your full name"
                            className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Gender</label>
                            <select value={profileForm.gender} onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))}
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium">
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Age (Years)</label>
                            <input type="number" min="1" max="120" value={profileForm.age} onChange={e => setProfileForm(p => ({ ...p, age: e.target.value }))} placeholder="Age"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Blood Group</label>
                            <select value={profileForm.bloodGroup} onChange={e => setProfileForm(p => ({ ...p, bloodGroup: e.target.value }))}
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium">
                              <option value="">Select</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Residential Address</label>
                          <input type="text" value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} placeholder="e.g. 123, Park Street, Kolkata"
                            className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Emergency Phone</label>
                            <input type="tel" maxLength={10} value={profileForm.emergencyContact} onChange={e => setProfileForm(p => ({ ...p, emergencyContact: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit number"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Insurance Provider</label>
                            <input type="text" value={profileForm.insuranceProvider} onChange={e => setProfileForm(p => ({ ...p, insuranceProvider: e.target.value }))} placeholder="e.g. Star Health"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Known Allergies / Medical Notes</label>
                          <input type="text" value={profileForm.allergies} onChange={e => setProfileForm(p => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin, Peanuts"
                            className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelSection1}
                            className="w-[30%] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700"
                          >
                            <span>✕</span>
                            <span>Cancel</span>
                          </button>
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="w-[70%] bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                          >
                            {savingProfile ? '⏳ Saving...' : '💾 Save Details'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* ──────── CONTAINER 2: CONTACT INFORMATION ──────── */}
                {/* Mobile Order: 2nd | Desktop: Row 1 Right */}
                <div className="order-2 lg:order-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-5 h-full">
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-bold text-base shadow-md shadow-teal-500/20">
                          📞
                        </div>
                        <div>
                          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base">Contact Information</h3>
                          <p className="text-[11px] text-slateText dark:text-slate-400">Primary email address & phone number</p>
                        </div>
                      </div>

                      {!isEditingSection2 ? (
                        <button
                          onClick={() => setIsEditingSection2(true)}
                          className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-300 text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-teal-500/20 cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleCancelSection2}
                          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 border border-slate-300 dark:border-slate-700 cursor-pointer active:scale-95"
                        >
                          <span>✕</span>
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>

                    {!isEditingSection2 ? (
                      /* Read-Only Contact Cards */
                      <div className="space-y-3.5">
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4 shadow-2xs">
                          <div className="py-1.5">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>✉️</span> Primary Email Address
                            </p>
                            <p className="text-sm font-extrabold text-darkNavy dark:text-white mt-1.5 truncate">{profileForm.email || user?.email || 'Not Provided'}</p>
                          </div>
                          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/50 py-1.5">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>📱</span> Primary Phone Number
                            </p>
                            <p className="text-sm font-extrabold text-darkNavy dark:text-white mt-1.5">{profileForm.phone || user?.phone || 'Not Provided'}</p>
                          </div>
                        </div>

                        {/* Password Management Sub-Card */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/50 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">🔑</span>
                              <span className="text-xs font-bold text-darkNavy dark:text-white">Password Management</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsEditingPassword(true)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs transition shadow-md shadow-purple-500/20 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                            >
                              <KeyRound size={13} />
                              <span>Change Password</span>
                            </button>
                          </div>

                          <p className="text-[10px] text-purple-700 dark:text-purple-300 leading-relaxed">
                            Regularly update your account password for enhanced account protection.
                          </p>

                          {/* Masked Password Display */}
                          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-purple-800/50">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Password</span>
                              <p className="font-mono text-sm font-extrabold text-darkNavy dark:text-white tracking-[0.2em] mt-0.5">
                                *******************
                              </p>
                            </div>
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1 shadow-2xs">
                              🔒 Encrypted
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Editable Contact Form */
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Primary Email Address *</label>
                            <input type="email" required value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} placeholder="Enter your email"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Primary Phone Number *</label>
                            <input type="tel" required maxLength={10} value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit phone number"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelSection2}
                            className="w-[30%] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700"
                          >
                            <span>✕</span>
                            <span>Cancel</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="w-[70%] bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                          >
                            {savingProfile ? '⏳ Saving...' : '💾 Save Contact Info'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Change Password Modal Popup */}
                {isEditingPassword && (
                  <div className="fixed inset-0 z-[90] bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4 my-6">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                            <span>🔑</span>
                            <span>Change Account Password</span>
                          </h3>
                          <p className="text-[11px] text-slateText dark:text-slate-400 mt-0.5">
                            Update your account password securely.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setIsEditingPassword(false); setPasswordMsg({ type: '', text: '' }); }}
                          className="text-slate-400 hover:text-darkNavy dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleChangePassword} className="space-y-4">
                        {passwordMsg.text && (
                          <div className={`p-3 rounded-xl text-xs font-bold border ${
                            passwordMsg.type === 'success'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}>
                            {passwordMsg.type === 'success' ? '✅ ' : '⚠️ '}{passwordMsg.text}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-darkNavy dark:text-white">Current Password *</label>
                            <Link
                              to="/forgot-password"
                              state={{ email: profileForm.email || user?.email, autoSend: true }}
                              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                            >
                              Forgot Password?
                            </Link>
                          </div>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">New Password *</label>
                            <input
                              type="password"
                              required
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Confirm New Password *</label>
                            <input
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              placeholder="Re-type new password"
                              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                            />
                          </div>
                        </div>

                        {/* Interactive Password Match Progress Bar */}
                        {confirmPassword.length > 0 && (
                          <div className="space-y-1.5 mt-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className={newPassword === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                {newPassword === confirmPassword ? '✓ Passwords Match' : 'Password Mismatch'}
                              </span>
                              <span className={newPassword === confirmPassword ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-rose-600 dark:text-rose-400 font-extrabold'}>
                                {newPassword === confirmPassword ? 100 : Math.round((Array.from(confirmPassword).filter((char, i) => char === newPassword[i]).length / Math.max(newPassword.length, confirmPassword.length)) * 100)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                  newPassword === confirmPassword ? 'bg-emerald-500 shadow-xs' : 'bg-rose-500'
                                }`}
                                style={{ width: `${newPassword === confirmPassword ? 100 : Math.round((Array.from(confirmPassword).filter((char, i) => char === newPassword[i]).length / Math.max(newPassword.length, confirmPassword.length)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => { setIsEditingPassword(false); setPasswordMsg({ type: '', text: '' }); }}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={changingPassword || !currentPassword || !newPassword}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
                          >
                            {changingPassword ? 'Changing...' : '🔐 Update Password'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* ──────── CONTAINER 3: ACTIVE SESSION SIGN OUT ──────── */}
                {/* Left Column Below About Info */}
                <div className="order-3 lg:order-3 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-base shadow-md shadow-amber-500/20">
                          🚪
                        </div>
                        <div>
                          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base">Active Session Sign Out</h3>
                          <p className="text-[11px] text-slateText dark:text-slate-400">Log out of your active patient portal session</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-darkNavy dark:text-white flex items-center gap-2">
                            <LogOut className="w-4 h-4 text-amber-500" />
                            <span>Active Portal Session</span>
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              ● Active Now
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            Logged in as <span className="font-mono font-bold text-darkNavy dark:text-white">{profileForm.email || user?.email}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLogoutConfirm(true)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2 border border-slate-700 active:scale-95 shrink-0"
                        >
                          <LogOut className="w-4 h-4 text-amber-400" />
                          <span>Sign Out Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ──────── CONTAINER 4: DANGER ZONE & DELETE ACCOUNT ──────── */}
                {/* Right Column Below Contact Info */}
                <div className="order-4 lg:order-4 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-rose-200/80 dark:border-rose-900/40 shadow-card flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-4">
                    <div className="border-b border-rose-100 dark:border-rose-900/30 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-rose-500/20">
                          <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base">Danger Zone & Account Deletion</h3>
                          <p className="text-[11px] text-slateText dark:text-slate-400">Permanently erase patient profile and medical data</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 to-red-50/40 dark:from-rose-950/30 dark:to-red-950/20 border border-rose-200/80 dark:border-rose-900/60 space-y-3 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            <span>Delete Account Profile</span>
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            Permanently delete your account and erase all health records.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmModal(true)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs transition shadow-md shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-rose-500/30 active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ═══════ AI HEALTH ASSISTANT ═══════ */}
          {activeNav === 'ai' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-card text-center space-y-4">
                <span className="text-5xl block">🤖</span>
                <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-xl">AI Health Assistant</h2>
                <p className="text-xs text-slateText dark:text-slate-400 max-w-md mx-auto">
                  Our AI-powered symptom checker and health guidance tool helps you understand your symptoms and provides preliminary clinical recommendations. This feature is coming soon.
                </p>
                <div className="inline-block bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-bold px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
                  🚧 Feature Coming Soon — Under Clinical Development
                </div>
              </div>
            </div>
          )}

          {/* ═══════ PATIENT FEEDBACK & RATING ═══════ */}
          {activeNav === 'feedback' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-xl flex items-center gap-2">
                    <span>💬</span>
                    <span>Patient Experience & Care Feedback</span>
                  </h2>
                  <p className="text-xs text-slateText dark:text-slate-400 mt-1">
                    Your feedback helps Brainware Medical College & Hospital continuously improve clinical quality and patient care.
                  </p>
                </div>

                {feedbackSubmitted ? (
                  <div className="py-8 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-4xl block">🎉</span>
                    <h3 className="font-poppins font-bold text-emerald-800 dark:text-emerald-300 text-lg">Thank You for Your Feedback!</h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                      Your ratings and comments have been recorded and shared with our Patient Care Quality Assurance team.
                    </p>
                    <button onClick={() => setFeedbackSubmitted(false)} className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer mt-2">
                      Submit Another Feedback
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                    {/* Rating Stars */}
                    <div>
                      <label className="block text-xs font-bold text-darkNavy dark:text-white mb-2">Overall Experience Rating *</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => setFeedbackRating(star)} className="text-2xl transition hover:scale-125 cursor-pointer">
                            {star <= feedbackRating ? '⭐' : '☆'}
                          </button>
                        ))}
                        <span className="text-xs font-bold text-primary ml-2 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                          {feedbackRating === 5 ? '🌟 Excellent' : feedbackRating === 4 ? '👍 Good' : feedbackRating === 3 ? '😐 Average' : feedbackRating === 2 ? '👎 Poor' : '⚠️ Very Poor'}
                        </span>
                      </div>
                    </div>

                    {/* Service Category */}
                    <div>
                      <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1.5">Feedback Category *</label>
                      <select value={feedbackCategory} onChange={e => setFeedbackCategory(e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="OPD Consultation">OPD Consultation & Waiting Time</option>
                        <option value="Doctor & Clinical Care">Doctor Attentiveness & Clinical Care</option>
                        <option value="Reception & Staff">Reception Desk & Support Staff</option>
                        <option value="Hospital Cleanliness & Facilities">Hospital Infrastructure & Cleanliness</option>
                        <option value="Digital Portal Experience">Digital Appointment Portal & Features</option>
                      </select>
                    </div>

                    {/* Comments */}
                    <div>
                      <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1.5">Detailed Comments & Suggestions *</label>
                      <textarea rows={4} required value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                        placeholder="Tell us what went well or what we can improve..."
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <button type="submit" disabled={submittingFeedback || !feedbackText.trim()}
                      className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-60 cursor-pointer">
                      {submittingFeedback ? 'Submitting...' : '📩 Send Feedback'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ═══════ NOTICES ═══════ */}
          {activeNav === 'notices' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-lg">📢 Hospital Bulletins & Notices</h2>
              {notices.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-5xl block">📢</span>
                  <p className="text-sm font-bold text-darkNavy dark:text-white">No Notices Available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.map((n, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-card">
                      <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-sm">{n.title || 'Notice'}</h3>
                      <p className="text-xs text-slateText dark:text-slate-400 mt-1">{n.content || n.message || ''}</p>
                      {n.createdAt && <p className="text-[10px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ═══════ EMERGENCY SOS MODAL ═══════ */}
      {showSosModal && (
        <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-rose-200 dark:border-rose-800 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center text-3xl mx-auto border border-rose-200 dark:border-rose-800">🚨</div>
            <div>
              <h3 className="font-poppins font-extrabold text-rose-600 text-xl">Emergency Assistance Hotline</h3>
              <p className="text-xs text-slateText dark:text-slate-400 mt-1">Brainware Medical College & Hospital 24/7 Emergency Response Unit</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 space-y-2 text-left text-xs">
              <p className="font-bold text-rose-900 dark:text-rose-200">Immediate Contacts:</p>
              <p className="text-rose-800 dark:text-rose-300">🚑 Ambulance Emergency: <span className="font-bold">102 / 033-2587-8000</span></p>
              <p className="text-rose-800 dark:text-rose-300">🏥 Emergency Desk: <span className="font-bold">+91 98765 43210</span></p>
              <p className="text-rose-800 dark:text-rose-300">📍 Casualty Ward: Gate No. 1, Hospital Building</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowSosModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer">Close</button>
              <a href="tel:102" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1">📞 Call Ambulance (102)</a>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ LOGOUT CONFIRM MODAL ═══════ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center text-2xl mx-auto border border-rose-200 dark:border-rose-800">🔒</div>
            <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg">Sign Out?</h3>
            <p className="text-xs text-slateText dark:text-slate-400">You will be redirected to the login page.</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer">Cancel</button>
              <button onClick={handleLogout} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs cursor-pointer">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ DELETE ACCOUNT CONFIRM MODAL ═══════ */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-rose-300 dark:border-rose-800 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-300 dark:border-rose-800">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-rose-600 dark:text-rose-400 text-lg">Delete Account Permanently?</h3>
              <p className="text-xs text-slateText dark:text-slate-400 mt-1 leading-relaxed">This action cannot be undone. All your patient health records, profile data, and appointment history will be permanently deleted.</p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="w-[30%] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="w-[70%] bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deletingAccount ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══════ CANCEL APPOINTMENT MODAL ═══════ */}
      {cancelModalAppointment && (
        <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-rose-200 dark:border-rose-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                <span>❌</span>
                <span>Cancel Appointment</span>
              </div>
              <button onClick={() => setCancelModalAppointment(null)} className="text-slate-400 hover:text-white font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/20 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-xs space-y-1">
              <p className="font-bold text-rose-900 dark:text-rose-200">
                {cancelModalAppointment.doctor?.user?.fullName || cancelModalAppointment.doctor?.fullName ? `Dr. ${cancelModalAppointment.doctor?.user?.fullName || cancelModalAppointment.doctor?.fullName}` : 'Specialist Doctor'}
              </p>
              <p className="text-rose-700 dark:text-rose-300">
                📅 {cancelModalAppointment.appointmentDate} • ⏰ {cancelModalAppointment.appointmentTime}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkNavy dark:text-white mb-2">Reason for Cancellation</label>
              <div className="space-y-2">
                {['Schedule Conflict', 'Feeling Better / Recovery', 'Booked by Mistake', 'Other Reason'].map(r => (
                  <label key={r} className="flex items-center gap-2 text-xs text-darkNavy dark:text-slate-200 font-semibold cursor-pointer">
                    <input type="radio" name="cancelReason" value={r} checked={cancelReasonOption === r} onChange={e => setCancelReasonOption(e.target.value)} className="accent-rose-600" />
                    <span>{r}</span>
                  </label>
                ))}
                {cancelReasonOption === 'Other Reason' && (
                  <input type="text" placeholder="Please specify reason..." value={customCancelReason} onChange={e => setCustomCancelReason(e.target.value)}
                    className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 mt-1" />
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setCancelModalAppointment(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-3 rounded-xl transition cursor-pointer">
                Keep Appointment
              </button>
              <button onClick={confirmCancelAppointment} disabled={cancelling} className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md cursor-pointer disabled:opacity-60">
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ RESCHEDULE APPOINTMENT MODAL ═══════ */}
      {rescheduleModalAppointment && (
        <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-indigo-200 dark:border-indigo-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                <span>🔄</span>
                <span>Reschedule Appointment</span>
              </div>
              <button onClick={() => setRescheduleModalAppointment(null)} className="text-slate-400 hover:text-white font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-1">
              <p className="font-bold text-indigo-900 dark:text-indigo-200">
                {rescheduleModalAppointment.doctor?.user?.fullName || rescheduleModalAppointment.doctor?.fullName ? `Dr. ${rescheduleModalAppointment.doctor?.user?.fullName || rescheduleModalAppointment.doctor?.fullName}` : 'Specialist Doctor'}
              </p>
              <p className="text-indigo-700 dark:text-indigo-300">
                Current: 📅 {rescheduleModalAppointment.appointmentDate} • ⏰ {rescheduleModalAppointment.appointmentTime}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">New Appointment Date *</label>
                <input type="date" required value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">New Appointment Time *</label>
                <input type="time" required value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setRescheduleModalAppointment(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-3 rounded-xl transition cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmRescheduleAppointment} disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                className="flex-1 bg-primary hover:bg-primaryDark text-white font-bold text-xs py-3 rounded-xl transition shadow-md cursor-pointer disabled:opacity-60">
                {rescheduling ? 'Updating...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ FLOATING TOAST NOTIFICATION BANNER ═══════ */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[100] animate-bounce-in max-w-sm">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-500/50 shadow-emerald-950/40'
              : toast.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-500/50 shadow-rose-950/40'
              : 'bg-slate-900/95 text-white border-slate-700/50'
          }`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {toast.type === 'success' ? '✓' : '✕'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-snug">{toast.message}</p>
            </div>
            <button onClick={() => setToast(t => ({ ...t, show: false }))} className="text-slate-400 hover:text-white font-bold text-xs p-1 cursor-pointer">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
