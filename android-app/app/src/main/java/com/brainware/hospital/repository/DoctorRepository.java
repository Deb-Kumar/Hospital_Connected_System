package com.brainware.hospital.repository;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.brainware.hospital.api.ApiClient;
import com.brainware.hospital.api.ApiService;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.utils.ApiErrorHandler;
import com.brainware.hospital.utils.Resource;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DoctorRepository {

    private final ApiService api;

    public DoctorRepository(Context context) {
        this.api = ApiClient.getInstance(context).getApiService();
    }

    public LiveData<Resource<List<Doctor>>> getAllDoctors() {
        return fetch(api.getAllDoctors());
    }

    public LiveData<Resource<List<Doctor>>> getDoctorsByDepartment(String departmentId) {
        return fetch(api.getDoctorsByDepartment(departmentId));
    }

    private LiveData<Resource<List<Doctor>>> fetch(Call<List<Doctor>> call) {
        MutableLiveData<Resource<List<Doctor>>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        call.enqueue(new Callback<List<Doctor>>() {
            @Override
            public void onResponse(Call<List<Doctor>> call, Response<List<Doctor>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<List<Doctor>> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }
}
