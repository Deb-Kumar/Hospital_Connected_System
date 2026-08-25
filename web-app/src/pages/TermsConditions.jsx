import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-darkNavy text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-sky-300 border border-primary/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <span>📜 Terms of Portal Use</span>
          </div>
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
            Terms & Conditions
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Please read these Terms & Conditions carefully before using the online OPD token booking, consultation scheduling, and medical portal services of Brainware Medical College & Hospital.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
            <span>📅 Last Updated: August 2026</span>
            <span>•</span>
            <span>⚖️ Legal Framework: Medical Council Regulations</span>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        
        {/* Emergency Medical Disclaimer Callout */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-2 text-xs text-rose-950">
          <h3 className="font-bold text-sm text-rose-900 flex items-center gap-2">
            <span>🚨 EMERGENCY MEDICAL DISCLAIMER</span>
          </h3>
          <p className="leading-relaxed text-rose-800">
            This digital portal is designed exclusively for OPD consultation token booking, lab report tracking, and non-emergency medical scheduling. If you or a patient are experiencing a life-threatening medical emergency, cardiac event, severe trauma, or acute respiratory distress, please call emergency services immediately or report directly to the nearest Emergency Casualty Ward.
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-card space-y-8 text-darkNavy">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>1. Acceptance of Terms</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              By accessing our online hospital portal, registering a patient profile, or booking an OPD appointment, you agree to be bound by these Terms & Conditions and all applicable hospital operating policies. If you do not agree to these terms, please do not use our digital services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>2. OPD Booking & Token Rules</span>
            </h2>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5 leading-relaxed">
              <li><strong>Token Validity:</strong> OPD consultation tokens are valid strictly for the selected date, time slot, and specialist department.</li>
              <li><strong>Reporting Time:</strong> Patients are required to report to the OPD Reception Counter 15 minutes prior to their assigned token time.</li>
              <li><strong>Doctor Availability:</strong> In the event of emergency medical surgeries or urgent hospital calls, attending doctor schedules may shift. Hospital staff will attempt to reassign or notify affected patients promptly.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>3. User Accounts & Security</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Users are responsible for maintaining the confidentiality of their login credentials, 2FA OTP security codes, and profile passwords. Any unauthorized activity performed under your account must be reported immediately to hospital administration.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>4. Tariff & Payment Guidelines</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              OPD consultation fees and diagnostic test charges are fixed according to official hospital tariff charts. Payment receipts issued online or at the reception desk serve as valid proof for insurance claims and hospital billing verification.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>5. Legal Jurisdiction</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with the use of hospital digital services shall be subject to the exclusive jurisdiction of the competent courts of Kolkata, West Bengal.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
