package com.brainware.hospital.model.dto;

public class OtpVerifyResponse {
    public boolean success;
    public String message;
    public String token;
    public User user;

    public static class User {
        public String id;
        public String fullName;
        public String email;
        public String role;
        public String approvalStatus;
    }
}
