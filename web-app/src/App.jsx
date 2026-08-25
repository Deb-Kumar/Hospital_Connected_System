import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import OtpVerification from './pages/OtpVerification';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import GuestBooking from './pages/GuestBooking';
import Departments from './pages/Departments';
import Doctors from './pages/Doctors';
import About from './pages/About';
import Services from './pages/Services';
import Blogs from './pages/Blogs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import PatientCharter from './pages/PatientCharter';
import CookiePolicy from './pages/CookiePolicy';
import NotFound from './pages/NotFound';

import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import AppointmentHistory from './pages/AppointmentHistory';
import MedicalHistory from './pages/MedicalHistory';
import Profile from './pages/Profile';

import DoctorDashboard from './pages/DoctorDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

import ProtectedRoute from './components/Auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/about" element={<About />} />
      <Route path="/about/overview" element={<About />} />
      <Route path="/about/mission" element={<About />} />
      <Route path="/about/careers" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/book" element={<GuestBooking />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/patient-charter" element={<PatientCharter />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />

      {/* Patient */}
      <Route path="/patient" element={
        <ProtectedRoute roles={['PATIENT']}><PatientDashboard /></ProtectedRoute>
      } />
      <Route path="/patient/book" element={
        <ProtectedRoute roles={['PATIENT']}><BookAppointment /></ProtectedRoute>
      } />
      <Route path="/patient/history" element={
        <ProtectedRoute roles={['PATIENT']}><AppointmentHistory /></ProtectedRoute>
      } />
      <Route path="/patient/records" element={
        <ProtectedRoute roles={['PATIENT']}><MedicalHistory /></ProtectedRoute>
      } />
      <Route path="/patient/profile" element={
        <ProtectedRoute roles={['PATIENT']}><Profile /></ProtectedRoute>
      } />

      {/* Doctor */}
      <Route path="/doctor" element={
        <ProtectedRoute roles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>
      } />

      {/* Staff */}
      <Route path="/staff" element={
        <ProtectedRoute roles={['STAFF']}><StaffDashboard /></ProtectedRoute>
      } />
      <Route path="/staff/dashboard" element={
        <ProtectedRoute roles={['STAFF']}><StaffDashboard /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
