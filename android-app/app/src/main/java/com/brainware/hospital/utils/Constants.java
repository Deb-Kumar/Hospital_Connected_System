package com.brainware.hospital.utils;

public class Constants {
    // Role strings must match exactly what the backend returns/expects
    // (see backend/models/*.js — role defaults and middleware/auth.js).
    public static final String ROLE_PATIENT = "PATIENT";
    public static final String ROLE_DOCTOR = "DOCTOR";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_STAFF = "STAFF";

    public static final String EXTRA_DEPARTMENT_ID = "extra_department_id";
    public static final String EXTRA_DEPARTMENT_NAME = "extra_department_name";
    public static final String EXTRA_DOCTOR_ID = "extra_doctor_id";
    public static final String EXTRA_DOCTOR_JSON = "extra_doctor_json";
    public static final String EXTRA_APPOINTMENT_JSON = "extra_appointment_json";

    private Constants() {
    }
}
