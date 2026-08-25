package com.brainware.hospital.model.dto;

/** POST /api/patient/:id/family — creates a linked Patient document with
 *  primaryAccount set server-side. Needs its own login credentials because
 *  Patient.email/phone/password are required fields (see models/Patient.js)
 *  even for family-member sub-profiles. */
public class FamilyMemberRequest {
    public String fullName;
    public String email;
    public String phone;
    public String password;
    public String relation;
    public String dateOfBirth;
    public String gender;
    public String bloodGroup;
}
