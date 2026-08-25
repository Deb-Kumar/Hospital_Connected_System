import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Sun,
  Moon,
  Search,
  RefreshCw,
  KeyRound,
  UserCheck,
  Calendar,
  Clock,
  FileText,
  Activity,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  Palmtree,
  Users,
  UserPlus,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle2,
  XCircle,
  Printer,
  Sparkles,
  MessageSquare,
  BadgeCheck,
  Building2,
} from 'lucide-react';

function StaffHeroBanner({ title, subtitle, designationBadge, bgGradient = 'from-blue-900 via-darkNavy to-indigo-900' }) {
  return (
    <div className={`bg-gradient-to-r ${bgGradient} text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden`}>
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-sky-200 border border-white/10 mb-3">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            Duty Desk Active • {designationBadge?.desc || 'Hospital Staff Operations'}
          </div>
          <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-2 self-start md:self-auto items-end shrink-0">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white border border-white/20">
            {designationBadge?.label || 'STAFF'}
          </span>
          <span className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active On Duty
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State: 'overview' | 'today_queue' | 'unassigned' | 'walkin' | 'search' | 'inquiries' | 'profile'
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [queue, setQueue] = useState([]);
  const [unassignedQueue, setUnassignedQueue] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [staffProfile, setStaffProfile] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [assignDoctorMap, setAssignDoctorMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Filter State
  const [queueFilter, setQueueFilter] = useState('ALL'); // 'ALL' | 'BOOKED' | 'CHECKED_IN' | 'COMPLETED'

  // Modals & Action States
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifyPopup, setNotifyPopup] = useState(null);

  // Staff Leave States
  const [showStaffLeaveModal, setShowStaffLeaveModal] = useState(false);
  const [staffLeaveReason, setStaffLeaveReason] = useState('');
  const [staffLeaveStartDate, setStaffLeaveStartDate] = useState('');
  const [staffLeaveEndDate, setStaffLeaveEndDate] = useState('');
  const [staffLeaveRequests, setStaffLeaveRequests] = useState([]);
  const [submittingStaffLeave, setSubmittingStaffLeave] = useState(false);

  const totalLeaveDays = useMemo(() => {
    if (!staffLeaveStartDate || !staffLeaveEndDate) return 0;
    const start = new Date(staffLeaveStartDate);
    const end = new Date(staffLeaveEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [staffLeaveStartDate, staffLeaveEndDate]);

  async function handleStaffLeaveSubmit(e) {
    e.preventDefault();
    if (!staffLeaveReason.trim() || !staffLeaveStartDate || !staffLeaveEndDate) {
      showNotify('error', 'Validation Error', 'Please specify reason, start date, and end date.');
      return;
    }
    if (new Date(staffLeaveEndDate) < new Date(staffLeaveStartDate)) {
      showNotify('error', 'Validation Error', 'End date cannot be before start date.');
      return;
    }
    setSubmittingStaffLeave(true);
    try {
      await axiosClient.post('/staff/leave-request', {
        reason: staffLeaveReason.trim(),
        startDate: staffLeaveStartDate,
        endDate: staffLeaveEndDate,
        totalDays: totalLeaveDays,
      });
      showNotify('success', 'Leave Application Submitted', 'Your leave request has been submitted for Admin approval.');
      setShowStaffLeaveModal(false);
      setStaffLeaveReason('');
      setStaffLeaveStartDate('');
      setStaffLeaveEndDate('');
      loadStaffData();
    } catch (err) {
      showNotify('error', 'Submission Failed', err.response?.data?.message || 'Failed to submit leave application.');
    } finally {
      setSubmittingStaffLeave(false);
    }
  }

  async function handleStaffResumeDuty() {
    try {
      await axiosClient.put('/staff/leave', null, { params: { onLeave: false, reason: '' } });
      showNotify('success', 'Duty Resumed', 'Welcome back! Your status is now ON DUTY.');
      loadStaffData();
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to update duty status.');
    }
  }

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dark Theme Sync
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    setTimeout(() => setNotifyPopup(null), 4000);
  }

  // Load All Staff Data
  const loadStaffData = async () => {
    setLoading(true);
    try {
      const [todayRes, unassignedRes, docRes, profileRes, inquiriesRes, leaveReqsRes] = await Promise.allSettled([
        axiosClient.get('/appointments/today'),
        axiosClient.get('/appointments/unassigned'),
        axiosClient.get('/doctor/all'),
        axiosClient.get('/staff/profile'),
        axiosClient.get('/contact/all').catch(() => ({ data: [] })),
        axiosClient.get('/staff/leave-requests'),
      ]);

      if (todayRes.status === 'fulfilled') setQueue(todayRes.value.data || []);
      if (unassignedRes.status === 'fulfilled') setUnassignedQueue(unassignedRes.value.data || []);
      if (docRes.status === 'fulfilled') setDoctorsList(docRes.value.data || []);
      if (inquiriesRes.status === 'fulfilled') setInquiries(inquiriesRes.value.data || []);
      if (leaveReqsRes.status === 'fulfilled') setStaffLeaveRequests(leaveReqsRes.value.data?.requests || []);

      if (profileRes.status === 'fulfilled' && profileRes.value.data) {
        setStaffProfile(profileRes.value.data);
      }
    } catch (err) {
      console.error('Error loading staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, [user]);

  // Handle Doctor Assignment
  async function handleAssignDoctor(appointmentId) {
    const targetDoctorId = assignDoctorMap[appointmentId];
    if (!targetDoctorId) {
      showNotify('error', 'Selection Required', 'Please select a doctor from the dropdown before assigning.');
      return;
    }
    try {
      await axiosClient.put(`/appointments/${appointmentId}/assign-doctor`, { doctorId: targetDoctorId });
      showNotify('success', 'Doctor Dispatched', 'Doctor assigned successfully! Appointment sent to doctor portal.');
      loadStaffData();
    } catch (err) {
      showNotify('error', 'Assignment Failed', err.response?.data?.message || 'Failed to assign doctor.');
    }
  }

  // Handle Patient Search
  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const { data } = await axiosClient.get('/staff/search', { params: { query: searchQuery } });
      setSearchResults(data || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  // Check-in / Check-out Handlers
  async function handleCheckIn(appointment) {
    try {
      await axiosClient.put(`/staff/appointments/${appointment._id}/check-in`);
      showNotify('success', 'Patient Checked In', `${appointment.patient?.user?.fullName || 'Patient'} checked in at desk.`);
      loadStaffData();
    } catch (err) {
      showNotify('error', 'Check-in Failed', err.response?.data?.message || 'Failed to check-in patient.');
    }
  }

  async function handleCheckOut(appointment) {
    try {
      await axiosClient.put(`/staff/appointments/${appointment._id}/check-out`);
      showNotify('success', 'Patient Checked Out', `${appointment.patient?.user?.fullName || 'Patient'} consultation completed.`);
      loadStaffData();
    } catch (err) {
      showNotify('error', 'Check-out Failed', err.response?.data?.message || 'Failed to check-out patient.');
    }
  }

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    if (queueFilter === 'ALL') return queue;
    return queue.filter((a) => a.status === queueFilter);
  }, [queue, queueFilter]);

  // Walk-in History (Last 24 Hours)
  const walkinHistory = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return queue.filter((apt) => {
      const createdDate = apt.createdAt ? new Date(apt.createdAt) : (apt.appointmentDate ? new Date(apt.appointmentDate) : new Date());
      return createdDate >= twentyFourHoursAgo;
    });
  }, [queue]);

  // Analytics Metrics
  const stats = useMemo(() => {
    const total = queue.length;
    const checkedIn = queue.filter((a) => a.status === 'CHECKED_IN').length;
    const completed = queue.filter((a) => a.status === 'COMPLETED').length;
    const pendingUnassigned = unassignedQueue.length;
    return { total, checkedIn, completed, pendingUnassigned };
  }, [queue, unassignedQueue]);

  // Designation Info
  const designationBadge = useMemo(() => {
    const desig = staffProfile?.designation || user?.designation || 'OPD_DESK';
    const MAP = {
      RECEPTIONIST: { label: '📋 OPD RECEPTION', desc: 'General OPD Reception & Registration' },
      OPD_DESK: { label: '🩺 OPD DESK', desc: 'OPD Token Counter & Patient Queue Manager' },
      OPERATION_THEATER: { label: '✂️ OPERATION THEATER', desc: 'OT Surgery Scheduling & Desk' },
      BILLING_DESK: { label: '💳 BILLING DESK', desc: 'Billing, Cashier & Receipts' },
      PHARMACY_DESK: { label: '💊 PHARMACY DESK', desc: 'Pharmacy & Prescription Dispensing' },
      PATIENT_CARE: { label: '💬 PATIENT CARE', desc: 'Patient Support & Helpdesk' },
    };
    return MAP[desig] || { label: `📋 ${desig.replace('_', ' ')}`, desc: 'Hospital Staff Operations' };
  }, [staffProfile, user]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200 flex">
      {/* Toast Notification Popup */}
      {notifyPopup && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold text-white ${
            notifyPopup.type === 'success'
              ? 'bg-emerald-600 border-emerald-500'
              : 'bg-rose-600 border-rose-500'
          }`}>
            <span className="text-lg">{notifyPopup.type === 'success' ? '✓' : '⚠️'}</span>
            <div>
              <p className="font-extrabold">{notifyPopup.title}</p>
              <p className="font-medium opacity-90 text-[11px]">{notifyPopup.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-darkNavy dark:bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Brand Logo */}
        <div>
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
              className="hidden lg:flex w-8 h-8 rounded-full bg-slate-800/90 hover:bg-purple-600 text-slate-300 hover:text-white items-center justify-center border border-slate-700/80 shadow-md transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Section: Main Desk */}
            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Main Desk
                </p>
              )}
              <div className="space-y-1">
                <NavItem
                  icon={<Activity size={18} />}
                  label="Desk Overview"
                  active={activeNav === 'overview'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('overview'); setIsMobileSidebarOpen(false); }}
                />
                <NavItem
                  icon={<Calendar size={18} />}
                  label="Today's Queue"
                  badge={queue.length > 0 ? queue.length : null}
                  active={activeNav === 'today_queue'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('today_queue'); setIsMobileSidebarOpen(false); }}
                />
                <NavItem
                  icon={<AlertCircle size={18} />}
                  label="Unassigned Bookings"
                  badge={unassignedQueue.length > 0 ? unassignedQueue.length : null}
                  badgeColor="bg-amber-500"
                  active={activeNav === 'unassigned'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('unassigned'); setIsMobileSidebarOpen(false); }}
                />
              </div>
            </div>

            {/* Section: Operations */}
            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Counter Operations
                </p>
              )}
              <div className="space-y-1">
                <NavItem
                  icon={<UserPlus size={18} />}
                  label="Walk-in Registration"
                  active={activeNav === 'walkin'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('walkin'); setIsMobileSidebarOpen(false); }}
                />
                <NavItem
                  icon={<Search size={18} />}
                  label="Patient Lookup"
                  active={activeNav === 'search'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('search'); setIsMobileSidebarOpen(false); }}
                />
                <NavItem
                  icon={<MessageSquare size={18} />}
                  label="Patient Support"
                  badge={inquiries.length > 0 ? inquiries.length : null}
                  badgeColor="bg-indigo-500"
                  active={activeNav === 'inquiries'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('inquiries'); setIsMobileSidebarOpen(false); }}
                />
                <NavItem
                  icon={<Palmtree size={18} />}
                  label="Leave Manager"
                  badge={staffProfile?.onLeave ? 'ON LEAVE' : null}
                  badgeColor="bg-amber-500 text-white font-mono"
                  active={activeNav === 'leave'}
                  collapsed={isSidebarCollapsed}
                  onClick={() => { setActiveNav('leave'); setIsMobileSidebarOpen(false); }}
                />
              </div>
            </div>

          </nav>
        </div>

        {/* Staff User Profile Bottom Card (Matches Admin Dashboard layout) */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <button
            type="button"
            onClick={() => { setActiveNav('profile'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
              activeNav === 'profile'
                ? 'bg-sky-500/20 border-sky-500/50 ring-1 ring-sky-500/30'
                : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80'
            }`}
            title="View Staff Profile & Account Settings"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs border border-sky-500/30 shrink-0">
              📋
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden text-left min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Staff Member'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
              </div>
            )}
          </button>
          {!isSidebarCollapsed && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <LogOut size={14} />
              <span>Sign Out Staff</span>
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs z-30 lg:hidden"
        ></div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR HEADER */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-darkNavy dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition cursor-pointer shrink-0 shadow-2xs"
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

            {/* Page Header Title (Matches Active Section like Admin) */}
            <div>
              <h2 className="font-poppins font-extrabold text-base sm:text-lg text-darkNavy dark:text-white flex items-center gap-2">
                <span>
                  {activeNav === 'overview' && 'Dashboard Overview'}
                  {activeNav === 'today_queue' && "Today's OPD Queue"}
                  {activeNav === 'unassigned' && 'Unassigned OPD Bookings'}
                  {activeNav === 'walkin' && 'Walk-in Patient Registration'}
                  {activeNav === 'search' && 'Patient Directory Lookup'}
                  {activeNav === 'inquiries' && 'Patient Support & Desk Inquiries'}
                  {activeNav === 'leave' && 'Staff Absence & Leave Manager'}
                  {activeNav === 'profile' && 'Staff Profile & Privileges'}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                  {designationBadge.label}
                </span>
              </h2>
            </div>
          </div>

          {/* Right Header Widget Controls (Identical to Admin & Doctor Portals) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Refresh Button */}
            <button
              onClick={loadStaffData}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700/80 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-white' : 'text-slate-300'} />
              <span className="font-extrabold text-white text-xs hidden xs:inline">Refresh Data</span>
            </button>

            {/* Live Clock Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs whitespace-nowrap shrink-0">
              <Clock size={14} className="text-sky-500 shrink-0" />
              <span className="font-mono font-extrabold text-darkNavy dark:text-sky-300 tracking-wider">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
              <span className="text-slate-400 font-extrabold">•</span>
              <span className="font-bold text-darkNavy dark:text-white">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Theme Switcher */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>

            {/* User Profile Badge Widget & 2-Option Dropdown Menu (Matches Admin & Doctor Portals) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="h-10 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-2xl shadow-2xs hover:ring-2 hover:ring-sky-500/30 transition cursor-pointer"
                title="Account Options"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-poppins font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'ST'}
                </div>
                <div className="flex flex-col text-left leading-tight hidden xs:flex">
                  <span className="font-poppins font-bold text-darkNavy dark:text-white text-xs truncate max-w-[110px]">
                    {user?.fullName || 'Staff Member'}
                  </span>
                  <span className="text-[9px] font-extrabold text-sky-600 dark:text-sky-400 uppercase">
                    {user?.role || 'STAFF'}
                  </span>
                </div>
              </button>

              {/* 2-Option Dropdown Menu Popup (Profile & Logout) */}
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn z-50 space-y-1">
                    {/* Option 1: Profile */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setActiveNav('profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-darkNavy dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <span>👤</span>
                      <span>Profile & Privileges</span>
                    </button>

                    {/* Option 2: Logout */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* DASHBOARD PAGE CONTENT */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* TAB 1: DESK OVERVIEW */}
          {activeNav === 'overview' && (
            <div className="space-y-6 animate-page-slide-left">
              {/* Hero Banner */}
              <StaffHeroBanner
                title={`Welcome back, ${user?.fullName || 'Staff Member'} 👋`}
                subtitle="Manage today's OPD token queue, check-in walk-in patients, assign requested doctors, and assist patient inquiries."
                designationBadge={designationBadge}
                bgGradient="from-blue-900 via-darkNavy to-indigo-900"
              />

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Calendar size={22} className="text-sky-600 dark:text-sky-400" />}
                  title="Today's Scheduled"
                  value={stats.total}
                  bg="bg-sky-500/10"
                  borderColor="border-sky-200 dark:border-sky-800"
                />
                <StatCard
                  icon={<UserCheck size={22} className="text-emerald-600 dark:text-emerald-400" />}
                  title="Checked-In at Desk"
                  value={stats.checkedIn}
                  bg="bg-emerald-500/10"
                  borderColor="border-emerald-200 dark:border-emerald-800"
                />
                <StatCard
                  icon={<AlertCircle size={22} className="text-amber-600 dark:text-amber-400" />}
                  title="Unassigned Bookings"
                  value={stats.pendingUnassigned}
                  bg="bg-amber-500/10"
                  borderColor="border-amber-200 dark:border-amber-800"
                />
                <StatCard
                  icon={<CheckCircle2 size={22} className="text-indigo-600 dark:text-indigo-400" />}
                  title="Completed Consultations"
                  value={stats.completed}
                  bg="bg-indigo-500/10"
                  borderColor="border-indigo-200 dark:border-indigo-800"
                />
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionBox
                  icon={<UserPlus className="text-sky-500" size={24} />}
                  title="Register Walk-in Patient"
                  desc="Register new patient directly at desk & issue instant OPD token."
                  onClick={() => setShowWalkInModal(true)}
                />
                <QuickActionBox
                  icon={<Stethoscope className="text-amber-500" size={24} />}
                  title="Dispatch Unassigned OPD"
                  desc={`Assign ${stats.pendingUnassigned} pending online bookings to available doctors.`}
                  onClick={() => setActiveNav('unassigned')}
                />
                <QuickActionBox
                  icon={<Search className="text-emerald-500" size={24} />}
                  title="Patient Directory Lookup"
                  desc="Search registered patient profile, contact history & medical details."
                  onClick={() => setActiveNav('search')}
                />
              </div>

              {/* Today's Queue Quick Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                    <span>Today's OPD Queue Preview</span>
                    <span className="text-xs font-semibold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2.5 py-0.5 rounded-full">
                      {queue.length} Total
                    </span>
                  </h3>
                  <button
                    onClick={() => setActiveNav('today_queue')}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Full Queue</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading today's OPD queue...</div>
                ) : queue.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <span className="text-3xl block">📋</span>
                    <p className="text-xs font-bold text-darkNavy dark:text-white">No OPD Appointments Today</p>
                    <p className="text-[11px] text-slate-400">Register walk-in patients or wait for online bookings.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {queue.slice(0, 5).map((apt) => (
                      <div key={apt._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-extrabold text-xs flex items-center justify-center border border-sky-200 dark:border-sky-800">
                            #{apt.queueNumber || apt.tokenNumber || '1'}
                          </div>
                          <div>
                            <p className="font-bold text-darkNavy dark:text-white">{apt.patient?.user?.fullName || 'Patient'}</p>
                            <p className="text-[11px] text-slate-400">
                              Dr. {apt.doctor?.user?.fullName || 'Doctor'} • Time: {apt.appointmentTime}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          apt.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : apt.status === 'CHECKED_IN'
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TODAY'S QUEUE */}
          {activeNav === 'today_queue' && (
            <div className="space-y-6 animate-page-slide-left">
              <StaffHeroBanner
                title="Today's OPD Queue & Check-ins 🎫"
                subtitle="Monitor the live desk queue, verify patient arrivals, update check-in status, and track consultation progress."
                designationBadge={designationBadge}
                bgGradient="from-sky-900 via-indigo-950 to-blue-900"
              />

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-base">
                      OPD Queue & Desk Check-ins
                    </h2>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                    {['ALL', 'BOOKED', 'CHECKED_IN', 'COMPLETED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setQueueFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition ${
                          queueFilter === st
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-darkNavy dark:hover:text-white'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading today's appointment queue...</div>
                ) : filteredQueue.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <span className="text-4xl block">📋</span>
                    <p className="text-sm font-bold text-darkNavy dark:text-white">No Appointments Found</p>
                    <p className="text-xs text-slate-400">No appointments matching the selected status filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredQueue.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-100/80 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-poppins font-extrabold text-base flex items-center justify-center border border-sky-300 dark:border-sky-800 shrink-0">
                            #{appointment.queueNumber || appointment.tokenNumber || '1'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-darkNavy dark:text-white text-sm">
                                {appointment.patient?.user?.fullName || appointment.patient?.fullName || 'Patient'}
                              </h3>
                              <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
                                {appointment.departmentName || 'General OPD'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Doctor: <strong className="text-darkNavy dark:text-white">Dr. {appointment.doctor?.user?.fullName || 'Doctor'}</strong> • Slot: <strong className="text-sky-600 dark:text-sky-400">{appointment.appointmentTime}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                            appointment.status === 'COMPLETED'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : appointment.status === 'CHECKED_IN'
                              ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}>
                            {appointment.status}
                          </span>

                          <button
                            onClick={() => handleCheckIn(appointment)}
                            disabled={appointment.status === 'COMPLETED'}
                            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40"
                          >
                            Check-in
                          </button>
                          <button
                            onClick={() => handleCheckOut(appointment)}
                            disabled={appointment.status === 'COMPLETED'}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40"
                          >
                            Check-out
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: UNASSIGNED BOOKINGS */}
          {activeNav === 'unassigned' && (
            <div className="space-y-6 animate-page-slide-left">
              <StaffHeroBanner
                title="🚨 Unassigned OPD Bookings"
                subtitle='These patients selected "Any Available Specialist". Select an active doctor from the department to assign and dispatch to their portal.'
                designationBadge={designationBadge}
                bgGradient="from-amber-800 via-amber-900 to-amber-950"
              />

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                      <span>Pending Doctor Assignment</span>
                      <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        {unassignedQueue.length} Remaining
                      </span>
                    </h2>
                  </div>
                </div>

                {unassignedQueue.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <span className="text-4xl block text-emerald-500">✓</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Unassigned Bookings Pending</p>
                    <p className="text-xs text-slate-400">All patient bookings have been dispatched to doctors.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unassignedQueue.map((apt) => (
                      <div
                        key={apt._id}
                        className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-darkNavy dark:text-white text-sm">
                              {apt.patient?.fullName || apt.patient?.user?.fullName || 'Patient'}
                            </h3>
                            <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {apt.departmentName || 'General Medicine'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Phone: <strong className="text-darkNavy dark:text-white">{apt.patient?.phone || apt.patient?.user?.phone || 'N/A'}</strong> • Date: <strong className="text-darkNavy dark:text-white">{apt.appointmentDate}</strong> • Slot: <strong className="text-darkNavy dark:text-white">{apt.appointmentTime}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-auto">
                          <select
                            value={assignDoctorMap[apt._id] || ''}
                            onChange={(e) => setAssignDoctorMap({ ...assignDoctorMap, [apt._id]: e.target.value })}
                            className="text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
                          >
                            <option value="">Select Doctor ({apt.departmentName || 'Dept'})...</option>
                            {doctorsList
                              .filter((d) => !apt.departmentName || d.specialization?.toLowerCase() === apt.departmentName?.toLowerCase() || d.department?.name?.toLowerCase() === apt.departmentName?.toLowerCase())
                              .map((d) => (
                                <option key={d._id} value={d._id}>
                                  Dr. {d.fullName || d.user?.fullName} ({d.specialization})
                                </option>
                              ))}
                          </select>

                          <button
                            onClick={() => handleAssignDoctor(apt._id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs active:scale-95 shrink-0"
                          >
                            Assign & Dispatch →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: WALKIN REGISTRATION */}
          {activeNav === 'walkin' && (
            <div className="space-y-6 animate-page-slide-left w-full">
              <StaffHeroBanner
                title="📝 Walk-in Patient Registration Counter"
                subtitle="Register counter walk-in patients directly, select available specialist doctors, and issue instant OPD consultation tokens."
                designationBadge={designationBadge}
                bgGradient="from-emerald-900 via-teal-950 to-indigo-950"
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT SIDE: Counter Registration Form (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-card space-y-5">
                  <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg flex items-center gap-2">
                      <span>📋 Counter Registration Form</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Fill in patient details to issue instant token & dispatch to OPD queue.
                    </p>
                  </div>

                  <WalkInFormInline onRegistered={loadStaffData} />
                </div>

                {/* RIGHT SIDE: Today's Walk-in Registrations History (5 cols - refreshes last 24h) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                        <span>🎟️ Tokens Issued Today</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Walk-in Bookings (Last 24 Hours)
                      </p>
                    </div>
                    <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-full shrink-0">
                      {walkinHistory.length} Total
                    </span>
                  </div>

                  {walkinHistory.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <span className="text-2xl block">🎫</span>
                      <p className="font-bold text-darkNavy dark:text-slate-200">No walk-in tokens issued in last 24h</p>
                      <p className="text-[11px] text-slate-400">Tokens issued at the counter will appear here in real-time.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                      {walkinHistory.map((apt) => (
                        <div key={apt._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-black text-xs text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                              #{apt.tokenNumber || 'WALKIN'}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              apt.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              ● {apt.status || 'BOOKED'}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-darkNavy dark:text-white text-sm">{apt.patient?.user?.fullName || apt.patientName || 'Walk-in Patient'}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              📞 {apt.patient?.user?.phone || apt.phone || 'N/A'} • 🏥 {apt.doctor?.department?.name || apt.departmentName || 'OPD'}
                            </p>
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                              👨‍⚕️ {apt.doctor?.user?.fullName ? (`Dr. ${apt.doctor.user.fullName}`) : (apt.doctor?.fullName ? `Dr. ${apt.doctor.fullName}` : 'Assigned Doctor')}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                            <span>🕒 Slot: {apt.appointmentTime || 'Today'}</span>
                            <span className="font-medium text-slate-400">{apt.createdAt ? new Date(apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PATIENT SEARCH */}
          {activeNav === 'search' && (
            <div className="space-y-6 animate-page-slide-left">
              <StaffHeroBanner
                title="🔍 Patient Directory Lookup"
                subtitle="Search general patient records, verify contact info, view historical visits, and access registered profiles."
                designationBadge={designationBadge}
                bgGradient="from-indigo-900 via-purple-950 to-indigo-950"
              />

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-base">
                  Search Registered Patients
                </h2>

                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient by name, mobile phone number, or email..."
                    className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-60 flex items-center gap-1.5"
                  >
                    <Search size={15} />
                    <span>{searching ? 'Searching...' : 'Search Patient'}</span>
                  </button>
                </form>

                {searchResults && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                    <p className="text-xs font-bold text-darkNavy dark:text-white flex items-center justify-between">
                      <span>Found {searchResults.length} patient record{searchResults.length !== 1 ? 's' : ''}:</span>
                    </p>
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-slate-400">No registered patient matched your search query.</p>
                    ) : (
                      <div className="space-y-6">
                        {searchResults.map((p) => (
                          <div key={p._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            {/* Patient Profile Banner Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm shrink-0">
                                  {(p.fullName || p.user?.fullName || 'PT').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-bold text-darkNavy dark:text-white text-base">
                                    {p.fullName || p.user?.fullName}
                                  </h3>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    📞 <strong>{p.phone || p.user?.phone}</strong> • 📧 <strong>{p.email || p.user?.email || 'No email registered'}</strong>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-extrabold text-xs px-3 py-1 rounded-full border border-sky-300 dark:border-sky-800 flex items-center gap-1.5">
                                  📅 Total Bookings: <strong>{p.totalAppointments || (p.appointments ? p.appointments.length : 0)} Times</strong>
                                </span>
                                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                                  ✓ REGISTERED PATIENT
                                </span>
                              </div>
                            </div>

                            {/* Appointment History List */}
                            <div className="space-y-3">
                              <h4 className="font-bold text-darkNavy dark:text-white text-xs flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  📋 Appointment History & Consultation Log ({p.appointments?.length || 0})
                                </span>
                              </h4>

                              {!p.appointments || p.appointments.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                  No appointments recorded for this patient profile yet.
                                </div>
                              ) : (
                                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                                  {p.appointments.map((apt) => {
                                    const rawDocName = apt.doctor?.user?.fullName || apt.doctor?.fullName || 'Assigned Doctor';
                                    const docName = /^dr\.?/i.test(rawDocName.trim()) ? rawDocName.trim() : `Dr. ${rawDocName.trim()}`;
                                    const deptName = apt.doctor?.department?.name || apt.departmentName || 'General OPD';

                                    return (
                                      <div
                                        key={apt._id}
                                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2"
                                      >
                                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-darkNavy dark:text-white">
                                              🏥 Department: <span className="text-indigo-600 dark:text-indigo-400">{deptName}</span>
                                            </span>
                                          </div>

                                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                            apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                            apt.status === 'CHECKED_IN' || apt.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                            apt.status === 'CANCELLED' || apt.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                            'bg-amber-100 text-amber-800 border border-amber-300'
                                          }`}>
                                            ● {apt.status || 'BOOKED'}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <p className="text-slate-500 dark:text-slate-400">
                                              👨‍⚕️ Doctor: <strong className="text-darkNavy dark:text-slate-200">{docName}</strong>
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-slate-500 dark:text-slate-400">
                                              📅 Date & Time: <strong className="text-darkNavy dark:text-slate-200">{apt.appointmentDate} at {apt.appointmentTime}</strong>
                                            </p>
                                          </div>
                                        </div>

                                        {apt.reasonForVisit && (
                                          <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                            💬 Health Concern: "{apt.reasonForVisit}"
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: INQUIRIES */}
          {activeNav === 'inquiries' && (
            <div className="space-y-6 animate-page-slide-left">
              <StaffHeroBanner
                title="💬 Patient Support & Desk Inquiries"
                subtitle="Review support tickets submitted by guests and patients from the contact portal, verify email/phone details, and respond."
                designationBadge={designationBadge}
                bgGradient="from-blue-900 via-indigo-950 to-indigo-900"
              />

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="font-poppins font-bold text-darkNavy dark:text-white text-base">
                    Patient Messages & Inquiries
                  </h2>
                  <span className="text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2.5 py-0.5 rounded-full">
                    {inquiries.length} Active
                  </span>
                </div>

                {inquiries.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">No patient support messages received yet.</div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq) => (
                      <div key={inq._id} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-bold text-darkNavy dark:text-white">{inq.name} ({inq.phone})</p>
                          <span className="text-[10px] font-bold text-slate-400">{inq.email}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          "{inq.message}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: STAFF LEAVE MANAGER */}
          {activeNav === 'leave' && (
            <div className="space-y-6 animate-page-slide-left">
              <StaffHeroBanner
                title="🏖️ Staff Absence & Leave Manager"
                subtitle="Apply for leave or view your current absence record registered in the hospital administration system."
                designationBadge={designationBadge}
                bgGradient="from-indigo-900 via-purple-950 to-indigo-950"
              />

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                  <div>
                    <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base">
                      Absence & Leave Status
                    </h3>
                  </div>

                {staffProfile?.onLeave ? (
                  <button
                    type="button"
                    onClick={handleStaffResumeDuty}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    🟢 Resume Active Duty
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowStaffLeaveModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-darkNavy text-xs font-black px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    🏖️ Apply / Request Leave
                  </button>
                )}
              </div>

              {/* Leave Applications History */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-darkNavy dark:text-white text-sm flex items-center gap-2">
                  <span>📋 My Submitted Leave Applications ({staffLeaveRequests.length})</span>
                </h4>

                {staffLeaveRequests.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    You have not submitted any leave applications yet. Click "Apply / Request Leave" above to apply.
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
                        {staffLeaveRequests.map((req) => (
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
          </div>
        )}

          {/* TAB 7: STAFF PROFILE & RBAC */}
          {activeNav === 'profile' && (
            <StaffProfileView
              user={user}
              staffProfile={staffProfile}
              designationBadge={designationBadge}
              showNotify={showNotify}
              loadStaffData={loadStaffData}
            />
          )}
        </main>
      </div>

      {/* STAFF APPLY LEAVE MODAL */}
      {showStaffLeaveModal && (
        <div className="fixed inset-0 bg-darkNavy/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                <span>🏖️ Apply Staff Leave</span>
              </h3>
              <button onClick={() => setShowStaffLeaveModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleStaffLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  value={staffLeaveReason}
                  onChange={(e) => setStaffLeaveReason(e.target.value)}
                  placeholder="e.g. Personal Medical Leave / Family Function / Casual Leave..."
                  className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={staffLeaveStartDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStaffLeaveStartDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkNavy dark:text-white mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={staffLeaveEndDate}
                    min={staffLeaveStartDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStaffLeaveEndDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>
              </div>

              {totalLeaveDays > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Total Leave Duration:</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                    📅 {totalLeaveDays} {totalLeaveDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStaffLeaveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStaffLeave || !staffLeaveReason.trim() || !staffLeaveStartDate || !staffLeaveEndDate}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-darkNavy font-black text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submittingStaffLeave ? 'Submitting Leave...' : 'Submit Leave Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WALK-IN REGISTRATION MODAL */}
      {showWalkInModal && (
        <WalkInModal onClose={() => setShowWalkInModal(false)} onRegistered={loadStaffData} />
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
              🚪
            </div>
            <div>
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg">Sign Out of Staff Portal?</h3>
              <p className="text-xs text-slate-400 mt-1">Are you sure you want to log out of your active duty session?</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar Nav Item Helper
function NavItem({ icon, label, badge, badgeColor = 'bg-sky-500', active, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
        active
          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
      }`}
      title={collapsed ? label : undefined}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'}>{icon}</span>
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
      {!collapsed && badge != null && (
        <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, bg, borderColor }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border ${borderColor} shadow-card flex items-center justify-between`}>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h4 className="font-poppins font-extrabold text-2xl text-darkNavy dark:text-white mt-1">{value}</h4>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
  );
}

// Quick Action Box
function QuickActionBox({ icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card text-left transition hover:border-sky-500 hover:shadow-lg group space-y-2"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition group-hover:scale-110">
        {icon}
      </div>
      <h4 className="font-poppins font-bold text-darkNavy dark:text-white text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
        {title}
      </h4>
      <p className="text-xs text-slate-400">{desc}</p>
    </button>
  );
}

// Walk-in Modal Form Component
function WalkInModal({ onClose, onRegistered }) {
  return (
    <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-page-slide-left">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-lg flex items-center gap-2">
            <span>➕ Counter Walk-in Patient Registration</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
        </div>
        <WalkInFormInline onRegistered={() => { onRegistered(); onClose(); }} onClose={onClose} />
      </div>
    </div>
  );
}

// Inline Walk-in Form
function WalkInFormInline({ onRegistered, onClose }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('MALE');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch departments on mount
  useEffect(() => {
    axiosClient.get('/departments').then(res => setDepartments(res.data || [])).catch(() => {});
  }, []);

  // Fetch doctors when department changes
  useEffect(() => {
    if (!departmentId) { setDoctors([]); setDoctorId(''); return; }
    setDoctorId('');
    axiosClient.get(`/doctor/department/${departmentId}`)
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, [departmentId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!departmentId) { setError('Please select a department.'); return; }
    if (!doctorId) { setError('Please select a doctor.'); return; }
    setSaving(true);
    try {
      const res = await axiosClient.post('/staff/walk-in', {
        fullName, phone, gender, departmentId, doctorId,
        age: age ? Number(age) : undefined,
        bloodGroup: bloodGroup || undefined,
        appointmentDate, appointmentTime,
        reasonForVisit: reasonForVisit || undefined,
      });
      const token = res.data?.tokenNumber || '';
      alert(`Walk-in patient registered successfully!${token ? ` Token: ${token}` : ''}`);
      setFullName(''); setPhone(''); setAge(''); setBloodGroup('');
      setDepartmentId(''); setDoctorId('');
      setAppointmentDate(todayStr); setAppointmentTime(''); setReasonForVisit('');
      onRegistered();
    } catch (err) {
      setError(err.response?.data?.message || 'Walk-in registration failed.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white";
  const labelCls = "block text-xs font-semibold text-darkNavy dark:text-white mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Patient Name */}
      <div>
        <label className={labelCls}>Patient Full Name *</label>
        <input type="text" placeholder="e.g. Rajesh Kumar" required value={fullName}
          onChange={(e) => setFullName(e.target.value)} className={inputCls} />
      </div>

      {/* Phone */}
      <div>
        <label className={labelCls}>10-Digit Mobile Phone *</label>
        <input type="tel" placeholder="Enter 10-digit mobile number" required maxLength={10}
          value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className={inputCls} />
      </div>

      {/* Gender + Age — 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Gender *</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inputCls} font-medium`}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Age</label>
          <input type="number" placeholder="e.g. 35" min={0} max={150} value={age}
            onChange={(e) => setAge(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Blood Group */}
      <div>
        <label className={labelCls}>Blood Group</label>
        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className={`${inputCls} font-medium`}>
          <option value="">Select Blood Group</option>
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

      {/* Department */}
      <div>
        <label className={labelCls}>Department *</label>
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required className={`${inputCls} font-medium`}>
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Doctor */}
      <div>
        <label className={labelCls}>Doctor *</label>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required disabled={!departmentId}
          className={`${inputCls} font-medium disabled:opacity-50`}>
          <option value="">{departmentId ? 'Select Doctor' : 'Select department first'}</option>
          {doctors.map((doc) => {
            const rawName = doc.user?.fullName || doc.fullName || 'Doctor';
            const docName = /^dr\.?/i.test(rawName.trim()) ? rawName.trim() : `Dr. ${rawName.trim()}`;
            return (
              <option key={doc._id} value={doc._id}>
                {docName} {doc.onLeave ? '(On Leave)' : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* Appointment Date + Time Slot — 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Appointment Date *</label>
          <input type="date" required min={todayStr} value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Time Slot *</label>
          <input type="time" required value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Primary Health Concern */}
      <div>
        <label className={labelCls}>Primary Health Concern</label>
        <textarea placeholder="e.g. Fever, headache since 2 days" rows={2} value={reasonForVisit}
          onChange={(e) => setReasonForVisit(e.target.value)}
          className={`${inputCls} resize-none`} />
      </div>

      {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="w-[30%] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-darkNavy dark:text-white font-bold text-xs py-3 rounded-xl transition">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs disabled:opacity-60">
          {saving ? 'Registering Walk-in...' : '✓ Issue OPD Consultation Token'}
        </button>
      </div>
    </form>
  );
}

// STAFF PROFILE VIEW — Full 2-column balanced profile page matching Admin Profile layout
function StaffProfileView({ user, staffProfile, designationBadge, showNotify, loadStaffData }) {
  const { updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(staffProfile?.fullName || user?.fullName || '');
  const [editPhone, setEditPhone] = useState(staffProfile?.phone || user?.phone || '');
  const [editEmail, setEditEmail] = useState(staffProfile?.email || user?.email || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editMode && (staffProfile || user)) {
      setEditName(staffProfile?.fullName || user?.fullName || '');
      setEditPhone(staffProfile?.phone || user?.phone || '');
      setEditEmail(staffProfile?.email || user?.email || '');
    }
  }, [user, staffProfile, editMode]);

  // Password Change State
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // Password History State
  const [pwdHistory, setPwdHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('staff_pwd_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    const defaultDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 1,
        date: defaultDateStr,
        action: 'Account Password & Security Setup',
        status: 'Verified'
      }
    ];
  });

  async function handleSaveProfile() {
    if (!editName.trim()) {
      showNotify('error', 'Validation', 'Full name is required.');
      return;
    }
    if (!editEmail.trim()) {
      showNotify('error', 'Validation', 'Email address is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await axiosClient.put('/staff/profile', {
        fullName: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
      });

      const updatedUser = res.data.staff || res.data.user;
      if (updatedUser) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newUser = {
          ...storedUser,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          email: updatedUser.email,
        };
        localStorage.setItem('user', JSON.stringify(newUser));
        if (typeof updateUser === 'function') {
          updateUser({
            fullName: updatedUser.fullName,
            phone: updatedUser.phone,
            email: updatedUser.email,
          });
        }
      }

      showNotify('success', 'Profile Updated', res.data.message || 'Staff profile updated successfully.');
      setEditMode(false);
      if (typeof loadStaffData === 'function') loadStaffData();
    } catch (err) {
      showNotify('error', 'Update Failed', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwdError('');
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError('All password fields are required.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New password and confirmation do not match.');
      return;
    }
    if (newPwd.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    setPwdSaving(true);
    try {
      await axiosClient.post('/auth/change-password', { currentPassword: currentPwd, newPassword: newPwd });
      showNotify('success', 'Password Updated', 'Your security password has been changed successfully.');
      
      const newLog = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: 'Account Password Changed',
        status: 'Verified'
      };
      const updatedHistory = [newLog, ...pwdHistory.slice(0, 4)];
      setPwdHistory(updatedHistory);
      localStorage.setItem('staff_pwd_history', JSON.stringify(updatedHistory));

      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setShowPwdChange(false);
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
    }
  }

  const initials = (staffProfile?.fullName || user?.fullName || 'ST')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 w-full animate-page-slide-left">
      {/* Hero Header Card (Identical to Admin Dashboard Profile) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden w-full text-white">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left min-w-0 flex-1">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white font-poppins font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/10 shrink-0">
              {initials}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <h2 className="font-poppins font-extrabold text-white text-lg sm:text-xl tracking-tight truncate">
                {staffProfile?.fullName || user?.fullName || 'Hospital Staff Member'}
              </h2>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                <span className="font-mono text-slate-200">📧 {staffProfile?.email || user?.email || 'staff@brainwarehospital.com'}</span>
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline">Signed in as Hospital Staff Member</span>
              </p>
            </div>
          </div>

          {/* Right Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end shrink-0">
            <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
              {designationBadge.label}
            </span>
            <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase tracking-wider inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
              💼 STAFF MEMBER
            </span>
            <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
              ✓ ACTIVE ACCOUNT
            </span>
          </div>
        </div>
      </div>

      {/* Main Balanced 2-Column Dashboard Grid (Matches Admin Profile Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* LEFT COLUMN: Personal Details & Granted Privileges */}
        <div className="space-y-6">
          {/* Personal Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                <span>👤 Personal & Contact Profile</span>
              </h3>
              {!editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✏️ Edit Information</span>
                </button>
              )}
            </div>

            {!editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <p className="font-bold text-darkNavy dark:text-white text-sm">{staffProfile?.fullName || user?.fullName || '—'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Contact</span>
                  <p className="font-mono font-bold text-darkNavy dark:text-white text-sm">{staffProfile?.phone || user?.phone || '—'}</p>
                </div>
                <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <p className="font-mono font-bold text-darkNavy dark:text-white text-sm break-all">{staffProfile?.email || user?.email || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : '✓ Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Unified Security & Password Management Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-base flex items-center gap-2">
                <span>🔐 Security & Password Management</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your account password credentials and view security history.
              </p>
            </div>

            {/* Password Section */}
            <div className="space-y-3">
              {!showPwdChange ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-darkNavy dark:text-white text-xs">Update Security Credentials</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Regularly update your staff password for enhanced protection.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPwdChange(true)}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <KeyRound size={14} />
                    <span>Change Password</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-darkNavy dark:text-white">Current Password *</label>
                      <Link
                        to="/forgot-password"
                        className="text-[11px] font-bold text-sky-500 hover:text-sky-600 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <input
                      type="password"
                      required
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">New Password *</label>
                      <input
                        type="password"
                        required
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-darkNavy dark:text-white mb-1">Confirm New Password *</label>
                      <input
                        type="password"
                        required
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
                      />
                    </div>
                  </div>

                  {pwdError && <p className="text-xs text-rose-600 font-bold">{pwdError}</p>}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPwdChange(false)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs py-2 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pwdSaving}
                      className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2 rounded-xl transition shadow-xs disabled:opacity-60"
                    >
                      {pwdSaving ? 'Updating...' : '✓ Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Password Change History */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-darkNavy dark:text-white text-xs flex items-center gap-1.5">
                  <Activity size={14} className="text-sky-500" />
                  <span>Password Change History</span>
                </h4>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {pwdHistory.length} Record{pwdHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {pwdHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs shrink-0 font-bold">
                        🔑
                      </div>
                      <div>
                        <p className="font-bold text-darkNavy dark:text-white">{item.action}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>📅 Last Changed:</span>
                          <strong className="text-slate-600 dark:text-slate-200">{item.date}</strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                      ✓ {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
