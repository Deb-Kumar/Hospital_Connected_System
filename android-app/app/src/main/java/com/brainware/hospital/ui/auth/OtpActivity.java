package com.brainware.hospital.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.dto.OtpVerifyResponse;
import com.brainware.hospital.ui.main.MainActivity;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.OtpViewModel;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

public class OtpActivity extends AppCompatActivity {

    public static final String EXTRA_EMAIL = "extra_email";

    private TextInputLayout tilOtp;
    private TextInputEditText etOtp;
    private MaterialButton btnVerify;
    private android.view.View progressBar;
    private android.widget.TextView tvError, tvSubtitle;

    private OtpViewModel viewModel;
    private String email;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_otp);

        email = getIntent().getStringExtra(EXTRA_EMAIL);
        viewModel = new ViewModelProvider(this).get(OtpViewModel.class);

        tilOtp = findViewById(R.id.tilOtp);
        etOtp = findViewById(R.id.etOtp);
        btnVerify = findViewById(R.id.btnVerify);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);
        tvSubtitle = findViewById(R.id.tvSubtitle);

        if (email != null) {
            tvSubtitle.setText("Enter the 6-digit code sent to " + email);
        }

        btnVerify.setOnClickListener(v -> attemptVerify());
    }

    private void attemptVerify() {
        String otp = etOtp.getText() == null ? "" : etOtp.getText().toString().trim();
        tvError.setVisibility(View.GONE);

        if (TextUtils.isEmpty(otp) || otp.length() != 6) {
            tilOtp.setError("Enter the 6-digit code");
            return;
        }
        tilOtp.setError(null);

        viewModel.verifyOtp(email, otp).observe(this, this::handleResult);
    }

    private void handleResult(Resource<OtpVerifyResponse> resource) {
        if (resource == null) return;

        switch (resource.status) {
            case LOADING:
                setLoading(true);
                break;
            case SUCCESS:
                setLoading(false);
                startActivity(new Intent(this, MainActivity.class));
                finishAffinity();
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
        btnVerify.setEnabled(!loading);
    }
}
