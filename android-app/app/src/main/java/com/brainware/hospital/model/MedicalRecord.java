package com.brainware.hospital.model;

import com.google.gson.annotations.SerializedName;

public class MedicalRecord {
    @SerializedName("_id")
    private String id;
    private String recordType;
    private String title;
    private String fileUrl;
    private String aiSummary;
    private String createdAt;

    public String getId() { return id; }
    public String getRecordType() { return recordType; }
    public String getTitle() { return title; }
    public String getFileUrl() { return fileUrl; }
    public String getAiSummary() { return aiSummary; }
    public String getCreatedAt() { return createdAt; }
}
