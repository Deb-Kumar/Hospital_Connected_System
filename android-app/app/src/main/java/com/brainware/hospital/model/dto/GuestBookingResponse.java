package com.brainware.hospital.model.dto;

/** Response shape of POST /api/appointments/book-guest — deliberately
 *  different from the logged-in booking endpoint's raw Appointment object,
 *  see backend/controllers/appointmentController.js bookGuest(). */
public class GuestBookingResponse {
    public String appointmentId;
    public String tokenNumber;
    public int queueNumber;
    public String appointmentDate;
    public String appointmentTime;
    public String patientName;
    public String doctorName;
    public String departmentName;
    public boolean isGuestAccount;
    public boolean success = true;
    public String message;
}
