package com.brainware.hospital.model;

import com.brainware.hospital.BuildConfig;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.annotations.SerializedName;

public class Appointment {
    @SerializedName("_id")
    private String id;
    private String patientName;
    private String patientPhone;
    private String patientEmail;

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
    public String getFormattedToken() {
        if (queueNumber > 0) {
            return "Token #" + queueNumber;
        }
        if (tokenNumber != null && !tokenNumber.trim().isEmpty()) {
            if (tokenNumber.startsWith("Token #")) return tokenNumber;
            return "Token #" + tokenNumber;
        }
        return "Token #1";
    }

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

    public String getFormattedBookingTime() {
        if (createdAt == null || createdAt.trim().isEmpty()) {
            return "";
        }
        try {
            String cleanStr = createdAt.replace("Z", "+00:00");
            if (cleanStr.contains(".")) {
                cleanStr = cleanStr.substring(0, cleanStr.indexOf(".")) + "+00:00";
            }
            java.text.SimpleDateFormat isoFormat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US);
            isoFormat.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
            java.util.Date date = isoFormat.parse(cleanStr.substring(0, 19));
            if (date != null) {
                java.text.SimpleDateFormat outFormat = new java.text.SimpleDateFormat("dd MMM, hh:mm a", java.util.Locale.US);
                return "Booked: " + outFormat.format(date);
            }
        } catch (Exception ignored) {}

        if (createdAt.length() >= 16) {
            String datePart = createdAt.substring(0, 10);
            String timePart = createdAt.substring(11, 16);
            return "Booked: " + datePart + " " + timePart;
        }
        return "Booked: " + createdAt;
    }

    public String getDoctorName() {
        if (doctor == null || doctor.isJsonNull()) return "Doctor not assigned";
        if (doctor.isJsonObject() && doctor.getAsJsonObject().has("fullName")) {
            String name = doctor.getAsJsonObject().get("fullName").getAsString();
            if (name == null || name.trim().isEmpty() || name.toLowerCase().contains("reception") || name.toLowerCase().contains("assigned")) {
                return "Doctor not assigned";
            }
            if (name.toLowerCase().startsWith("dr.")) return name;
            return "Dr. " + name;
        }
        return "Doctor not assigned";
    }

    public String getDoctorId() {
        if (doctor == null || doctor.isJsonNull()) return null;
        if (doctor.isJsonObject() && doctor.getAsJsonObject().has("_id")) {
            return doctor.getAsJsonObject().get("_id").getAsString();
        }
        if (doctor.isJsonPrimitive()) return doctor.getAsString();
        return null;
    }

    public String getDoctorPhotoUrl() {
        if (doctor == null || doctor.isJsonNull()) return null;
        if (doctor.isJsonObject()) {
            String url = null;
            if (doctor.getAsJsonObject().has("avatarUrl") && !doctor.getAsJsonObject().get("avatarUrl").isJsonNull()) {
                url = doctor.getAsJsonObject().get("avatarUrl").getAsString();
            } else if (doctor.getAsJsonObject().has("profileImage") && !doctor.getAsJsonObject().get("profileImage").isJsonNull()) {
                url = doctor.getAsJsonObject().get("profileImage").getAsString();
            }
            if (url != null && !url.trim().isEmpty()) {
                url = url.trim();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return url;
                }
                String baseUrl = BuildConfig.BASE_URL;
                String hostUrl = "https://hospital-connected-system.onrender.com";
                if (baseUrl != null && baseUrl.contains("://")) {
                    int apiIdx = baseUrl.indexOf("/api");
                    if (apiIdx != -1) {
                        hostUrl = baseUrl.substring(0, apiIdx);
                    } else {
                        hostUrl = baseUrl.replaceAll("/+$", "");
                    }
                }
                if (url.startsWith("/")) return hostUrl + url;
                return hostUrl + "/uploads/doctors/" + url;
            }
        }
        return null;
    }

    public String getDoctorAvailabilitySchedule() {
        if (doctor == null || doctor.isJsonNull()) return null;
        if (doctor.isJsonObject() && doctor.getAsJsonObject().has("availabilitySchedule") && !doctor.getAsJsonObject().get("availabilitySchedule").isJsonNull()) {
            return doctor.getAsJsonObject().get("availabilitySchedule").getAsString();
        }
        return null;
    }

    public boolean isCancellable() {
        return "PENDING".equals(status) || "ACCEPTED".equals(status);
    }

    public String toJson() {
        return new Gson().toJson(this);
    }
}
