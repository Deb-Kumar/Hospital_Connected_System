package com.brainware.hospital.model.dto;

import com.brainware.hospital.model.Patient;

public class ProfileUpdateResponse {
    public boolean success;
    public Patient patient;
    public UserInfo user;

    public static class UserInfo {
        public String id;
        public String fullName;
        public String email;
        public String phone;
        public String role;
    }
}
