import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Header/DashboardNavbar';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [videoConsultation, setVideoConsultation] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const { data } = await axiosClient.post('/appointments/book', {
        patientId: user.id, // resolved server-side to the Patient record in a full build
        doctorId, appointmentDate: date, appointmentTime: time,
        reasonForVisit: reason, videoConsultation,
      });
      alert(`Booked! Token: ${data.tokenNumber}`);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Slot may be taken.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar title="Book Appointment" />
      <div className="max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Department</label>
            <select
              required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Doctor (Real-Time Availability)</label>
            <select
              required value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2" disabled={!departmentId}
            >
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
            <input type="checkbox" checked={videoConsultation}
              onChange={(e) => setVideoConsultation(e.target.checked)} />
            Video Consultation (Telemedicine)
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primaryDark transition disabled:opacity-60"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
