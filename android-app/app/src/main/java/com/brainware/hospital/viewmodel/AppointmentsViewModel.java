package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.repository.AppointmentRepository;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.utils.Resource;

import java.util.List;

public class AppointmentsViewModel extends AndroidViewModel {

    private final AppointmentRepository repository;
    private final TokenManager tokenManager;

    public AppointmentsViewModel(@NonNull Application application) {
        super(application);
        repository = new AppointmentRepository(application);
        tokenManager = TokenManager.getInstance(application);
    }

    public LiveData<Resource<List<Appointment>>> getHistory() {
        return repository.getHistory(tokenManager.getUserId());
    }

    public LiveData<Resource<Appointment>> cancel(String id, String reason) {
        return repository.cancelAppointment(id, reason);
    }
}
