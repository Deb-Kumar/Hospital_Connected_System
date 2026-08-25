package com.brainware.hospital.model.dto;

/** Covers both possible shapes of POST /api/auth/login's 200 response:
 *  a normal successful login, or a "please provide your 2FA OTP" prompt.
 *  See backend/controllers/authController.js login(). */
public class LoginResponse {
    public String token;
    public String userId;
    public String fullName;
    public String email;
    public String phone;
    public String role;
    public String designation;

    public boolean success = true; // absent on true success; backend omits it there
    public Boolean require2FA;
    public String message;
    public String code;
    public String devOtp;

    public boolean isRequire2FA() {
        return require2FA != null && require2FA;
    }
}
