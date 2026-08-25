package com.brainware.hospital.model;

import com.google.gson.annotations.SerializedName;

public class Department {
    @SerializedName("_id")
    private String id;
    private String name;
    private String description;
    private double consultationFee;
    private boolean active;
    private int doctorCount;

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public double getConsultationFee() { return consultationFee; }
    public boolean isActive() { return active; }
    public int getDoctorCount() { return doctorCount; }
}
