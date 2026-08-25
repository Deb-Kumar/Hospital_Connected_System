import React from 'react';
import { Link } from 'react-router-dom';

export default function BookingSuccessModal({ booking, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-primary text-white text-center py-6 px-6">
          <div className="text-3xl mb-1">✅</div>
          <h2 className="font-bold text-lg">Appointment Booked</h2>
        </div>

        <div className="p-6 space-y-3">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Your Token Number</p>
            <p className="text-2xl font-bold text-primary">{booking.tokenNumber}</p>
          </div>

          {/* SMS & WhatsApp Confirmation Status */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-center gap-2 text-center text-xs text-emerald-900 font-medium">
            <span>💬</span>
            <span>SMS & WhatsApp Confirmation Dispatched to Mobile</span>
          </div>

          <Row label="Patient" value={booking.patientName} />
          <Row label="Doctor" value={booking.doctorName?.toLowerCase()?.includes('dr') ? booking.doctorName : `Dr. ${booking.doctorName || 'Assigned by Reception'}`} />
          <Row label="Department" value={booking.departmentName} />
          <Row label="Date & Time" value={`${booking.appointmentDate} at ${booking.appointmentTime}`} />
          <Row label="Queue Number" value={booking.queueNumber} />

          <div className="border-t pt-4 mt-2">
            <p className="text-sm text-gray-600 text-center">
              If you want to access your past history or patient records, please{' '}
              <Link to="/login" className="text-primary font-semibold">Login</Link>
              {' '}or{' '}
              <Link to="/register" className="text-primary font-semibold">Sign Up</Link>
              {' '}using this phone number.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primaryDark transition mt-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
