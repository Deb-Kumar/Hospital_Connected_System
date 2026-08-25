package com.brainware.hospital.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.brainware.hospital.model.FamilyMember;
import com.brainware.hospital.model.dto.FamilyMemberRequest;
import com.brainware.hospital.repository.PatientRepository;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.utils.Resource;

import java.util.List;

public class FamilyMembersViewModel extends AndroidViewModel {

    private final PatientRepository repository;
    private final TokenManager tokenManager;

    public FamilyMembersViewModel(@NonNull Application application) {
        super(application);
        repository = new PatientRepository(application);
        tokenManager = TokenManager.getInstance(application);
    }

    public LiveData<Resource<List<FamilyMember>>> getFamilyMembers() {
        return repository.getFamilyMembers(tokenManager.getUserId());
    }

    public LiveData<Resource<FamilyMember>> addFamilyMember(FamilyMemberRequest request) {
        return repository.addFamilyMember(tokenManager.getUserId(), request);
    }
}
