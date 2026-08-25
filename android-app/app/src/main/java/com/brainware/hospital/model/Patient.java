package com.brainware.hospital.model;

import com.google.gson.annotations.SerializedName;

public class Patient {
    @SerializedName("_id")
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String dateOfBirth;
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String address;
    private String emergencyContact;
    private String allergies;
    private String chronicConditions;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String qrCodeId;
    private boolean isGuestAccount;

    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getRole() { return role; }
    public String getDateOfBirth() { return dateOfBirth; }
    public Integer getAge() { return age; }
    public String getGender() { return gender; }
    public String getBloodGroup() { return bloodGroup; }
    public String getAddress() { return address; }
    public String getEmergencyContact() { return emergencyContact; }
    public String getAllergies() { return allergies; }
    public String getChronicConditions() { return chronicConditions; }
    public String getInsuranceProvider() { return insuranceProvider; }
    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public String getQrCodeId() { return qrCodeId; }
    public boolean isGuestAccount() { return isGuestAccount; }
}
