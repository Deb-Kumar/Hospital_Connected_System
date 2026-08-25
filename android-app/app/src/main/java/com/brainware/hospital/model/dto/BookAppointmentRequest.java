package com.brainware.hospital.model.dto;

/** Body for POST /api/appointments/book (logged-in patient). */
public class BookAppointmentRequest {
    public String patientId;
    public String doctorId;
    public String departmentName;
    public String appointmentDate; // YYYY-MM-DD
    public String appointmentTime; // HH:mm
    public String reasonForVisit;
    public boolean videoConsultation;
    public Integer age;
    public String bloodGroup;
    public String email;
}
