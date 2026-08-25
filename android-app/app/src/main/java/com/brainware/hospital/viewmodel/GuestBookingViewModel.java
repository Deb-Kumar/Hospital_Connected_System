package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.dto.AvailabilityResponse;
import com.brainware.hospital.model.dto.GuestBookingRequest;
import com.brainware.hospital.model.dto.GuestBookingResponse;
import com.brainware.hospital.repository.AppointmentRepository;
import com.brainware.hospital.utils.Resource;

public class GuestBookingViewModel extends AndroidViewModel {

    private final AppointmentRepository repository;

    public GuestBookingViewModel(@NonNull Application application) {
        super(application);
        repository = new AppointmentRepository(application);
    }

    public LiveData<Resource<AvailabilityResponse>> checkAvailability(String doctorId, String date, String time) {
        return repository.checkAvailability(doctorId, date, time);
    }

    public LiveData<Resource<GuestBookingResponse>> book(GuestBookingRequest request) {
        return repository.bookGuest(request);
    }
}
