import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';

export default function NotFound() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/departments?search=${encodeURIComponent(searchTerm.trim())}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-softBg font-inter text-darkNavy">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Main 404 Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center relative overflow-hidden">
        
        {/* Decorative Background Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
          
          {/* Badge */}
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight/80 px-4 py-1.5 rounded-full border border-primary/20 inline-flex items-center gap-2 shadow-xs">
              <span className="animate-pulse">🚨</span>
              <span>404 - Error: Page Not Found</span>
            </span>
          </div>

          {/* Graphic & Title */}
          <div className="space-y-4">
            <div className="relative inline-block">
              <h1 className="font-poppins font-black text-7xl sm:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-primaryDark to-indigo-900 tracking-tight drop-shadow-sm">
                404
              </h1>
              <span className="absolute -top-3 -right-6 text-4xl sm:text-5xl animate-bounce">
                🩺
              </span>
            </div>

            <h2 className="font-poppins font-extrabold text-2xl sm:text-4xl text-darkNavy">
              Oops! You've Reached a Missing Medical Wing
            </h2>
            
            <p className="text-xs sm:text-sm text-slateText max-w-xl mx-auto leading-relaxed">
              The page, medical record, or department link you clicked might have been moved, renamed, or is currently undergoing clinical updates.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto relative flex items-center">
            <input
              type="text"
              placeholder="Search departments, doctors, or services (e.g. Cardiology)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-xs sm:text-sm text-darkNavy placeholder-slate-400 pl-4 pr-24 py-3.5 rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
            <button
              type="submit"
              className="absolute right-2 bg-primary hover:bg-primaryDark text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="bg-primary hover:bg-primaryDark text-white font-poppins font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-glow hover:shadow-cardHover transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>🏠</span> Return to Home Page
            </Link>

            <Link
              to="/departments"
              className="bg-white text-darkNavy border border-slate-300 hover:border-primary hover:text-primary font-poppins font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs hover:shadow transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>🏬</span> Explore Departments
            </Link>

            <a
              href="tel:108"
              className="bg-red-50 text-emergency hover:bg-emergency hover:text-white border border-red-200 font-poppins font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>🚨</span> Emergency Hotline (108)
            </a>
          </div>

          {/* Quick Shortcuts Cards */}
          <div className="grid sm:grid-cols-3 gap-4 pt-6 text-left">
            <Link
              to="/doctors"
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-primary/40 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-xl font-bold mb-3 group-hover:scale-110 transition-transform">
                👨‍⚕️
              </div>
              <h3 className="font-poppins font-bold text-xs text-darkNavy group-hover:text-primary transition">
                Specialist Doctors
              </h3>
              <p className="text-[11px] text-slateText mt-1">
                Browse senior consultants & view OPD schedules.
              </p>
            </Link>

            <Link
              to="/services"
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-primary/40 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-3 group-hover:scale-110 transition-transform">
                🔬
              </div>
              <h3 className="font-poppins font-bold text-xs text-darkNavy group-hover:text-primary transition">
                Hospital Services
              </h3>
              <p className="text-[11px] text-slateText mt-1">
                24/7 Diagnostics, ICU, Radiology & Telehealth.
              </p>
            </Link>

            <Link
              to="/login"
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-primary/40 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold mb-3 group-hover:scale-110 transition-transform">
                🔑
              </div>
              <h3 className="font-poppins font-bold text-xs text-darkNavy group-hover:text-primary transition">
                Patient Portal
              </h3>
              <p className="text-[11px] text-slateText mt-1">
                Sign in to view past tokens & medical history.
              </p>
            </Link>
          </div>

        </div>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
