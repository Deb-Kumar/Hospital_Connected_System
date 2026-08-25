import React, { useState } from 'react';

export default function Insurance() {
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [policyNo, setPolicyNo] = useState('');
  const [insurer, setInsurer] = useState('Star Health');
  const [checkResult, setCheckResult] = useState(null);

  const partners = [
    { name: 'Star Health & Allied Insurance', tag: 'Cashless Partner' },
    { name: 'HDFC ERGO Health Insurance', tag: 'Cashless Partner' },
    { name: 'Niva Bupa Health Insurance', tag: 'Cashless Partner' },
    { name: 'ICICI Lombard General Insurance', tag: 'Cashless Partner' },
    { name: 'Swasthya Sathi (West Bengal Govt)', tag: 'Government Scheme' },
    { name: 'Ayushman Bharat PM-JAY', tag: 'Government Scheme' },
    { name: 'Care Health Insurance (Religare)', tag: 'Cashless Partner' },
    { name: 'Bajaj Allianz General Insurance', tag: 'Cashless Partner' },
  ];

  function handleCheckCoverage(e) {
    e.preventDefault();
    setCheckResult({
      eligible: true,
      provider: insurer,
      policy: policyNo || 'POL-8910293',
      preAuthTime: 'Instant (Under 30 mins)',
      message: 'Your insurance provider is fully covered for 100% cashless treatment at Brainware Medical College & Hospital.',
    });
  }

  return (
    <section className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-5">
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primaryLight px-3 py-1 rounded-full">
              Hassle-Free Medical Billing
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-darkNavy">
              Insurance & Cashless Treatment Support
            </h2>
            <p className="text-slateText text-sm leading-relaxed">
              We partner with leading Health Insurance Companies and Third Party Administrators (TPAs) to offer seamless cashless hospital admissions, Ayushman Bharat, and Swasthya Sathi card processing.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold text-lg">✓</span>
                <p className="text-xs text-darkNavy font-semibold">Instant TPA Pre-Authorization within 30 minutes</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold text-lg">✓</span>
                <p className="text-xs text-darkNavy font-semibold">100% Cashless Hospitalization for IPD surgeries</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold text-lg">✓</span>
                <p className="text-xs text-darkNavy font-semibold">Dedicated TPA Helpdesk on 1st Floor (Ext. 402)</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={() => setShowCheckModal(true)}
                className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-xl font-poppins font-semibold text-xs shadow transition"
              >
                🔍 Check Insurance Coverage
              </button>
              <a
                href="tel:+919876543210"
                className="bg-softBg text-darkNavy border border-slate-300 hover:border-primary px-5 py-3 rounded-xl font-poppins font-semibold text-xs transition flex items-center gap-1.5"
              >
                📞 Contact Insurance Desk
              </a>
            </div>
          </div>

          {/* Right Partner Badges Grid */}
          <div className="lg:col-span-6">
            <div className="bg-softBg rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
              <h3 className="font-poppins font-bold text-base text-darkNavy mb-4">
                Supported Insurance Partners & Schemes
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {partners.map((p, i) => (
                  <div
                    key={i}
                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-poppins font-bold text-xs text-darkNavy">{p.name}</h4>
                      <span className="text-[10px] text-emerald-600 font-medium">{p.tag}</span>
                    </div>
                    <span className="text-emerald-500 font-bold">✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Coverage Check Modal */}
      {showCheckModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => { setShowCheckModal(false); setCheckResult(null); }}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl"
            >
              ✕
            </button>

            <h3 className="font-poppins font-bold text-xl text-darkNavy">Insurance Eligibility Checker</h3>

            {!checkResult ? (
              <form onSubmit={handleCheckCoverage} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-darkNavy mb-1">Select Insurance Provider</label>
                  <select
                    value={insurer}
                    onChange={(e) => setInsurer(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-softBg"
                  >
                    {partners.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-darkNavy mb-1">Policy / Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P/12345/01/2026/0009"
                    value={policyNo}
                    onChange={(e) => setPolicyNo(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-softBg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-bold text-xs shadow"
                >
                  Verify Cashless Approval Status
                </button>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200">
                  <p className="font-bold text-sm mb-1">✓ Fully Cashless Approved!</p>
                  <p>{checkResult.message}</p>
                </div>
                <div className="space-y-1 text-slateText">
                  <p><strong>Provider:</strong> {checkResult.provider}</p>
                  <p><strong>Policy No:</strong> {checkResult.policy}</p>
                  <p><strong>Est. Pre-Auth Time:</strong> {checkResult.preAuthTime}</p>
                </div>
                <button
                  onClick={() => { setShowCheckModal(false); setCheckResult(null); }}
                  className="w-full bg-darkNavy text-white py-2.5 rounded-xl font-semibold"
                >
                  Close & Proceed to Admission Desk
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
