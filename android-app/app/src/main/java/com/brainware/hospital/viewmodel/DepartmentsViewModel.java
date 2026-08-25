package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.Department;
import com.brainware.hospital.repository.DepartmentRepository;
import com.brainware.hospital.utils.Resource;

import java.util.List;

public class DepartmentsViewModel extends AndroidViewModel {

    private final DepartmentRepository repository;

    public DepartmentsViewModel(@NonNull Application application) {
        super(application);
        repository = new DepartmentRepository(application);
    }

    public LiveData<Resource<List<Department>>> getDepartments() {
        return repository.getDepartments();
    }
}
