package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.MedicalRecord;
import com.brainware.hospital.repository.PatientRepository;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.utils.Resource;

import java.util.List;

public class RecordsViewModel extends AndroidViewModel {

    private final PatientRepository repository;
    private final TokenManager tokenManager;

    public RecordsViewModel(@NonNull Application application) {
        super(application);
        repository = new PatientRepository(application);
        tokenManager = TokenManager.getInstance(application);
    }

    public LiveData<Resource<List<MedicalRecord>>> getRecords() {
        return repository.getRecords(tokenManager.getUserId());
    }

    public LiveData<Resource<MedicalRecord>> uploadRecord(byte[] fileBytes, String fileName, String mimeType,
                                                            String recordType, String title) {
        return repository.uploadRecord(tokenManager.getUserId(), fileBytes, fileName, mimeType, recordType, title);
    }
}
