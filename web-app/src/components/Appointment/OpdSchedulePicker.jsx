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
      } else if (presetName === 'CLEAR') {
        updated[w.id] = { active: false, start: '09:00 AM', end: '01:00 PM' };
      }
    });
    setDaySchedules(updated);
  }

  return (
    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 transition-colors">
      
      {/* Component Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2.5">
        <label className="text-xs font-bold text-darkNavy dark:text-white flex items-center gap-2">
          <span>📅 OPD Availability Schedule (Per-Day Controls)</span>
        </label>

        {/* Preset Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset('MON_FRI_9_1')}
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 text-darkNavy dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition shadow-2xs"
          >
            Mon-Fri (9am-1pm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('MON_SAT_10_4')}
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 text-darkNavy dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition shadow-2xs"
          >
            Mon-Sat (10am-4pm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('CLEAR')}
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Per-Day Row Controls */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {WEEKDAYS.map((w) => {
          const dayData = daySchedules[w.id] || { active: false, start: '09:00 AM', end: '01:00 PM' };
          return (
            <div
              key={w.id}
              className={`p-2 rounded-xl border transition flex items-center justify-between gap-2 ${
                dayData.active
                  ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-2xs'
                  : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              {/* Day Toggle Button */}
              <button
                type="button"
                onClick={() => toggleDayActive(w.id)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 min-w-[95px] ${
                  dayData.active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{dayData.active ? '✓' : '✕'}</span>
                <span>{w.label}</span>
              </button>

              {/* Timing Controls (Active Day) */}
              {dayData.active ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-slateText dark:text-slate-400">From:</span>
                  <select
                    value={dayData.start}
                    onChange={(e) => updateDayTime(w.id, 'start', e.target.value)}
                    className="text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <span className="text-[11px] font-semibold text-slateText dark:text-slate-400">To:</span>
                  <select
                    value={dayData.end}
                    onChange={(e) => updateDayTime(w.id, 'end', e.target.value)}
                    className="text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-800 text-darkNavy dark:text-white"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 italic pr-2">
                  Closed / No OPD
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Formatted Preview Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
        <span className="text-slateText dark:text-slate-400 font-medium">Formatted OPD Schedule:</span>
        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-right truncate max-w-[220px] sm:max-w-xs">
          {value || 'By Appointment Only'}
        </span>
      </div>

    </div>
  );
}
