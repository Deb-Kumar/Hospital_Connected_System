package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.dto.RegisterRequest;
import com.brainware.hospital.model.dto.RegisterResponse;
import com.brainware.hospital.repository.AuthRepository;
import com.brainware.hospital.utils.Resource;

public class RegisterViewModel extends AndroidViewModel {

    private final AuthRepository repository;

    public RegisterViewModel(@NonNull Application application) {
        super(application);
        repository = new AuthRepository(application);
    }

    public LiveData<Resource<RegisterResponse>> register(RegisterRequest request) {
        return repository.register(request);
    }
}
