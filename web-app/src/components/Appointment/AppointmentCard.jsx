import React from 'react';

const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500 animate-pulse',
  },
  ACCEPTED: {
    label: 'Confirmed',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dot: 'bg-blue-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    dot: 'bg-purple-500',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
};

function formatToken(tokenStr, queueNumber) {
  if (queueNumber) return `TKN #${queueNumber}`;
  if (!tokenStr) return 'TKN #1';
  if (tokenStr.includes('-')) {
    const parts = tokenStr.split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      return `TKN #${lastPart}`;
    }
  }
  if (tokenStr.length > 12) {
    return `TKN #${tokenStr.slice(-4)}`;
  }
  return `#${tokenStr}`;
}

function getEffectiveStatusKey(appointment) {
  const rawStatus = (appointment.status || 'PENDING').toUpperCase();
  if (rawStatus === 'CANCELLED' || rawStatus === 'REJECTED' || rawStatus === 'RESCHEDULED') {
    return rawStatus;
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  if (appointment.appointmentDate && appointment.appointmentDate < todayStr) {
    return 'COMPLETED';
  }
  if (rawStatus === 'ACCEPTED' || rawStatus === 'CONFIRMED') {
    return 'CONFIRMED';
  }
  return 'PENDING';
}

export default function AppointmentCard({ appointment, onReschedule, onCancel }) {
  const doctorRaw = appointment.doctor?.user?.fullName || appointment.doctor?.fullName || '';
  const isGeneric = !doctorRaw || doctorRaw.toLowerCase().includes('specialist');
  const doctorName = isGeneric
    ? 'Specialist Doctor'
    : (/^dr\.?/i.test(doctorRaw.trim()) ? doctorRaw.trim() : `Dr. ${doctorRaw.trim()}`);

  const departmentName = appointment.department?.name || appointment.doctor?.specialization || appointment.departmentName || 'General OPD';
  const tokenDisplay = formatToken(appointment.tokenNumber, appointment.queueNumber);
  
  const effectiveStatusKey = getEffectiveStatusKey(appointment);
  const status = statusConfig[effectiveStatusKey] || {
    label: effectiveStatusKey,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
    dot: 'bg-slate-500',
  };

  return (
    <div className="group bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary/50 rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-cardHover transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden">
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Doctor Avatar / Icon Pill */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 border border-primary/20 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
            🩺
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-md border border-primary/20 mb-0.5 truncate max-w-full">
              {departmentName}
            </span>
            <h3 className="font-poppins font-bold text-darkNavy dark:text-white text-sm sm:text-base leading-snug truncate">
              {doctorName}
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border flex items-center gap-1.5 shrink-0 whitespace-nowrap ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
          {status.label}
        </span>
      </div>

      {/* Details Meta Block */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60 space-y-2.5">
        
        {/* Date & Time Row */}
        <div className="flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 text-slateText dark:text-slate-300 font-medium">
            <span>📅</span>
            <span>{appointment.appointmentDate}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-darkNavy dark:text-white bg-white dark:bg-slate-700/80 px-2.5 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-600/80 text-[11px]">
            <span>⏰</span>
            <span>{appointment.appointmentTime}</span>
          </div>
        </div>

        {/* Patient Name & Consultation Type Pill */}
        <div className="flex items-center justify-between text-[11px] gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 truncate">
            <span>👤</span> {appointment.patientName || appointment.patient?.fullName || 'Patient'}
          </span>
          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] border shrink-0 ${
            appointment.videoConsultation 
              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20' 
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
          }`}>
            {appointment.videoConsultation ? '🎥 Video Consult' : '🏥 In-Person OPD'}
          </span>
        </div>

        {/* Queue Token & Patient Phone */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/40 text-xs">
          <span className="text-[11px] text-slateText dark:text-slate-400 font-medium flex items-center gap-1">
            <span>📞</span> {appointment.patientPhone || appointment.patient?.phone || 'No phone recorded'}
          </span>
          <span className="font-poppins font-extrabold text-xs text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 rounded-md border border-primary/20">
            🎟️ {tokenDisplay}
          </span>
        </div>

        {/* Reason for Visit */}
        {appointment.reasonForVisit && (
          <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/40 text-[11px] leading-snug">
            <span className="font-bold text-slate-500 dark:text-slate-400">📝 Reason: </span>
            <span className="italic font-medium text-darkNavy dark:text-slate-200">"{appointment.reasonForVisit}"</span>
          </div>
        )}

        {/* Cancellation Reason if cancelled */}
        {effectiveStatusKey === 'CANCELLED' && appointment.cancellationReason && (
          <div className="pt-1 border-t border-rose-200/60 dark:border-rose-800/40 text-[11px] text-rose-600 dark:text-rose-400 leading-snug">
            <span className="font-bold">❌ Cancellation Reason: </span>
            <span className="italic font-medium">"{appointment.cancellationReason}"</span>
          </div>
        )}
      </div>

      {/* Action Buttons for Active (Pending & Confirmed) Appointments */}
      {(onReschedule || onCancel) && (effectiveStatusKey === 'PENDING' || effectiveStatusKey === 'CONFIRMED' || effectiveStatusKey === 'ACCEPTED') && (
        <div className="flex gap-2.5 pt-1">
          {onReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="flex-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-300 text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
            >
              <span>🔄</span>
              <span>Reschedule</span>
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(appointment)}
              className="flex-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
            >
              <span>✕</span>
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
