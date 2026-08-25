package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.model.dto.AvailabilityResponse;
import com.brainware.hospital.model.dto.BookAppointmentRequest;
import com.brainware.hospital.repository.AppointmentRepository;
import com.brainware.hospital.utils.Resource;

public class BookingViewModel extends AndroidViewModel {

    private final AppointmentRepository repository;

    public BookingViewModel(@NonNull Application application) {
        super(application);
        repository = new AppointmentRepository(application);
    }

    public LiveData<Resource<AvailabilityResponse>> checkAvailability(String doctorId, String date, String time) {
        return repository.checkAvailability(doctorId, date, time);
    }

    public LiveData<Resource<Appointment>> book(BookAppointmentRequest request) {
        return repository.bookAppointment(request);
    }

    public LiveData<Resource<Appointment>> reschedule(String appointmentId, String date, String time) {
        return repository.reschedule(appointmentId, date, time);
    }
}
