package com.brainware.hospital.model.dto;

/** GET /api/settings/public — safe, non-sensitive subset the app can call
 *  without being logged in. See backend/controllers/adminController.js
 *  getPublicSettings(). */
public class PublicSettings {
    public String hospitalName;
    public String emergencyHotline;
    public String supportEmail;
    public String opdOpeningTime;
    public String opdClosingTime;
    public int slotDurationMinutes;
}
