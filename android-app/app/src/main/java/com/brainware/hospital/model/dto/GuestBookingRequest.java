package com.brainware.hospital.model.dto;

/** Body for POST /api/appointments/book-guest — no auth required. */
public class GuestBookingRequest {
    public String fullName;
    public String phone;
    public String email;
    public String doctorId;
    public String departmentName;
    public String appointmentDate;
    public String appointmentTime;
    public String reasonForVisit;
    public boolean videoConsultation;
    public Integer age;
    public String bloodGroup;
}
