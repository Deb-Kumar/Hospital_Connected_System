package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.repository.DoctorRepository;
import com.brainware.hospital.utils.Resource;

import java.util.List;

public class DoctorsViewModel extends AndroidViewModel {

    private final DoctorRepository repository;

    public DoctorsViewModel(@NonNull Application application) {
        super(application);
        repository = new DoctorRepository(application);
    }

    public LiveData<Resource<List<Doctor>>> getAllDoctors() {
        return repository.getAllDoctors();
    }

    public LiveData<Resource<List<Doctor>>> getDoctors() {
        return repository.getAllDoctors();
    }

    public LiveData<Resource<List<Doctor>>> getDoctorsByDepartment(String departmentId) {
        return repository.getDoctorsByDepartment(departmentId);
    }
}
