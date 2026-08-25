import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-darkNavy text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <span>🍪 Cookie Usage & Web Preferences</span>
          </div>
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
            Cookie Policy
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            This Cookie Policy explains how Brainware Medical College & Hospital uses cookies and browser local storage technology to deliver secure, seamless, and customized web experiences on our digital healthcare portal.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
            <span>📅 Effective Date: August 2026</span>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        
        {/* Quick Overview */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2 text-xs text-amber-950">
          <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2">
            <span>💡 What Are Cookies?</span>
          </h3>
          <p className="leading-relaxed text-amber-800">
            Cookies are small text files stored on your device when you visit websites. They help our portal recognize your browser, maintain secure login sessions, save your dark/light theme preferences, and keep your OPD token booking state active.
          </p>
        </div>

        {/* Detailed Cookie Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-card space-y-8 text-darkNavy">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="font-poppins font-bold text-xl text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>1. Types of Cookies We Use</span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-darkNavy">1. Strictly Necessary Session Cookies</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">MANDATORY</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">Essential for user authentication, 2FA security validation, and maintaining secure login states across patient and doctor dashboards.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-darkNavy">2. Preference & Customization Cookies</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">PREFERENCES</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">Used to store your UI settings such as Dark Mode / Light Mode theme selections, font size preferences, and default language settings.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-darkNavy">3. Performance & System Diagnostic Cookies</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">ANALYTICS</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">Helps us monitor server load times, page responsiveness, and portal navigation performance to continuously improve OPD token booking speeds.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-xl text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>2. How to Control or Delete Cookies</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Most web browsers automatically accept cookies, but you can modify your browser settings to decline or clear cookies at any time:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5 leading-relaxed">
              <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data.</li>
              <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data.</li>
              <li><strong>Apple Safari:</strong> Preferences → Privacy → Manage Website Data.</li>
            </ul>
            <p className="text-xs text-rose-600 font-semibold pt-1">
              ⚠️ Note: Disabling strictly necessary cookies may cause login authentication errors or prevent OPD token bookings from processing correctly.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-xl text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>3. Contact Web Support</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              For questions regarding our web cookie practices or technical portal support, please email <strong>it-support@brainwarehospital.com</strong>.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
