import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenAppointmentModal, onOpenEmergencyModal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinks = [
    { name: 'Home', href: '/', isRoute: true },
    { name: 'Departments', href: '/departments', isRoute: true },
    { name: 'Doctors', href: '/doctors', isRoute: true },
    { name: 'About Us', href: '/about', isRoute: true },
    { name: 'Services', href: '/services', isRoute: true },
    { name: 'Blogs', href: '/blogs', isRoute: true },
    { name: 'Contact Us', href: '/contact', isRoute: true },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* Top Bar */}
      <div className="bg-darkNavy text-white py-1.5 px-4 sm:px-6 text-xs font-inter border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-x-5 gap-y-1.5 text-center md:text-left">
          <span className="flex items-center gap-1.5 text-secondaryLight font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            24×7 Emergency: <strong className="text-white font-semibold">+91 98765 43210 / 108</strong>
          </span>

          <span className="hidden md:inline-flex items-center gap-1 text-gray-300">
            📍 Barasat - Barrackpore Rd, Helabattala, Kolkata 700125
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-gray-300">
            🕒 OPD Hours: Mon - Sat (8 AM - 8 PM)
          </span>

          <a href="mailto:info@brainwarehospital.edu.in" className="hover:text-primaryLight transition flex items-center gap-1 text-gray-300">
            ✉️ info@brainwarehospital.edu.in
          </a>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <nav className="glass-nav border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center group py-0.5">
            <img
              src="/hospital_logo.png"
              alt="Brainware Medical College & Hospital"
              className="h-10 sm:h-11 md:h-12 w-auto max-w-[200px] sm:max-w-[240px] lg:max-w-[270px] object-contain flex-shrink-0 group-hover:scale-[1.02] transition-transform"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5 flex-shrink">
            {navLinks.map((link) => {
              if (link.name === 'About Us') {
                return (
                  <div className="relative group/about py-1" key={link.name}>
                    <Link
                      to="/about"
                      className="text-xs xl:text-sm font-medium text-slateText hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all"
                    >
                      <span>About Us</span>
                      <span className="text-[10px] text-slate-400 transition-transform group-hover/about:rotate-180">▼</span>
                    </Link>

                    {/* About Us Dropdown Menu */}
                    <div className="absolute top-full left-0 pt-2 hidden group-hover/about:block animate-fadeIn z-50 w-52">
                      <div className="bg-white rounded-2xl p-2 shadow-2xl border border-slate-200/80 space-y-1">
                        <Link
                          to="/about/overview"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-darkNavy hover:bg-primaryLight hover:text-primary rounded-xl transition"
                        >
                          <span>🏛️</span>
                          <span>Company Overview</span>
                        </Link>

                        <Link
                          to="/about/mission"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-darkNavy hover:bg-primaryLight hover:text-primary rounded-xl transition"
                        >
                          <span>🎯</span>
                          <span>Mission & Vision</span>
                        </Link>

                        <Link
                          to="/about/careers"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-darkNavy hover:bg-primaryLight hover:text-primary rounded-xl transition"
                        >
                          <span>💼</span>
                          <span>Careers & Openings</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              return link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs xl:text-sm font-medium text-slateText hover:text-primary transition-colors py-1 relative whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-xs xl:text-sm font-medium text-slateText hover:text-primary transition-colors py-1 relative whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all"
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Action CTAs & Auth */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <button
              onClick={onOpenEmergencyModal}
              className="bg-emergencyLight text-emergency hover:bg-emergency hover:text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              🚨 Emergency
            </button>

            <button
              onClick={onOpenAppointmentModal}
              className="bg-gradient-to-r from-primary to-primaryDark hover:from-primaryDark hover:to-primary text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-glow hover:shadow-cardHover transition transform active:scale-95 whitespace-nowrap"
            >
              📅 Book Appointment
            </button>

            {user ? (
              <div className="relative border-l border-slate-200 pl-3">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="bg-primaryLight text-primary hover:bg-primary hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-primary/20 shadow-2xs active:scale-95"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-extrabold border border-primary/30">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
                  </span>
                  <span>{user.fullName || 'Patient'}</span>
                </button>

                {/* 2-Option Dropdown Menu (Profile & Logout) */}
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl p-2 shadow-2xl border border-slate-200/80 animate-fadeIn z-50 space-y-1">
                      {/* Option 1: Profile */}
                      <Link
                        to={user.role === 'ADMIN' ? '/admin' : user.role === 'DOCTOR' ? '/doctor' : user.role === 'STAFF' ? '/staff' : '/patient?tab=profile'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-darkNavy hover:bg-primaryLight hover:text-primary rounded-xl transition"
                      >
                        <span>👤</span>
                        <span>Profile</span>
                      </Link>

                      {/* Option 2: Logout */}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-darkNavy border border-slate-300 hover:border-primary hover:text-primary px-3.5 py-2 rounded-xl transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-darkNavy hover:text-primary focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-2 animate-fadeIn">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slateText hover:bg-primaryLight hover:text-primary rounded-lg"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slateText hover:bg-primaryLight hover:text-primary rounded-lg"
                >
                  {link.name}
                </a>
              )
            )}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEmergencyModal();
                }}
                className="w-full bg-emergency text-white py-2.5 rounded-xl text-xs font-semibold text-center"
              >
                🚨 Emergency Care
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAppointmentModal();
                }}
                className="w-full bg-primary text-white py-2.5 rounded-xl text-xs font-semibold text-center"
              >
                📅 Book Appointment
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
