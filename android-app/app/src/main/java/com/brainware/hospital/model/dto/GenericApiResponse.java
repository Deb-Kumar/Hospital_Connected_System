package com.brainware.hospital.model.dto;

/** Generic {success, message} shape used by several endpoints
 *  (forgot-password, reset-password, cancel confirmations, etc). */
public class GenericApiResponse {
    public boolean success;
    public String message;
    public String role;
    public String devOtp;
}
