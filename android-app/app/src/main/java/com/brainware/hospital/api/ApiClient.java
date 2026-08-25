package com.brainware.hospital.api;

import android.content.Context;

import com.brainware.hospital.BuildConfig;
import com.brainware.hospital.storage.TokenManager;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * Single Retrofit/OkHttp instance for the whole app. BASE_URL comes from
 * BuildConfig, which is set per build type in app/build.gradle — debug talks
 * to 10.0.2.2 (the local Node server via the emulator), release talks to the
 * deployed Render URL. Never hard-code the URL anywhere else.
 */
public class ApiClient {

    private static ApiClient instance;
    private final ApiService apiService;

    private ApiClient(Context context) {
        TokenManager tokenManager = TokenManager.getInstance(context);

        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(BuildConfig.DEBUG
                ? HttpLoggingInterceptor.Level.BODY
                : HttpLoggingInterceptor.Level.NONE);

        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(new AuthInterceptor(tokenManager))
                .addInterceptor(new SessionExpiredInterceptor(context, tokenManager))
                .addInterceptor(logging)
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS) // longer for record uploads
                .build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BuildConfig.BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiService = retrofit.create(ApiService.class);
    }

    public static synchronized ApiClient getInstance(Context context) {
        if (instance == null) {
            instance = new ApiClient(context.getApplicationContext());
        }
        return instance;
    }

    public ApiService getApiService() {
        return apiService;
    }
}
