package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.dto.GenericApiResponse;
import com.brainware.hospital.repository.AuthRepository;
import com.brainware.hospital.utils.Resource;

public class ForgotPasswordViewModel extends AndroidViewModel {

    private final AuthRepository repository;

    public ForgotPasswordViewModel(@NonNull Application application) {
        super(application);
        repository = new AuthRepository(application);
    }

    public LiveData<Resource<GenericApiResponse>> requestOtp(String email) {
        return repository.forgotPassword(email);
    }

    public LiveData<Resource<GenericApiResponse>> resetPassword(String email, String otp, String newPassword) {
        return repository.resetPassword(email, otp, newPassword);
    }
}
