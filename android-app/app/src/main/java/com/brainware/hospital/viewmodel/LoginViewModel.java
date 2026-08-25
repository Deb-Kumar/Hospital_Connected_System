package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.dto.LoginResponse;
import com.brainware.hospital.repository.AuthRepository;
import com.brainware.hospital.utils.Resource;

public class LoginViewModel extends AndroidViewModel {

    private final AuthRepository repository;

    public LoginViewModel(@NonNull Application application) {
        super(application);
        repository = new AuthRepository(application);
    }

    public LiveData<Resource<LoginResponse>> login(String identifier, String password, String otp) {
        return repository.login(identifier, password, otp);
    }
}
