package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.Patient;
import com.brainware.hospital.model.dto.ProfileUpdateResponse;
import com.brainware.hospital.repository.PatientRepository;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.utils.Resource;

import java.util.Map;

public class ProfileViewModel extends AndroidViewModel {

    private final PatientRepository repository;
    private final TokenManager tokenManager;

    public ProfileViewModel(@NonNull Application application) {
        super(application);
        repository = new PatientRepository(application);
        tokenManager = TokenManager.getInstance(application);
    }

    public LiveData<Resource<Patient>> getProfile() {
        return repository.getProfile(tokenManager.getUserId());
    }

    public LiveData<Resource<ProfileUpdateResponse>> updateProfile(Map<String, Object> fields) {
        return repository.updateProfile(tokenManager.getUserId(), fields);
    }
}
