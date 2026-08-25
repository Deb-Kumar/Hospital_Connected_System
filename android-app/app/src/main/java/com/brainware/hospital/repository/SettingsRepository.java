package com.brainware.hospital.repository;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.brainware.hospital.api.ApiClient;
import com.brainware.hospital.api.ApiService;
import com.brainware.hospital.model.dto.PublicSettings;
import com.brainware.hospital.utils.ApiErrorHandler;
import com.brainware.hospital.utils.Resource;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SettingsRepository {

    private final ApiService api;

    public SettingsRepository(Context context) {
        this.api = ApiClient.getInstance(context).getApiService();
    }

    public LiveData<Resource<PublicSettings>> getPublicSettings() {
        MutableLiveData<Resource<PublicSettings>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.getPublicSettings().enqueue(new Callback<PublicSettings>() {
            @Override
            public void onResponse(Call<PublicSettings> call, Response<PublicSettings> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<PublicSettings> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }
}
