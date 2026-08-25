package com.brainware.hospital.api;

import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.model.Department;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.model.FamilyMember;
import com.brainware.hospital.model.MedicalRecord;
import com.brainware.hospital.model.Patient;
import com.brainware.hospital.model.dto.AvailabilityResponse;
import com.brainware.hospital.model.dto.BookAppointmentRequest;
import com.brainware.hospital.model.dto.ChangePasswordRequest;
import com.brainware.hospital.model.dto.FamilyMemberRequest;
import com.brainware.hospital.model.dto.ForgotPasswordRequest;
import com.brainware.hospital.model.dto.GenericApiResponse;
import com.brainware.hospital.model.dto.GuestBookingRequest;
import com.brainware.hospital.model.dto.GuestBookingResponse;
import com.brainware.hospital.model.dto.LoginRequest;
import com.brainware.hospital.model.dto.LoginResponse;
import com.brainware.hospital.model.dto.OtpVerifyRequest;
import com.brainware.hospital.model.dto.OtpVerifyResponse;
import com.brainware.hospital.model.dto.ProfileUpdateResponse;
import com.brainware.hospital.model.dto.PublicSettings;
import com.brainware.hospital.model.dto.RegisterRequest;
import com.brainware.hospital.model.dto.RegisterResponse;
import com.brainware.hospital.model.dto.ResetPasswordRequest;
import com.brainware.hospital.model.dto.Toggle2FARequest;
import com.brainware.hospital.model.dto.Toggle2FAResponse;

import java.util.List;
import java.util.Map;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.PUT;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;

/**
 * Every endpoint here was read directly from the backend's route files
 * (backend/routes/*.js), not assumed. Response DTOs match the controllers'
 * actual res.json(...) shapes, including known inconsistencies — see the
 * comments in each DTO.
 */
public interface ApiService {

    // ---- Auth (backend/routes/authRoutes.js) ----
    @POST("auth/register")
    Call<RegisterResponse> register(@Body RegisterRequest body);

    @POST("auth/verify-otp")
    Call<OtpVerifyResponse> verifyOtp(@Body OtpVerifyRequest body);

    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest body);

    @POST("auth/forgot-password")
    Call<GenericApiResponse> forgotPassword(@Body ForgotPasswordRequest body);

    @POST("auth/reset-password")
    Call<GenericApiResponse> resetPassword(@Body ResetPasswordRequest body);

    @POST("auth/change-password")
    Call<GenericApiResponse> changePassword(@Body ChangePasswordRequest body);

    @PUT("auth/toggle-2fa")
    Call<Toggle2FAResponse> toggle2FA(@Body Toggle2FARequest body);

    // ---- Public settings (backend/routes/settingsRoutes.js) — PUBLIC ----
    @GET("settings/public")
    Call<PublicSettings> getPublicSettings();

    // ---- Departments (backend/routes/departmentRoutes.js) — PUBLIC ----
    @GET("departments")
    Call<List<Department>> getDepartments();

    // ---- Doctors (backend/routes/doctorRoutes.js) — PUBLIC ----
    @GET("doctor/all")
    Call<List<Doctor>> getAllDoctors();

    @GET("doctor/department/{departmentId}")
    Call<List<Doctor>> getDoctorsByDepartment(@Path("departmentId") String departmentId);

    // ---- Appointments (backend/routes/appointmentRoutes.js) ----
    @POST("appointments/book")
    Call<Appointment> bookAppointment(@Body BookAppointmentRequest body);

    @POST("appointments/book-guest")
    Call<GuestBookingResponse> bookGuestAppointment(@Body GuestBookingRequest body);

    @PUT("appointments/{id}/reschedule")
    Call<Appointment> rescheduleAppointment(
            @Path("id") String id, @Query("date") String date, @Query("time") String time);

    @PUT("appointments/{id}/cancel")
    Call<Appointment> cancelAppointment(@Path("id") String id, @Query("reason") String reason);

    @GET("appointments/patient/{patientId}")
    Call<List<Appointment>> getAppointmentHistory(@Path("patientId") String patientId);

    @GET("appointments/doctor/{doctorId}/availability")
    Call<AvailabilityResponse> checkAvailability(
            @Path("doctorId") String doctorId, @Query("date") String date, @Query("time") String time);

    // ---- Patient (backend/routes/patientRoutes.js) ----
    @GET("patient/{id}/profile")
    Call<Patient> getProfile(@Path("id") String id);

    @PUT("patient/{id}/profile")
    Call<ProfileUpdateResponse> updateProfile(@Path("id") String id, @Body Map<String, Object> fields);

    @GET("patient/{id}/records")
    Call<List<MedicalRecord>> getRecords(@Path("id") String id);

    @POST("patient/{id}/family")
    Call<FamilyMember> addFamilyMember(@Path("id") String id, @Body FamilyMemberRequest body);

    @GET("patient/{id}/family")
    Call<List<FamilyMember>> getFamilyMembers(@Path("id") String id);

    @DELETE("patient/{id}")
    Call<GenericApiResponse> deleteAccount(@Path("id") String id);

    @Multipart
    @POST("patient/{id}/records/upload")
    Call<MedicalRecord> uploadRecordFile(
            @Path("id") String id,
            @Part MultipartBody.Part file,
            @Part("recordType") RequestBody recordType,
            @Part("title") RequestBody title);
}
