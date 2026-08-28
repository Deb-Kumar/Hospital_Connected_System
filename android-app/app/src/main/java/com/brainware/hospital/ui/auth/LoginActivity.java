package com.brainware.hospital.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.BuildConfig;
import com.brainware.hospital.R;
import com.brainware.hospital.model.dto.LoginResponse;
import com.brainware.hospital.ui.main.MainActivity;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.LoginViewModel;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

public class LoginActivity extends AppCompatActivity {

    private TextInputLayout tilEmail, tilPassword, tilOtp;
    private TextInputEditText etEmail, etPassword, etOtp;
    private MaterialButton btnLogin;
    private android.view.View progressBar;
    private android.widget.TextView tvError;

    private LoginViewModel viewModel;
    private boolean awaitingOtp = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        viewModel = new ViewModelProvider(this).get(LoginViewModel.class);

        tilEmail = findViewById(R.id.tilEmail);
        tilPassword = findViewById(R.id.tilPassword);
        tilOtp = findViewById(R.id.tilOtp);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etOtp = findViewById(R.id.etOtp);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);

        btnLogin.setOnClickListener(v -> attemptLogin());
        findViewById(R.id.tvGoRegister).setOnClickListener(v ->
                startActivity(new Intent(this, RegisterActivity.class)));
        findViewById(R.id.tvForgotPassword).setOnClickListener(v ->
                startActivity(new Intent(this, ForgotPasswordActivity.class)));
        findViewById(R.id.tvGuestBooking).setOnClickListener(v ->
                startActivity(new Intent(this, com.brainware.hospital.ui.doctors.DoctorsByDepartmentActivity.class)));

        android.widget.TextView tvAppVersion = findViewById(R.id.tvAppVersion);
        if (tvAppVersion != null) {
            tvAppVersion.setText("v" + BuildConfig.VERSION_NAME);
        }
    }

    private void attemptLogin() {
        String identifier = safeText(etEmail);
        String password = safeText(etPassword);
        String otp = awaitingOtp ? safeText(etOtp) : null;

        tvError.setVisibility(View.GONE);

        if (TextUtils.isEmpty(identifier)) {
            tilEmail.setError("Enter your email or phone number");
            return;
        }
        tilEmail.setError(null);

        if (TextUtils.isEmpty(password)) {
            tilPassword.setError("Enter your password");
            return;
        }
        tilPassword.setError(null);

        if (awaitingOtp && TextUtils.isEmpty(otp)) {
            tilOtp.setError("Enter the 6-digit code");
            return;
        }

        viewModel.login(identifier, password, otp).observe(this, this::handleResult);
    }

    private void handleResult(Resource<LoginResponse> resource) {
        if (resource == null) return;

        switch (resource.status) {
            case LOADING:
                setLoading(true);
                break;
            case SUCCESS:
                setLoading(false);
                LoginResponse body = resource.data;
                if (body.isRequire2FA()) {
                    awaitingOtp = true;
                    tilOtp.setVisibility(View.VISIBLE);
                    Toast.makeText(this, "Enter the security code sent to your email", Toast.LENGTH_LONG).show();
                } else {
                    startActivity(new Intent(this, MainActivity.class));
                    finish();
                }
                break;
            case ERROR:
                setLoading(false);
                tvError.setText(resource.message);
                tvError.setVisibility(View.VISIBLE);
                break;
        }
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnLogin.setEnabled(!loading);
    }

    private String safeText(TextInputEditText et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }
}
