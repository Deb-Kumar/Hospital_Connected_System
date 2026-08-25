import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import Navbar from '../components/Header/DashboardNavbar';
import AppointmentCard from '../components/Appointment/AppointmentCard';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const STATUS_TABS = [
  { key: 'ALL', label: 'All', icon: '📋' },
  { key: 'ACCEPTED', label: 'Active', icon: '✅' },
  { key: 'PENDING', label: 'Pending', icon: '⏳' },
  { key: 'COMPLETED', label: 'Completed', icon: '🏁' },
  { key: 'CANCELLED', label: 'Cancelled', icon: '❌' },
];

export default function AppointmentHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Cancel & Reschedule Modals State
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [cancelReasonOption, setCancelReasonOption] = useState('Schedule Conflict');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [rescheduleModalAppointment, setRescheduleModalAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  function loadHistory() {
    setLoading(true);
    axiosClient.get(`/appointments/patient/${user.id}`)
      .then((res) => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(loadHistory, [user.id]);

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
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
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
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduling(false);
    }
  }

  // Filtered & Searched
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const statusMatch = statusFilter === 'ALL' || a.status === statusFilter;
      const docName = (a.doctor?.user?.fullName || a.doctor?.fullName || '').toLowerCase();
      const dept = (a.departmentName || a.department?.name || '').toLowerCase();
      const token = String(a.tokenNumber || '');
      const search = searchTerm.toLowerCase();
      const searchMatch = !searchTerm || docName.includes(search) || dept.includes(search) || token.includes(search);
      return statusMatch && searchMatch;
    });
  }, [appointments, statusFilter, searchTerm]);

  // Stats
  const stats = useMemo(() => ({
    total: appointments.length,
    active: appointments.filter(a => a.status === 'ACCEPTED').length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED' || a.status === 'REJECTED').length,
  }), [appointments]);

  return (
    <div className="min-h-screen bg-softBg dark:bg-slate-950 font-inter transition-colors duration-300">
      <Navbar title="Appointment History" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

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

            <Link to="/patient/book"
              className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-2 self-start md:self-auto border border-white/20">
              <span className="text-base">📅</span>
              <span>Book New OPD</span>
            </Link>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5">
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

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
              <input type="text" placeholder="Search doctor, department, token..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slateText dark:text-slate-400">
            Showing <span className="text-darkNavy dark:text-white font-bold">{filtered.length}</span> of {appointments.length} appointments
            {statusFilter !== 'ALL' && <span className="ml-1">• Filter: <span className="text-primary font-bold">{statusFilter}</span></span>}
          </p>
          <button onClick={loadHistory}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700/80 px-3.5 py-1.5 rounded-full transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm">
            <RefreshCw size={13} className={loading ? 'animate-spin text-white' : 'text-slate-300'} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Appointment Cards Grid */}
        {loading ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="animate-pulse space-y-3">
              <span className="text-4xl block">⏳</span>
              <p className="text-sm font-bold text-darkNavy dark:text-white">Loading Appointments...</p>
              <p className="text-xs text-slateText dark:text-slate-400">Fetching your OPD consultation records</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <span className="text-5xl block">📋</span>
            <p className="text-sm font-bold text-darkNavy dark:text-white">No Appointments Found</p>
            <p className="text-xs text-slateText dark:text-slate-400 max-w-sm mx-auto">
              {searchTerm ? 'No results match your search query. Try different keywords.' : 'You have no appointments in this category yet.'}
            </p>
            <Link to="/patient/book"
              className="inline-block bg-primary hover:bg-primaryDark text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition mt-2">
              📅 Book OPD Appointment
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <AppointmentCard
                key={a._id} appointment={a}
                onReschedule={openRescheduleModal} onCancel={openCancelModal}
              />
            ))}
          </div>
        )}

      </div>

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
    </div>
  );
}
