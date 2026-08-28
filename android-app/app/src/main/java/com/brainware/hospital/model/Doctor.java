package com.brainware.hospital.model;

import com.brainware.hospital.BuildConfig;
import com.google.gson.JsonElement;
import com.google.gson.annotations.SerializedName;

public class Doctor {
    @SerializedName("_id")
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String role;

    private JsonElement department;

    private String qualification;
    private String specialization;
    private String bio;
    private int experienceYears;
    private double consultationFee;
    private String availabilitySchedule;
    private boolean onLeave;
    private String leaveReason;
    private String approvalStatus;
    private double rating;
    private String profileImage;
    private String avatarUrl;

    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getRole() { return role; }
    public String getQualification() { return qualification; }
    public String getSpecialization() { return specialization; }
    public String getBio() { return bio; }
    public int getExperienceYears() { return experienceYears; }
    public double getConsultationFee() { return consultationFee; }
    public String getAvailabilitySchedule() { return availabilitySchedule; }
    public boolean isOnLeave() { return onLeave; }
    public String getLeaveReason() { return leaveReason; }
    public String getApprovalStatus() { return approvalStatus; }
    public double getRating() { return rating; }
    public String getProfileImage() { return profileImage; }
    public String getAvatarUrl() { return avatarUrl; }

    public String getPhotoUrl() {
        String url = (avatarUrl != null && !avatarUrl.trim().isEmpty()) ? avatarUrl : profileImage;
        if (url == null || url.trim().isEmpty()) return null;
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

        if (url.startsWith("/")) {
            return hostUrl + url;
        }
        return hostUrl + "/uploads/doctors/" + url;
    }

    public String getDepartmentName() {
        if (department == null || department.isJsonNull()) return "General Medicine";
        if (department.isJsonObject() && department.getAsJsonObject().has("name")) {
            return department.getAsJsonObject().get("name").getAsString();
        }
        return "General Medicine";
    }

    public String getDepartmentId() {
        if (department == null || department.isJsonNull()) return null;
        if (department.isJsonObject() && department.getAsJsonObject().has("_id")) {
            return department.getAsJsonObject().get("_id").getAsString();
        }
        if (department.isJsonPrimitive()) {
            return department.getAsString();
        }
        return null;
    }
}
