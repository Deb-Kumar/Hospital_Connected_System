import React, { useState, useEffect } from 'react';

const WEEKDAYS = [
  { id: 'MON', label: 'Monday', short: 'Mon' },
  { id: 'TUE', label: 'Tuesday', short: 'Tue' },
  { id: 'WED', label: 'Wednesday', short: 'Wed' },
  { id: 'THU', label: 'Thursday', short: 'Thu' },
  { id: 'FRI', label: 'Friday', short: 'Fri' },
  { id: 'SAT', label: 'Saturday', short: 'Sat' },
  { id: 'SUN', label: 'Sunday', short: 'Sun' },
];

const TIME_SLOTS = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
];

export default function OpdSchedulePicker({ value, onChange }) {
  // Initialize per-day schedule map
  const [daySchedules, setDaySchedules] = useState(() => {
    const initial = {};
    WEEKDAYS.forEach((w) => {
      // Default MON - FRI active 09:00 AM - 01:00 PM, SAT & SUN off
      const defaultActive = ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(w.id);
      initial[w.id] = {
        active: defaultActive,
        start: '09:00 AM',
        end: '01:00 PM',
      };
    });
    return initial;
  });

  // Re-generate output string whenever daySchedules change
  useEffect(() => {
    const activeDays = WEEKDAYS.filter((w) => daySchedules[w.id]?.active);

    if (activeDays.length === 0) {
      onChange('By Appointment Only');
      return;
    }

    // Check if all active days share the exact same start & end time
    const firstActive = daySchedules[activeDays[0].id];
    const allSameTime = activeDays.every(
      (w) => daySchedules[w.id].start === firstActive.start && daySchedules[w.id].end === firstActive.end
    );

    let resultString = '';

    if (allSameTime) {
      const activeIds = activeDays.map((w) => w.id);
      let daysLabel = '';
      if (activeIds.length === 5 && ['MON', 'TUE', 'WED', 'THU', 'FRI'].every((d) => activeIds.includes(d))) {
        daysLabel = 'MON - FRI';
      } else if (activeIds.length === 6 && ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].every((d) => activeIds.includes(d))) {
        daysLabel = 'MON - SAT';
      } else if (activeIds.length === 7) {
        daysLabel = 'ALL 7 DAYS';
      } else {
        daysLabel = activeIds.join(', ');
      }
      resultString = `${daysLabel} • ${firstActive.start} - ${firstActive.end}`;
    } else {
      // Per-day custom timing string
      resultString = activeDays
        .map((w) => `${w.id}: ${daySchedules[w.id].start} - ${daySchedules[w.id].end}`)
        .join(' | ');
    }

    onChange(resultString);
  }, [daySchedules]);

  function toggleDayActive(dayId) {
    setDaySchedules((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        active: !prev[dayId]?.active,
      },
    }));
  }

  function updateDayTime(dayId, field, timeVal) {
    setDaySchedules((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: timeVal,
      },
    }));
  }

  function applyPreset(presetName) {
    const updated = {};
    WEEKDAYS.forEach((w) => {
      if (presetName === 'MON_FRI_9_1') {
        const isActive = ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(w.id);
        updated[w.id] = { active: isActive, start: '09:00 AM', end: '01:00 PM' };
      } else if (presetName === 'MON_SAT_10_4') {
        const isActive = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].includes(w.id);
        updated[w.id] = { active: isActive, start: '10:00 AM', end: '04:00 PM' };
      } else if (presetName === 'MON_SAT_5_8') {
        const isActive = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].includes(w.id);
        updated[w.id] = { active: isActive, start: '05:00 PM', end: '08:00 PM' };
      } else if (presetName === 'CLEAR') {
        updated[w.id] = { active: false, start: '09:00 AM', end: '01:00 PM' };
      }
    });
    setDaySchedules(updated);
  }

  return (
    <div className="space-y-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-card transition-colors">
      
      {/* Component Header & Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3.5">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-primary dark:text-sky-400 flex items-center gap-1.5">
            <span>⏱️ OPD Consultation Controls</span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Toggle daily availability and set OPD session hours.
          </p>
        </div>

        {/* Quick Shortcut Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset('MON_FRI_9_1')}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-darkNavy dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-sky-400 hover:text-primary transition shadow-2xs cursor-pointer active:scale-95"
          >
            ⚡ Mon-Fri (9am-1pm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('MON_SAT_10_4')}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-darkNavy dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-sky-400 hover:text-primary transition shadow-2xs cursor-pointer active:scale-95"
          >
            ⚡ Mon-Sat (10am-4pm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('MON_SAT_5_8')}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-darkNavy dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-sky-400 hover:text-primary transition shadow-2xs cursor-pointer active:scale-95"
          >
            ⚡ Mon-Sat (5pm-8pm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('CLEAR')}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100 transition cursor-pointer active:scale-95"
          >
            🧹 Clear All
          </button>
        </div>
      </div>

      {/* Per-Day Row Controls */}
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {WEEKDAYS.map((w) => {
          const dayData = daySchedules[w.id] || { active: false, start: '09:00 AM', end: '01:00 PM' };
          return (
            <div
              key={w.id}
              className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                dayData.active
                  ? 'bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700/80 shadow-xs'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              {/* Day Toggle Button */}
              <button
                type="button"
                onClick={() => toggleDayActive(w.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 min-w-[120px] cursor-pointer active:scale-95 ${
                  dayData.active
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700/60'
                }`}
              >
                <span>{dayData.active ? '🟢' : '⚪'}</span>
                <span>{w.label}</span>
              </button>

              {/* Timing Controls (Active Day) */}
              {dayData.active ? (
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">From</span>
                    <select
                      value={dayData.start}
                      onChange={(e) => updateDayTime(w.id, 'start', e.target.value)}
                      className="text-xs font-mono font-bold bg-transparent text-darkNavy dark:text-white focus:outline-none cursor-pointer"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-slate-400 font-bold">➔</span>

                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">To</span>
                    <select
                      value={dayData.end}
                      onChange={(e) => updateDayTime(w.id, 'end', e.target.value)}
                      className="text-xs font-mono font-bold bg-transparent text-darkNavy dark:text-white focus:outline-none cursor-pointer"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 italic px-2">
                  No OPD Session (Off Day)
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Formatted Preview Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 space-y-1.5 shadow-card">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
            <span>✨ Live Formatted OPD Schedule:</span>
          </span>
        </div>
        <div className="font-mono text-xs font-bold text-emerald-300 break-words leading-relaxed">
          {value || 'By Appointment Only'}
        </div>
      </div>

    </div>
  );
}
