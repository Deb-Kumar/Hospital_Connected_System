package com.brainware.hospital.model.dto;

/** Body for POST /api/auth/register (patient sign-up only, from Android). */
public class RegisterRequest {
    public String fullName;
    public String email;
    public String phone;
    public String password;
    public String role = "PATIENT";
    public String dateOfBirth;
    public String gender;
    public String bloodGroup;

    public RegisterRequest(String fullName, String email, String phone, String password,
                            String dateOfBirth, String gender, String bloodGroup) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.bloodGroup = bloodGroup;
    }
}
