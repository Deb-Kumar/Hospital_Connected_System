package com.brainware.hospital.repository;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.brainware.hospital.api.ApiClient;
import com.brainware.hospital.api.ApiService;
import com.brainware.hospital.model.dto.ForgotPasswordRequest;
import com.brainware.hospital.model.dto.GenericApiResponse;
import com.brainware.hospital.model.dto.LoginRequest;
import com.brainware.hospital.model.dto.LoginResponse;
import com.brainware.hospital.model.dto.OtpVerifyRequest;
import com.brainware.hospital.model.dto.OtpVerifyResponse;
import com.brainware.hospital.model.dto.RegisterRequest;
import com.brainware.hospital.model.dto.RegisterResponse;
import com.brainware.hospital.model.dto.ResetPasswordRequest;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.utils.ApiErrorHandler;
import com.brainware.hospital.utils.Resource;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AuthRepository {

    private final ApiService api;
    private final TokenManager tokenManager;

    public AuthRepository(Context context) {
        this.api = ApiClient.getInstance(context).getApiService();
        this.tokenManager = TokenManager.getInstance(context);
    }

    public LiveData<Resource<LoginResponse>> login(String identifier, String password, String otp) {
        MutableLiveData<Resource<LoginResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.login(new LoginRequest(identifier, password, "PATIENT", otp)).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse body = response.body();
                    if (body.isRequire2FA()) {
                        result.postValue(Resource.success(body)); // caller checks isRequire2FA()
                    } else if (body.token != null) {
                        tokenManager.saveSession(body.token, body.userId, body.fullName, body.email, body.phone, body.role);
                        result.postValue(Resource.success(body));
                    } else {
                        result.postValue(Resource.error("Unexpected response from server."));
                    }
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<RegisterResponse>> register(RegisterRequest req) {
        MutableLiveData<Resource<RegisterResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.register(req).enqueue(new Callback<RegisterResponse>() {
            @Override
            public void onResponse(Call<RegisterResponse> call, Response<RegisterResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<RegisterResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<OtpVerifyResponse>> verifyOtp(String email, String otp) {
        MutableLiveData<Resource<OtpVerifyResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.verifyOtp(new OtpVerifyRequest(email, otp)).enqueue(new Callback<OtpVerifyResponse>() {
            @Override
            public void onResponse(Call<OtpVerifyResponse> call, Response<OtpVerifyResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().success) {
                    OtpVerifyResponse body = response.body();
                    tokenManager.saveSession(body.token, body.user.id, body.user.fullName, body.user.email, null, body.user.role);
                    result.postValue(Resource.success(body));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<OtpVerifyResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<GenericApiResponse>> forgotPassword(String email) {
        MutableLiveData<Resource<GenericApiResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.forgotPassword(new ForgotPasswordRequest(email)).enqueue(new Callback<GenericApiResponse>() {
            @Override
            public void onResponse(Call<GenericApiResponse> call, Response<GenericApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<GenericApiResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<GenericApiResponse>> resetPassword(String email, String otp, String newPassword) {
        MutableLiveData<Resource<GenericApiResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.resetPassword(new ResetPasswordRequest(email, otp, newPassword)).enqueue(new Callback<GenericApiResponse>() {
            @Override
            public void onResponse(Call<GenericApiResponse> call, Response<GenericApiResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<GenericApiResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public void logout() {
        tokenManager.clearSession();
    }

    public LiveData<Resource<GenericApiResponse>> changePassword(String currentPassword, String newPassword) {
        MutableLiveData<Resource<GenericApiResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        com.brainware.hospital.model.dto.ChangePasswordRequest req =
                new com.brainware.hospital.model.dto.ChangePasswordRequest(
                        tokenManager.getUserId(), currentPassword, newPassword);

        api.changePassword(req).enqueue(new Callback<GenericApiResponse>() {
            @Override
            public void onResponse(Call<GenericApiResponse> call, Response<GenericApiResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().success) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<GenericApiResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }

    public LiveData<Resource<com.brainware.hospital.model.dto.Toggle2FAResponse>> toggle2FA(boolean enable) {
        MutableLiveData<Resource<com.brainware.hospital.model.dto.Toggle2FAResponse>> result = new MutableLiveData<>();
        result.setValue(Resource.loading());

        api.toggle2FA(new com.brainware.hospital.model.dto.Toggle2FARequest(enable))
                .enqueue(new Callback<com.brainware.hospital.model.dto.Toggle2FAResponse>() {
            @Override
            public void onResponse(Call<com.brainware.hospital.model.dto.Toggle2FAResponse> call,
                                    Response<com.brainware.hospital.model.dto.Toggle2FAResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(Resource.success(response.body()));
                } else {
                    result.postValue(Resource.error(ApiErrorHandler.fromResponse(response)));
                }
            }

            @Override
            public void onFailure(Call<com.brainware.hospital.model.dto.Toggle2FAResponse> call, Throwable t) {
                result.postValue(Resource.error(ApiErrorHandler.fromThrowable(t)));
            }
        });

        return result;
    }
}
