package com.brainware.hospital.model.dto;

public class RegisterResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public String userId;
        public String fullName;
        public String role;
        public boolean requiresOtp;
    }
}
