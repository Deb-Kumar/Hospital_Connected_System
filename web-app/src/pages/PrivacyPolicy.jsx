import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Footer from '../components/Footer/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-darkNavy text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-sky-300 border border-primary/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <span>🔒 Data Protection & Confidentiality</span>
          </div>
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
            Privacy Policy & Data Security
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Brainware Medical College & Hospital is committed to safeguarding patient health information, digital medical records, and personal privacy in accordance with applicable healthcare laws and data protection standards.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
            <span>📅 Effective Date: August 2026</span>
            <span>•</span>
            <span>🏛️ Regulatory Body: NABH & DISHA Compliant</span>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        
        {/* Quick Summary Banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-2 text-xs text-indigo-950">
          <h3 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
            <span>🛡️ Summary of Patient Privacy Rights</span>
          </h3>
          <p className="leading-relaxed text-indigo-800">
            We store medical records and personal data strictly for diagnostic treatment, appointment scheduling, and clinical continuity. We never sell patient data to third parties. All electronic health records (EHR) are encrypted using 256-bit SSL protocols.
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-card space-y-8 text-darkNavy">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>1. Information We Collect</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To provide clinical care and online consultation services, we collect:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5 leading-relaxed">
              <li><strong>Personal Identification Data:</strong> Full name, age, gender, date of birth, mobile number, residential address, and email address.</li>
              <li><strong>Medical & Health Data:</strong> Symptoms, diagnosis reports, lab test results, prescription history, allergies, and attending doctor consultation records.</li>
              <li><strong>Technical Session Data:</strong> IP address, device operating system, browser type, and authentication logs during OPD booking sessions.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>2. How We Use Your Health Information</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Collected information is exclusively utilized for medical treatment, hospital operational workflows, and patient communication:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5 leading-relaxed">
              <li>Scheduling OPD consultations, video calls, and specialist appointments.</li>
              <li>Generating digital OPD tokens, laboratory test reports, and e-prescriptions.</li>
              <li>Sending SMS alerts, email confirmations, and 2FA authentication security codes.</li>
              <li>Internal clinical audits, medical quality control, and hospital emergency alerts.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>3. Data Security & Storage Controls</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We employ enterprise-grade security infrastructure to safeguard your records:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-xs text-darkNavy">🔐 256-Bit SSL Encryption</h4>
                <p className="text-xs text-slate-500">All data in transit and at rest is secured via end-to-end cryptographic protocols.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-xs text-darkNavy">🛡️ Access-Controlled EHR</h4>
                <p className="text-xs text-slate-500">Only authorized attending medical staff and doctors have access to your clinical diagnostic records.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>4. Third-Party Sharing & Compliance</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We do not sell, rent, or trade patient personal information to commercial third parties. Disclosure only occurs under strict legal mandates:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5 leading-relaxed">
              <li>When mandated by statutory healthcare authorities or court orders.</li>
              <li>With partner diagnostic laboratories when you request integrated pathology tests.</li>
              <li>In medical emergency situations to protect vital life interests of the patient.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="font-poppins font-bold text-lg text-primary flex items-center gap-2">
              <span>5. Contact Data Privacy Officer</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If you have queries, requests to update your health records, or privacy concerns, please contact our Data Protection Officer:
            </p>
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-1 text-xs text-darkNavy font-medium">
              <p>🏢 <strong>Brainware Medical College & Hospital Data Office</strong></p>
              <p>📧 Email: <a href="mailto:privacy@brainwarehospital.com" className="text-primary hover:underline font-bold">privacy@brainwarehospital.com</a></p>
              <p>📞 Phone: +91 1800-123-4567 (Ext 802)</p>
            </div>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
