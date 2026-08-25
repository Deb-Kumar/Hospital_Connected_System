package com.brainware.hospital.repository;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.brainware.hospital.api.ApiClient;
import com.brainware.hospital.api.ApiService;
import com.brainware.hospital.model.Department;
import com.brainware.hospital.utils.ApiErrorHandler;
import com.brainware.hospital.utils.Resource;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DepartmentRepository {

    private final ApiService api;

    public DepartmentRepository(Context context) {
        this.api = ApiClient.getInstance(context).getApiService();
    }

    public LiveData<Resource<List<Department>>> getDepartments() {
        MutableLiveData<Resource<List<Department>>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.getDepartments().enqueue(new Callback<List<Department>>() {
            @Override
            public void onResponse(Call<List<Department>> call, Response<List<Department>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<List<Department>> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }
}
