package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.dto.OtpVerifyResponse;
import com.brainware.hospital.repository.AuthRepository;
import com.brainware.hospital.utils.Resource;

public class OtpViewModel extends AndroidViewModel {

    private final AuthRepository repository;

    public OtpViewModel(@NonNull Application application) {
        super(application);
        repository = new AuthRepository(application);
    }

    public LiveData<Resource<OtpVerifyResponse>> verifyOtp(String email, String otp) {
        return repository.verifyOtp(email, otp);
    }
}
