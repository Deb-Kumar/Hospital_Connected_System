import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import BookingSuccessModal from '../components/Appointment/BookingSuccessModal';

export default function GuestBooking() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [videoConsultation, setVideoConsultation] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    axiosClient.get('/departments').then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!departmentId) { setDoctors([]); return; }
    axiosClient.get(`/doctor/department/${departmentId}`).then((res) => setDoctors(res.data)).catch(() => {});
  }, [departmentId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/appointments/book-guest', {
        fullName, phone, email: email || undefined, age, bloodGroup,
        doctorId, appointmentDate: date, appointmentTime: time,
        reasonForVisit: reason, videoConsultation,
      });
      setBookingResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
        <Link to="/" className="font-bold text-primary text-lg">Brainware Medical College & Hospital</Link>
        <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition">Login</Link>
      </header>

      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Book an Appointment</h1>
        <p className="text-sm text-gray-500 mb-6">No account needed — just fill in your details below.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Your Full Name</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <input type="tel" required maxLength={10} placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Age (Years) *</label>
              <input type="number" required min="1" max="120" placeholder="e.g. 28" value={age} onChange={(e) => setAge(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Blood Group *</label>
              <select required value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select blood group *</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Department</label>
            <select required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2">
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Doctor</label>
            <select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)} disabled={!departmentId}
              className="mt-1 w-full border rounded-lg px-3 py-2">
              <option value="">Select doctor</option>
              {doctors.map((d) => {
                const rawName = d.user?.fullName || d.fullName || 'Doctor';
                const docName = /^dr\.?/i.test(rawName.trim()) ? rawName.trim() : `Dr. ${rawName.trim()}`;
                return (
                  <option key={d._id} value={d._id}>
                    {docName} {d.onLeave ? '(On Leave)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Time</label>
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Reason for Visit</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
              className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={videoConsultation} onChange={(e) => setVideoConsultation(e.target.checked)} />
            Video Consultation (Telemedicine)
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primaryDark transition disabled:opacity-60">
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Want to track your history?{' '}
            <Link to="/register" className="text-primary font-medium">Sign up</Link> instead.
          </p>
        </form>
      </div>

      {bookingResult && (
        <BookingSuccessModal booking={bookingResult} onClose={() => navigate('/')} />
      )}
    </div>
  );
}
