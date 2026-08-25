package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.dto.GenericApiResponse;
import com.brainware.hospital.model.dto.Toggle2FAResponse;
import com.brainware.hospital.repository.AuthRepository;
import com.brainware.hospital.repository.PatientRepository;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.utils.Resource;

public class AccountSettingsViewModel extends AndroidViewModel {

    private final AuthRepository authRepository;
    private final PatientRepository patientRepository;
    private final TokenManager tokenManager;

    public AccountSettingsViewModel(@NonNull Application application) {
        super(application);
        authRepository = new AuthRepository(application);
        patientRepository = new PatientRepository(application);
        tokenManager = TokenManager.getInstance(application);
    }

    public LiveData<Resource<GenericApiResponse>> changePassword(String currentPassword, String newPassword) {
        return authRepository.changePassword(currentPassword, newPassword);
    }

    public LiveData<Resource<Toggle2FAResponse>> toggle2FA(boolean enable) {
        return authRepository.toggle2FA(enable);
    }

    public LiveData<Resource<GenericApiResponse>> deleteAccount() {
        return patientRepository.deleteAccount(tokenManager.getUserId());
    }
}
