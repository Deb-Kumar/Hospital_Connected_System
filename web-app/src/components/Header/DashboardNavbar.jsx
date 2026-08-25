import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

// Live Digital Clock & Date Widget
function HeaderClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="h-10 hidden md:flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl shadow-2xs transition-colors whitespace-nowrap">
      <span className="text-amber-500 font-bold text-sm animate-pulse">⏰</span>
      <div className="flex items-center gap-2.5">
        <span className="font-mono font-black text-darkNavy dark:text-sky-300 tracking-wider text-xs sm:text-sm">
          {timeStr}
        </span>
        <span className="text-slate-400 dark:text-slate-500 font-extrabold text-xs sm:text-sm">•</span>
        <span className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200">
          {dateStr}
        </span>
      </div>
    </div>
  );
}

// Dark / Light Theme Toggle Switch
function ThemeToggleBtn({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="h-10 flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-darkNavy dark:text-amber-300 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-extrabold transition active:scale-95 shadow-2xs whitespace-nowrap"
    >
      <span>{isDark ? '☀️ Light' : '🌙 Dark'}</span>
    </button>
  );
}

// User Profile & Role Badge Widget
function UserProfileBadgeWidget({ user }) {
  const roleUpper = (user?.role || 'PATIENT').toUpperCase();
  const name = user?.fullName || 'User Account';

  let roleBadge = null;
  if (roleUpper === 'ADMIN') {
    roleBadge = (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 uppercase">
        👑 Admin
      </span>
    );
  } else if (roleUpper === 'STAFF') {
    roleBadge = (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 uppercase">
        📋 Staff Member
      </span>
    );
  } else if (roleUpper === 'DOCTOR') {
    roleBadge = (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
        🩺 Doctor
      </span>
    );
  } else {
    roleBadge = (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 uppercase">
        👤 Customer / Patient
      </span>
    );
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="h-10 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1 rounded-2xl shadow-2xs">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-poppins font-extrabold text-xs flex items-center justify-center shadow-xs">
        {initials}
      </div>
      <div className="flex flex-col text-left leading-tight hidden xs:flex">
        <span className="font-poppins font-bold text-darkNavy dark:text-white text-xs truncate max-w-[120px]">
          {name}
        </span>
        <div className="mt-0.5">{roleBadge}</div>
      </div>
    </div>
  );
}

export default function Navbar({ title, activeTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Page Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/hospital_logo.png"
                alt="Brainware Medical College & Hospital"
                className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            <h1 className="font-poppins font-bold text-darkNavy dark:text-white text-base sm:text-lg">{title}</h1>
          </div>

          {/* Right side header widgets */}
          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderClockWidget />
            <ThemeToggleBtn isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            {user && <UserProfileBadgeWidget user={user} />}

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 px-3 py-1.5 rounded-2xl transition active:scale-95 shadow-2xs"
              title="Sign out of your session"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* SIGN OUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-darkNavy/60 backdrop-blur-xs flex items-center justify-center p-4 z-[70] animate-page-slide-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800 shadow-xs">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-poppins font-extrabold text-darkNavy dark:text-white text-lg">
                Confirm Sign Out?
              </h3>
              <p className="text-xs text-slateText dark:text-slate-400 leading-relaxed">
                Are you sure you want to end your current session and sign out of the hospital portal?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slateText dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
