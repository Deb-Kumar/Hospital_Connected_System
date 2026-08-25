package com.brainware.hospital.model.dto;

public class ResetPasswordRequest {
    public String email;
    public String otp;
    public String newPassword;

    public ResetPasswordRequest(String email, String otp, String newPassword) {
        this.email = email;
        this.otp = otp;
        this.newPassword = newPassword;
    }
}
