package com.brainware.hospital.repository;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.brainware.hospital.api.ApiClient;
import com.brainware.hospital.api.ApiService;
import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.model.dto.AvailabilityResponse;
import com.brainware.hospital.model.dto.BookAppointmentRequest;
import com.brainware.hospital.utils.ApiErrorHandler;
import com.brainware.hospital.utils.Resource;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AppointmentRepository {

    private final ApiService api;

    public AppointmentRepository(Context context) {
        this.api = ApiClient.getInstance(context).getApiService();
    }

    public LiveData<Resource<AvailabilityResponse>> checkAvailability(String doctorId, String date, String time) {
        MutableLiveData<Resource<AvailabilityResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.checkAvailability(doctorId, date, time).enqueue(new Callback<AvailabilityResponse>() {
            @Override
            public void onResponse(Call<AvailabilityResponse> call, Response<AvailabilityResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<AvailabilityResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    // Rule: never trust the client for final availability — the backend
    // re-validates the slot at booking time regardless of the availability
    // check above (see appointmentController.createAppointmentForPatient,
    // which throws a 409 on a clash). The UI must handle that 409 by
    // refreshing the doctor's slots, not by assuming the earlier check holds.
    public LiveData<Resource<Appointment>> bookAppointment(BookAppointmentRequest req) {
        MutableLiveData<Resource<Appointment>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.bookAppointment(req).enqueue(new Callback<Appointment>() {
            @Override
            public void onResponse(Call<Appointment> call, Response<Appointment> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<Appointment> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<Appointment>> cancelAppointment(String id, String reason) {
        MutableLiveData<Resource<Appointment>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.cancelAppointment(id, reason).enqueue(new Callback<Appointment>() {
            @Override
            public void onResponse(Call<Appointment> call, Response<Appointment> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<Appointment> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<List<Appointment>>> getHistory(String patientId) {
        MutableLiveData<Resource<List<Appointment>>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.getAppointmentHistory(patientId).enqueue(new Callback<List<Appointment>>() {
            @Override
            public void onResponse(Call<List<Appointment>> call, Response<List<Appointment>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<List<Appointment>> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<Appointment>> reschedule(String appointmentId, String date, String time) {
        MutableLiveData<Resource<Appointment>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.rescheduleAppointment(appointmentId, date, time).enqueue(new Callback<Appointment>() {
            @Override
            public void onResponse(Call<Appointment> call, Response<Appointment> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<Appointment> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<com.brainware.hospital.model.dto.GuestBookingResponse>> bookGuest(
            com.brainware.hospital.model.dto.GuestBookingRequest req) {
        MutableLiveData<Resource<com.brainware.hospital.model.dto.GuestBookingResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.bookGuestAppointment(req).enqueue(new Callback<com.brainware.hospital.model.dto.GuestBookingResponse>() {
            @Override
            public void onResponse(Call<com.brainware.hospital.model.dto.GuestBookingResponse> call,
                                    Response<com.brainware.hospital.model.dto.GuestBookingResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<com.brainware.hospital.model.dto.GuestBookingResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }
}
