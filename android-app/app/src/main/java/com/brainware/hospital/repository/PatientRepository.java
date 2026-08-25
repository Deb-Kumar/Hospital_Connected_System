package com.brainware.hospital.repository;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.brainware.hospital.api.ApiClient;
import com.brainware.hospital.api.ApiService;
import com.brainware.hospital.model.MedicalRecord;
import com.brainware.hospital.model.Patient;
import com.brainware.hospital.model.dto.ProfileUpdateResponse;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.utils.ApiErrorHandler;
import com.brainware.hospital.utils.Resource;

import java.util.List;
import java.util.Map;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PatientRepository {

    private final ApiService api;
    private final TokenManager tokenManager;

    public PatientRepository(Context context) {
        this.api = ApiClient.getInstance(context).getApiService();
        this.tokenManager = TokenManager.getInstance(context);
    }

    public LiveData<Resource<Patient>> getProfile(String userId) {
        MutableLiveData<Resource<Patient>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.getProfile(userId).enqueue(new Callback<Patient>() {
            @Override
            public void onResponse(Call<Patient> call, Response<Patient> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<Patient> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<ProfileUpdateResponse>> updateProfile(String userId, Map<String, Object> fields) {
        MutableLiveData<Resource<ProfileUpdateResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.updateProfile(userId, fields).enqueue(new Callback<ProfileUpdateResponse>() {
            @Override
            public void onResponse(Call<ProfileUpdateResponse> call, Response<ProfileUpdateResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ProfileUpdateResponse body = response.body();
                    if (body.user != null) {
                        tokenManager.updateProfile(body.user.fullName, body.user.email, body.user.phone);
                    }
                    result.postValue(Resource.success(body));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<ProfileUpdateResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<List<MedicalRecord>>> getRecords(String userId) {
        MutableLiveData<Resource<List<MedicalRecord>>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.getRecords(userId).enqueue(new Callback<List<MedicalRecord>>() {
            @Override
            public void onResponse(Call<List<MedicalRecord>> call, Response<List<MedicalRecord>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<List<MedicalRecord>> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<MedicalRecord>> uploadRecord(String userId, byte[] fileBytes, String fileName,
                                                            String mimeType, String recordType, String title) {
        MutableLiveData<Resource<MedicalRecord>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        RequestBody fileBody = RequestBody.create(fileBytes, MediaType.parse(mimeType != null ? mimeType : "application/octet-stream"));
        MultipartBody.Part filePart = MultipartBody.Part.createFormData("file", fileName, fileBody);
        RequestBody typeBody = RequestBody.create(recordType, MediaType.parse("text/plain"));
        RequestBody titleBody = RequestBody.create(title, MediaType.parse("text/plain"));

        api.uploadRecordFile(userId, filePart, typeBody, titleBody).enqueue(new Callback<MedicalRecord>() {
            @Override
            public void onResponse(Call<MedicalRecord> call, Response<MedicalRecord> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<MedicalRecord> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<List<com.brainware.hospital.model.FamilyMember>>> getFamilyMembers(String userId) {
        MutableLiveData<Resource<List<com.brainware.hospital.model.FamilyMember>>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.getFamilyMembers(userId).enqueue(new Callback<List<com.brainware.hospital.model.FamilyMember>>() {
            @Override
            public void onResponse(Call<List<com.brainware.hospital.model.FamilyMember>> call,
                                    Response<List<com.brainware.hospital.model.FamilyMember>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<List<com.brainware.hospital.model.FamilyMember>> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<com.brainware.hospital.model.FamilyMember>> addFamilyMember(
            String userId, com.brainware.hospital.model.dto.FamilyMemberRequest req) {
        MutableLiveData<Resource<com.brainware.hospital.model.FamilyMember>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.addFamilyMember(userId, req).enqueue(new Callback<com.brainware.hospital.model.FamilyMember>() {
            @Override
            public void onResponse(Call<com.brainware.hospital.model.FamilyMember> call,
                                    Response<com.brainware.hospital.model.FamilyMember> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<com.brainware.hospital.model.FamilyMember> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<com.brainware.hospital.model.dto.GenericApiResponse>> deleteAccount(String userId) {
        MutableLiveData<Resource<com.brainware.hospital.model.dto.GenericApiResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.deleteAccount(userId).enqueue(new Callback<com.brainware.hospital.model.dto.GenericApiResponse>() {
            @Override
            public void onResponse(Call<com.brainware.hospital.model.dto.GenericApiResponse> call,
                                    Response<com.brainware.hospital.model.dto.GenericApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<com.brainware.hospital.model.dto.GenericApiResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }
}
