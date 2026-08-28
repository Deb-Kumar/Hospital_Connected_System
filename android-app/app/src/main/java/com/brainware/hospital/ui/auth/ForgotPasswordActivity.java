package com.brainware.hospital.ui.auth;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.dto.GenericApiResponse;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.ForgotPasswordViewModel;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

public class ForgotPasswordActivity extends AppCompatActivity {

    private TextInputLayout tilEmail, tilOtp, tilNewPassword;
    private TextInputEditText etEmail, etOtp, etNewPassword;
    private View layoutStep2;
    private MaterialButton btnAction;
    private android.view.View progressBar;
    private android.widget.TextView tvError, tvSuccess, tvSubtitle;

    private ForgotPasswordViewModel viewModel;
    private boolean otpRequested = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        viewModel = new ViewModelProvider(this).get(ForgotPasswordViewModel.class);

        tilEmail = findViewById(R.id.tilEmail);
        tilOtp = findViewById(R.id.tilOtp);
        tilNewPassword = findViewById(R.id.tilNewPassword);
        etEmail = findViewById(R.id.etEmail);
        etOtp = findViewById(R.id.etOtp);
        etNewPassword = findViewById(R.id.etNewPassword);
        layoutStep2 = findViewById(R.id.layoutStep2);
        btnAction = findViewById(R.id.btnAction);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);
        tvSuccess = findViewById(R.id.tvSuccess);
        tvSubtitle = findViewById(R.id.tvSubtitle);

        btnAction.setOnClickListener(v -> {
            if (!otpRequested) requestOtp();
            else submitReset();
        });
    }

    private void requestOtp() {
        String email = text(etEmail);
        tvError.setVisibility(View.GONE);

        if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            tilEmail.setError("Enter a valid email address");
            return;
        }
        tilEmail.setError(null);

        viewModel.requestOtp(email).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    setLoading(true);
                    break;
                case SUCCESS:
                    setLoading(false);
                    otpRequested = true;
                    etEmail.setEnabled(false);
                    layoutStep2.setVisibility(View.VISIBLE);
                    btnAction.setText("Reset Password");
                    tvSubtitle.setText("Enter the code we sent, and choose a new password");
                    break;
                case ERROR:
                    setLoading(false);
                    showError(resource.message);
                    break;
            }
        });
    }

    private void submitReset() {
        String email = text(etEmail);
        String otp = text(etOtp);
        String newPassword = text(etNewPassword);

        tvError.setVisibility(View.GONE);

        if (TextUtils.isEmpty(otp) || otp.length() != 6) {
            tilOtp.setError("Enter the 6-digit code");
            return;
        }
        tilOtp.setError(null);

        if (TextUtils.isEmpty(newPassword) || newPassword.length() < 6) {
            tilNewPassword.setError("Password must be at least 6 characters");
            return;
        }
        tilNewPassword.setError(null);

        viewModel.resetPassword(email, otp, newPassword).observe(this, (Resource<GenericApiResponse> resource) -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    setLoading(true);
                    break;
                case SUCCESS:
                    setLoading(false);
                    tvSuccess.setText("Password reset. You can now log in.");
                    tvSuccess.setVisibility(View.VISIBLE);
                    btnAction.postDelayed(this::finish, 1200);
                    break;
                case ERROR:
                    setLoading(false);
                    showError(resource.message);
                    break;
            }
        });
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnAction.setEnabled(!loading);
    }

    private String text(TextInputEditText et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }
}
