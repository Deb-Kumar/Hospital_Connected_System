import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';

export default function PatientCharter() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-darkNavy text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <span>🏛️ NABH Accredited Charter</span>
          </div>
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
            Patient Rights & Responsibilities Charter
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Brainware Medical College & Hospital is committed to delivering compassionate, ethical, and transparent healthcare. This charter outlines your fundamental rights as a patient and your responsibilities towards healthcare providers.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
            <span>🏥 Standard: NABH & National Patient Rights Framework</span>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        
        {/* Core Promise Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <span>✅ Your Rights as a Patient</span>
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Every patient visiting Brainware Hospital has the right to receive respectful, non-discriminatory medical treatment, complete confidentiality, and transparent information regarding their diagnosis and care plan.
            </p>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-sky-950 flex items-center gap-2">
              <span>🤝 Your Responsibilities</span>
            </h3>
            <p className="text-xs text-sky-800 leading-relaxed">
              Patients are expected to provide accurate medical history, treat medical staff with dignity and respect, adhere to prescribed treatment plans, and follow hospital rules.
            </p>
          </div>
        </div>

        {/* Detailed Rights & Responsibilities Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-card space-y-8 text-darkNavy">
          
          {/* Part A: Patient Rights */}
          <section className="space-y-4">
            <h2 className="font-poppins font-bold text-xl text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>1. Fundamental Patient Rights</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-xs text-darkNavy">1. Right to Dignified & Compassionate Care</h4>
                <p className="text-xs text-slate-600 leading-relaxed">To receive humane, respectful medical treatment without discrimination based on gender, caste, religion, or economic background.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-xs text-darkNavy">2. Right to Information & Informed Consent</h4>
                <p className="text-xs text-slate-600 leading-relaxed">To be fully informed about your diagnosis, prognosis, treatment options, potential risks, and expected costs prior to any clinical procedure.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-xs text-darkNavy">3. Right to Confidentiality & Privacy</h4>
                <p className="text-xs text-slate-600 leading-relaxed">To have all diagnostic reports, medical histories, and consultation discussions kept strictly confidential between you and your care team.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-xs text-darkNavy">4. Right to Second Opinion</h4>
                <p className="text-xs text-slate-600 leading-relaxed">To seek a second medical opinion from another qualified specialist without compromise to your ongoing hospital treatment.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 sm:col-span-2">
                <h4 className="font-bold text-xs text-darkNavy">5. Right to Access Medical Records & Itemized Tariff</h4>
                <p className="text-xs text-slate-600 leading-relaxed">To request digital or printed copies of your medical discharge summaries, lab test results, prescriptions, and an itemized breakdown of hospital bills.</p>
              </div>
            </div>
          </section>

          {/* Part B: Patient Responsibilities */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-xl text-primary flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>2. Patient Responsibilities</span>
            </h2>

            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
              <li><strong>Provide Accurate Information:</strong> Disclose complete medical history, previous illnesses, allergies, current medications, and past surgeries to your attending physician.</li>
              <li><strong>Follow Treatment Advice:</strong> Adhere faithfully to prescribed medication dosages, dietary recommendations, and post-consultation follow-up appointments.</li>
              <li><strong>Respect Hospital Staff & Patients:</strong> Maintain decorum, refrain from verbal or physical abuse toward doctors and healthcare workers, and respect the privacy of fellow patients.</li>
              <li><strong>Financial Responsibilities:</strong> Ensure timely settlement of OPD consultation tokens and hospital admission bills in accordance with agreed tariffs.</li>
            </ul>
          </section>

          {/* Grievance Desk */}
          <section className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs text-indigo-950">
            <h4 className="font-bold text-sm text-indigo-900">☎️ Patient Grievance & Help Desk</h4>
            <p className="text-indigo-800 leading-relaxed">
              If you feel any of your rights listed in this charter have been compromised, please report directly to our Patient Relations Manager at <strong>helpdesk@brainwarehospital.com</strong> or call <strong>+91 1800-123-4567 (Ext 101)</strong>.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
