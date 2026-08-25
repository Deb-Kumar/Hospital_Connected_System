package com.brainware.hospital.utils;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;

import retrofit2.Response;

/** Turns network/HTTP failures into short, human-readable messages for the UI. */
public class ApiErrorHandler {

    public static String fromThrowable(Throwable t) {
        if (t instanceof UnknownHostException) {
            return "No internet connection. Please check your network and try again.";
        }
        if (t instanceof SocketTimeoutException) {
            return "The server took too long to respond. Please try again.";
        }
        if (t instanceof IOException) {
            return "Network error. Please check your connection and try again.";
        }
        return "Something went wrong. Please try again.";
    }

    public static String fromResponse(Response<?> response) {
        int code = response.code();
        String backendMessage = extractMessage(response);

        if (backendMessage != null && !backendMessage.trim().isEmpty()) {
            return backendMessage;
        }

        switch (code) {
            case 400:
                return "Invalid details entered. Please check your inputs.";
            case 401:
                return "Incorrect password. Please check your password and try again.";
            case 403:
                return "Account access restricted. Please contact support.";
            case 404:
                return "No account found with this email or phone number. Please check your details or register.";
            case 409:
                return "That slot was just booked by someone else. Please pick another time.";
            case 422:
                return "Please check the information you entered and try again.";
            case 500:
            case 502:
            case 503:
                return "The server is having trouble right now. Please try again shortly.";
            default:
                return "Something went wrong (code " + code + "). Please try again.";
        }
    }

    private static String extractMessage(Response<?> response) {
        try {
            if (response.errorBody() == null) return null;
            String raw = response.errorBody().string();
            if (raw == null || raw.trim().isEmpty()) return null;

            JsonObject obj = new Gson().fromJson(raw, JsonObject.class);
            if (obj != null) {
                if (obj.has("message") && !obj.get("message").isJsonNull()) {
                    return obj.get("message").getAsString();
                }
                if (obj.has("error") && !obj.get("error").isJsonNull()) {
                    return obj.get("error").getAsString();
                }
            }
        } catch (Exception ignored) {
            // fall through
        }
        return null;
    }

    private ApiErrorHandler() {
    }
}
