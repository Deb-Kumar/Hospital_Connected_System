package com.brainware.hospital.model.dto;

public class OtpVerifyRequest {
    public String email;
    public String otp;

    public OtpVerifyRequest(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }
}
