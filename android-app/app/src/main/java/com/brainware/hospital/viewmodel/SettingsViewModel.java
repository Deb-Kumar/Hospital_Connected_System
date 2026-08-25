package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.dto.PublicSettings;
import com.brainware.hospital.repository.SettingsRepository;
import com.brainware.hospital.utils.Resource;

public class SettingsViewModel extends AndroidViewModel {

    private final SettingsRepository repository;

    public SettingsViewModel(@NonNull Application application) {
        super(application);
        repository = new SettingsRepository(application);
    }

    public LiveData<Resource<PublicSettings>> getPublicSettings() {
        return repository.getPublicSettings();
    }
}
