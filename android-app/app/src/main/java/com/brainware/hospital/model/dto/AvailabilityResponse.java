package com.brainware.hospital.model.dto;

/** GET /api/appointments/doctor/:doctorId/availability — the backend reuses
 *  "success" to mean "slot is available", not "the request succeeded". */
public class AvailabilityResponse {
    public boolean success;
    public String message;

    public boolean isAvailable() {
        return success;
    }
}
