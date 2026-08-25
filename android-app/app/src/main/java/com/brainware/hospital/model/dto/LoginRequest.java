package com.brainware.hospital.model.dto;

/** Body for POST /api/auth/login. "email" also accepts a phone number — the
 *  backend matches against both fields (see authController.login). */
public class LoginRequest {
    public String email;
    public String password;
    public String role;
    public String otp; // only sent on the 2FA follow-up call

    public LoginRequest(String email, String password, String role, String otp) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.otp = otp;
    }
}
