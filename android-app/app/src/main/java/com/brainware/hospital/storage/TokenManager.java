package com.brainware.hospital.storage;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import java.io.IOException;
import java.security.GeneralSecurityException;

/**
 * Stores the JWT and basic session info using Android Keystore-backed
 * EncryptedSharedPreferences. Never stores the user's password — only the
 * token issued by the backend (see backend/utils/jwt.js) and the profile
 * fields the app needs to render the UI without re-fetching on every screen.
 */
public class TokenManager {

    private static final String PREFS_NAME = "hospital_secure_prefs";
    private static final String KEY_TOKEN = "jwt_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_FULL_NAME = "full_name";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_PHONE = "phone";
    private static final String KEY_ROLE = "role";

    private static TokenManager instance;
    private final SharedPreferences prefs;

    private TokenManager(Context context) {
        SharedPreferences encrypted;
        try {
            MasterKey masterKey = new MasterKey.Builder(context.getApplicationContext())
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build();

            encrypted = EncryptedSharedPreferences.create(
                    context.getApplicationContext(),
                    PREFS_NAME,
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (GeneralSecurityException | IOException e) {
            // Extremely unlikely on a real device, but fall back to a normal
            // (unencrypted) prefs file rather than crashing the app outright.
            encrypted = context.getApplicationContext()
                    .getSharedPreferences(PREFS_NAME + "_fallback", Context.MODE_PRIVATE);
        }
        this.prefs = encrypted;
    }

    public static synchronized TokenManager getInstance(Context context) {
        if (instance == null) {
            instance = new TokenManager(context);
        }
        return instance;
    }

    public void saveSession(String token, String userId, String fullName, String email, String phone, String role) {
        prefs.edit()
                .putString(KEY_TOKEN, token)
                .putString(KEY_USER_ID, userId)
                .putString(KEY_FULL_NAME, fullName)
                .putString(KEY_EMAIL, email)
                .putString(KEY_PHONE, phone)
                .putString(KEY_ROLE, role)
                .apply();
    }

    public String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }

    public String getUserId() {
        return prefs.getString(KEY_USER_ID, null);
    }

    public String getFullName() {
        return prefs.getString(KEY_FULL_NAME, null);
    }

    public String getEmail() {
        return prefs.getString(KEY_EMAIL, null);
    }

    public String getPhone() {
        return prefs.getString(KEY_PHONE, null);
    }

    public String getRole() {
        return prefs.getString(KEY_ROLE, null);
    }

    public boolean isLoggedIn() {
        return getToken() != null;
    }

    public void updateProfile(String fullName, String email, String phone) {
        SharedPreferences.Editor editor = prefs.edit();
        if (fullName != null) editor.putString(KEY_FULL_NAME, fullName);
        if (email != null) editor.putString(KEY_EMAIL, email);
        if (phone != null) editor.putString(KEY_PHONE, phone);
        editor.apply();
    }

    public void clearSession() {
        prefs.edit().clear().apply();
    }
}
