package com.brainware.hospital.model;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.annotations.SerializedName;

public class Appointment {
    @SerializedName("_id")
    private String id;
    private String patientName;
    private String patientPhone;
    private String patientEmail;

    // Sometimes a bare ObjectId string (e.g. response of POST /book), sometimes
    // a populated Doctor object (e.g. GET /patient/:id history) — see
    // backend/controllers/appointmentController.js. Parse defensively.
    private JsonElement doctor;

    private String departmentName;
    private boolean needsReceptionistAssignment;
    private String appointmentDate;
    private String appointmentTime;
    private String status;
    private int queueNumber;
    private String tokenNumber;
    private int estimatedWaitMinutes;
    private Integer age;
    private String bloodGroup;
    private String reasonForVisit;
    private String cancellationReason;
    private boolean videoConsultation;
    private double paymentAmount;
    private String paymentStatus;
    private String createdAt;

    public String getId() { return id; }
    public String getPatientName() { return patientName; }
    public String getPatientPhone() { return patientPhone; }
    public String getPatientEmail() { return patientEmail; }
    public String getDepartmentName() { return departmentName; }
    public boolean isNeedsReceptionistAssignment() { return needsReceptionistAssignment; }
    public String getAppointmentDate() { return appointmentDate; }
    public String getAppointmentTime() { return appointmentTime; }
    public String getStatus() { return status; }
    public int getQueueNumber() { return queueNumber; }
    public String getTokenNumber() { return tokenNumber; }
    public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public Integer getAge() { return age; }
    public String getBloodGroup() { return bloodGroup; }
    public String getReasonForVisit() { return reasonForVisit; }
    public String getCancellationReason() { return cancellationReason; }
    public boolean isVideoConsultation() { return videoConsultation; }
    public double getPaymentAmount() { return paymentAmount; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getCreatedAt() { return createdAt; }

    /** Best-effort doctor display name whether "doctor" is populated or a bare id. */
    public String getDoctorName() {
        if (doctor == null || doctor.isJsonNull()) return "Assigned by Reception";
        if (doctor.isJsonObject() && doctor.getAsJsonObject().has("fullName")) {
            return "Dr. " + doctor.getAsJsonObject().get("fullName").getAsString();
        }
        return "Assigned by Reception";
    }

    public String getDoctorId() {
        if (doctor == null || doctor.isJsonNull()) return null;
        if (doctor.isJsonObject() && doctor.getAsJsonObject().has("_id")) {
            return doctor.getAsJsonObject().get("_id").getAsString();
        }
        if (doctor.isJsonPrimitive()) return doctor.getAsString();
        return null;
    }

    public boolean isCancellable() {
        return "PENDING".equals(status) || "ACCEPTED".equals(status);
    }

    public String toJson() {
        return new Gson().toJson(this);
    }
}
