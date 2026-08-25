package com.brainware.hospital.model;

import com.google.gson.annotations.SerializedName;

public class FamilyMember {
    @SerializedName("_id")
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String relation;
    private String gender;
    private String bloodGroup;
    private Integer age;

    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getRelation() { return relation; }
    public String getGender() { return gender; }
    public String getBloodGroup() { return bloodGroup; }
    public Integer getAge() { return age; }
}
