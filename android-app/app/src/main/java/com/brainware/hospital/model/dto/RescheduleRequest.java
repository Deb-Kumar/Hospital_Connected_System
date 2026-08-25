package com.brainware.hospital.model.dto;

/** PUT /api/appointments/:id/reschedule sends date/time as query params,
 *  not a body — see backend/routes/appointmentRoutes.js. This class is a
 *  convenience holder used by the Retrofit @Query call, not sent as JSON. */
public class RescheduleRequest {
    public final String date;
    public final String time;

    public RescheduleRequest(String date, String time) {
        this.date = date;
        this.time = time;
    }
}
