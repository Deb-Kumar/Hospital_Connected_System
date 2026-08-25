import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Header/Navbar';
import Hero from '../components/Hero/Hero';
import EmergencyServices from '../components/Emergency/EmergencyServices';
import FeaturedDoctors from '../components/FeaturedDoctors/FeaturedDoctors';
import AboutUs from '../components/About/AboutUs';
import WhyChooseUs from '../components/WhyChooseUs/WhyChooseUs';
import HospitalServices from '../components/Services/HospitalServices';
import AppointmentSection from '../components/Appointment/AppointmentSection';
import FindDoctor from '../components/FindDoctor/FindDoctor';
import Facilities from '../components/Facilities/Facilities';
import HealthBlog from '../components/HealthBlog/HealthBlog';
import Testimonials from '../components/Testimonials/Testimonials';
import Statistics from '../components/Statistics/Statistics';
import Insurance from '../components/Insurance/Insurance';
import PatientPortalBanner from '../components/PatientPortal/PatientPortalBanner';
import Contact from '../components/Contact/Contact';
import Footer from '../components/Footer/Footer';
import axiosClient from '../api/axiosClient';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // Modal & Selection State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [bookingDept, setBookingDept] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  // Fetch departments & doctors from backend REST API
  useEffect(() => {
    axiosClient.get('/departments')
      .then((res) => setDepartments(res.data))
      .catch(() => {});

    axiosClient.get('/doctor/all')
      .then((res) => setDoctors(res.data || []))
      .catch(() => {});
  }, []);

  function handleOpenAppointmentModal(deptName = '', doctorObj = null) {
    if (deptName) setBookingDept(deptName);
    if (doctorObj) setBookingDoctor(doctorObj);
    setIsAppointmentModalOpen(true);
  }

  function handleSelectDepartment(deptName) {
    setBookingDept(deptName);
    setIsAppointmentModalOpen(true);
  }

  function handleSelectDoctor(doctorObj) {
    setBookingDoctor(doctorObj);
    if (doctorObj?.department?.name) {
      setBookingDept(doctorObj.department.name);
    }
    setIsAppointmentModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-softBg font-inter text-darkNavy selection:bg-primary selection:text-white">
      
      {/* 1. Sticky Header & Navigation */}
      <Navbar
        onOpenAppointmentModal={() => handleOpenAppointmentModal()}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* 2. Hero Section */}
      <Hero
        departments={departments}
        onOpenAppointmentModal={() => handleOpenAppointmentModal()}
      />

      {/* 3. Emergency Services */}
      <EmergencyServices
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* 7. Why Choose Us */}
      <WhyChooseUs />

      {/* 8. Hospital Major Services */}
      <HospitalServices />

      {/* 12. Hospital Facilities */}
      <Facilities />

      {/* 4. Find Your Specialist Doctor Section */}
      <FeaturedDoctors doctors={doctors} onSelectDoctor={handleSelectDoctor} />

      {/* 13. Health Tips / Latest Medical News */}
      <HealthBlog />

      {/* 14. Patient Testimonials */}
      <Testimonials />

      {/* 15. Hospital Statistics */}
      <Statistics />

      {/* 16. Insurance & Cashless Services */}
      <Insurance />

      {/* 17. Patient Portal Banner */}
      <PatientPortalBanner />

      {/* 18. Contact & Location Map */}
      <Contact />

      {/* 19 & 20. Footer */}
      <Footer
        onOpenAppointmentModal={() => handleOpenAppointmentModal()}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Floating Emergency Call Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="bg-emergency hover:bg-emergencyDark text-white p-4 rounded-full shadow-glow transform hover:scale-110 transition duration-300 flex items-center justify-center text-2xl group relative"
          aria-label="24x7 Emergency Call"
        >
          🚨
          <span className="absolute right-16 bg-darkNavy text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-300 shadow">
            24x7 Emergency Help
          </span>
        </button>
      </div>

      {/* Emergency Helpline Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl z-20"
            >
              ✕
            </button>

            <div className="w-16 h-16 bg-emergencyLight text-emergency rounded-full flex items-center justify-center text-3xl mx-auto font-bold">
              🚨
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-poppins font-extrabold text-2xl text-emergency">
                24×7 Emergency Desk
              </h3>
              <p className="text-xs text-slateText">
                Brainware Medical College & Hospital — Critical Response Unit
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs">
              <p className="font-bold text-red-900">🚑 Ambulance Dispatch Hotline:</p>
              <a href="tel:108" className="block text-2xl font-poppins font-extrabold text-emergency hover:underline">
                CALL 108 (Toll Free)
              </a>
              <p className="text-red-700">Direct ER Floor Desk: <strong>+91 98765 43210</strong></p>
            </div>

            <div className="space-y-2 text-xs text-slateText">
              <div className="flex justify-between p-2 bg-softBg rounded-lg">
                <span>Trauma Center:</span>
                <span className="font-bold text-darkNavy">Level-1 Ready</span>
              </div>
              <div className="flex justify-between p-2 bg-softBg rounded-lg">
                <span>Blood Bank:</span>
                <span className="font-bold text-darkNavy">24x7 Active</span>
              </div>
              <div className="flex justify-between p-2 bg-softBg rounded-lg">
                <span>ICU / CCU Beds:</span>
                <span className="font-bold text-emerald-600">Available</span>
              </div>
            </div>

            <a
              href="tel:108"
              className="block w-full bg-emergency hover:bg-emergencyDark text-white py-3 rounded-xl font-poppins font-bold text-center text-sm shadow transition"
            >
              📞 Call Emergency Now
            </a>
          </div>
        </div>
      )}

      {/* Quick Booking Modal */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl lg:max-w-6xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAppointmentModalOpen(false)}
              className="absolute top-4 right-4 text-slateText hover:text-darkNavy font-bold text-xl z-20"
            >
              ✕
            </button>

            <AppointmentSection
              initialDept={bookingDept}
              initialDoctor={bookingDoctor}
              isModal={true}
              onBookingComplete={() => {
                setIsAppointmentModalOpen(false);
                setBookingDept('');
                setBookingDoctor(null);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
