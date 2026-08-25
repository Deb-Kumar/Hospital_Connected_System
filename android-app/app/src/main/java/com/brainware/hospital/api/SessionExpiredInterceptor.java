package com.brainware.hospital.api;

import android.content.Context;
import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.brainware.hospital.storage.TokenManager;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

/**
 * If the backend returns 401 on an authenticated request (expired/invalid
 * JWT — see middleware/auth.js), clear the local session and broadcast so any
 * visible screen can redirect to Login. We deliberately skip this for the
 * login/register/otp endpoints themselves, since a wrong password there is a
 * normal 401, not an expired session.
 */
public class SessionExpiredInterceptor implements Interceptor {

    public static final String ACTION_SESSION_EXPIRED = "com.brainware.hospital.SESSION_EXPIRED";

    private final Context appContext;
    private final TokenManager tokenManager;

    public SessionExpiredInterceptor(Context context, TokenManager tokenManager) {
        this.appContext = context.getApplicationContext();
        this.tokenManager = tokenManager;
    }

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request request = chain.request();
        Response response = chain.proceed(request);

        boolean isAuthEndpoint = request.url().encodedPath().contains("/auth/");
        if (response.code() == 401 && !isAuthEndpoint && tokenManager.isLoggedIn()) {
            tokenManager.clearSession();
            LocalBroadcastManager.getInstance(appContext)
                    .sendBroadcast(new Intent(ACTION_SESSION_EXPIRED));
        }

        return response;
    }
}
