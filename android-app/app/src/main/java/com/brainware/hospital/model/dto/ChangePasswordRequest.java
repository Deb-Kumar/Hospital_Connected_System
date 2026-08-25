package com.brainware.hospital.model.dto;

public class ChangePasswordRequest {
    public String userId;
    public String currentPassword;
    public String newPassword;

    public ChangePasswordRequest(String userId, String currentPassword, String newPassword) {
        this.userId = userId;
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }
}
