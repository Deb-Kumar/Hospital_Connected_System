package com.brainware.hospital.ui.auth;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.BuildConfig;
import com.brainware.hospital.R;
import com.brainware.hospital.model.dto.RegisterRequest;
import com.brainware.hospital.model.dto.RegisterResponse;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.RegisterViewModel;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.util.Calendar;
import java.util.Locale;

public class RegisterActivity extends AppCompatActivity {

    private TextInputLayout tilFullName, tilEmail, tilPhone, tilPassword, tilConfirmPassword;
    private TextInputEditText etFullName, etEmail, etPhone, etDob, etPassword, etConfirmPassword;
    private AutoCompleteTextView etGender, etBloodGroup;
    private MaterialButton btnRegister;
    private ProgressBar progressBar;
    private TextView tvError;

    private RegisterViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        viewModel = new ViewModelProvider(this).get(RegisterViewModel.class);

        tilFullName = findViewById(R.id.tilFullName);
        tilEmail = findViewById(R.id.tilEmail);
        tilPhone = findViewById(R.id.tilPhone);
        tilPassword = findViewById(R.id.tilPassword);
        tilConfirmPassword = findViewById(R.id.tilConfirmPassword);

        etFullName = findViewById(R.id.etFullName);
        etEmail = findViewById(R.id.etEmail);
        etPhone = findViewById(R.id.etPhone);
        etDob = findViewById(R.id.etDob);
        etGender = findViewById(R.id.etGender);
        etBloodGroup = findViewById(R.id.etBloodGroup);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);

        btnRegister = findViewById(R.id.btnRegister);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);

        etGender.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_list_item_1,
                getResources().getStringArray(R.array.genders)));
        etBloodGroup.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_list_item_1,
                getResources().getStringArray(R.array.blood_groups)));

        etDob.setOnClickListener(v -> showDatePicker());

        btnRegister.setOnClickListener(v -> attemptRegister());
        findViewById(R.id.tvGoLogin).setOnClickListener(v -> finish());

        TextView tvAppVersion = findViewById(R.id.tvAppVersion);
        if (tvAppVersion != null) {
            tvAppVersion.setText("v" + BuildConfig.VERSION_NAME);
        }
    }

    private void showDatePicker() {
        Calendar cal = Calendar.getInstance();
        DatePickerDialog dialog = new DatePickerDialog(this, (view, year, month, day) -> {
            String date = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, day);
            etDob.setText(date);
        }, cal.get(Calendar.YEAR) - 25, cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH));
        dialog.getDatePicker().setMaxDate(System.currentTimeMillis());
        dialog.show();
    }

    private void attemptRegister() {
        String fullName = text(etFullName);
        String email = text(etEmail);
        String phone = text(etPhone);
        String dob = text(etDob);
        String gender = text(etGender);
        String bloodGroup = text(etBloodGroup);
        String password = text(etPassword);
        String confirmPassword = text(etConfirmPassword);

        tvError.setVisibility(View.GONE);

        if (TextUtils.isEmpty(fullName)) {
            tilFullName.setError("Enter your full name");
            return;
        }
        tilFullName.setError(null);

        if (!TextUtils.isEmpty(email) && !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            tilEmail.setError("Enter a valid email address");
            return;
        }
        tilEmail.setError(null);

        if (TextUtils.isEmpty(phone) || phone.length() < 10) {
            tilPhone.setError("Enter a valid phone number");
            return;
        }
        tilPhone.setError(null);

        if (TextUtils.isEmpty(password) || password.length() < 6) {
            tilPassword.setError("Password must be at least 6 characters");
            return;
        }
        tilPassword.setError(null);

        if (!password.equals(confirmPassword)) {
            tilConfirmPassword.setError("Passwords do not match");
            return;
        }
        tilConfirmPassword.setError(null);

        RegisterRequest req = new RegisterRequest(fullName, email, phone, password, dob, gender, bloodGroup);
        viewModel.register(req).observe(this, this::handleResult);
    }

    private void handleResult(Resource<RegisterResponse> resource) {
        if (resource == null) return;

        switch (resource.status) {
            case LOADING:
                setLoading(true);
                break;
            case SUCCESS:
                setLoading(false);
                RegisterResponse body = resource.data;
                if (body.success) {
                    Intent intent = new Intent(this, OtpActivity.class);
                    intent.putExtra(OtpActivity.EXTRA_EMAIL, text(etEmail));
                    startActivity(intent);
                    finish();
                } else {
                    tvError.setText(body.message != null ? body.message : "Registration failed. Please try again.");
                    tvError.setVisibility(View.VISIBLE);
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
        btnRegister.setEnabled(!loading);
    }

    private String text(TextInputEditText et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }

    private String text(AutoCompleteTextView et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }
}
