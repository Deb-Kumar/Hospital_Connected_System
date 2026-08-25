package com.brainware.hospital.ui.booking;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.model.dto.AvailabilityResponse;
import com.brainware.hospital.model.dto.GuestBookingRequest;
import com.brainware.hospital.model.dto.GuestBookingResponse;
import com.brainware.hospital.ui.appointments.GuestAppointmentConfirmationActivity;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.viewmodel.GuestBookingViewModel;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.gson.Gson;

import java.util.Calendar;
import java.util.Locale;

public class GuestBookingActivity extends AppCompatActivity {

    private TextInputLayout tilFullName, tilPhone;
    private TextInputEditText etFullName, etPhone, etEmail, etDate, etTime, etReason;
    private TextView tvAvailability, tvError, tvDoctorMeta;
    private MaterialButton btnCheckAvailability, btnConfirmBooking;
    private android.widget.ProgressBar progressBar;

    private GuestBookingViewModel viewModel;
    private Doctor doctor;
    private String selectedDate, selectedTime;
    private boolean availabilityConfirmed = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_guest_booking);

        String json = getIntent().getStringExtra(Constants.EXTRA_DOCTOR_JSON);
        if (json == null) {
            Toast.makeText(this, "Please select a doctor first.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
        doctor = new Gson().fromJson(json, Doctor.class);

        viewModel = new ViewModelProvider(this).get(GuestBookingViewModel.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        tilFullName = findViewById(R.id.tilFullName);
        tilPhone = findViewById(R.id.tilPhone);
        etFullName = findViewById(R.id.etFullName);
        etPhone = findViewById(R.id.etPhone);
        etEmail = findViewById(R.id.etEmail);
        etDate = findViewById(R.id.etDate);
        etTime = findViewById(R.id.etTime);
        etReason = findViewById(R.id.etReason);
        tvAvailability = findViewById(R.id.tvAvailability);
        tvError = findViewById(R.id.tvError);
        tvDoctorMeta = findViewById(R.id.tvDoctorMeta);
        btnCheckAvailability = findViewById(R.id.btnCheckAvailability);
        btnConfirmBooking = findViewById(R.id.btnConfirmBooking);
        progressBar = findViewById(R.id.progressBar);

        String specialization = doctor.getSpecialization() != null && !doctor.getSpecialization().isEmpty()
                ? doctor.getSpecialization() : doctor.getDepartmentName();
        tvDoctorMeta.setText(String.format(Locale.US, "Dr. %s · %s", doctor.getFullName(), specialization));

        etDate.setOnClickListener(v -> showDatePicker());
        etTime.setOnClickListener(v -> showTimePicker());
        btnCheckAvailability.setOnClickListener(v -> checkAvailability());
        btnConfirmBooking.setOnClickListener(v -> confirmBooking());

        android.text.TextWatcher invalidator = new android.text.TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void afterTextChanged(android.text.Editable s) {
                availabilityConfirmed = false;
                btnConfirmBooking.setEnabled(false);
                tvAvailability.setVisibility(View.GONE);
            }
        };
        etDate.addTextChangedListener(invalidator);
        etTime.addTextChangedListener(invalidator);
    }

    private void showDatePicker() {
        Calendar cal = Calendar.getInstance();
        DatePickerDialog dialog = new DatePickerDialog(this, (view, year, month, day) -> {
            selectedDate = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, day);
            etDate.setText(selectedDate);
        }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH));
        dialog.getDatePicker().setMinDate(System.currentTimeMillis() - 1000);
        dialog.show();
    }

    private void showTimePicker() {
        Calendar cal = Calendar.getInstance();
        TimePickerDialog dialog = new TimePickerDialog(this, (view, hour, minute) -> {
            selectedTime = String.format(Locale.US, "%02d:%02d", hour, minute);
            etTime.setText(selectedTime);
        }, cal.get(Calendar.HOUR_OF_DAY), 0, true);
        dialog.show();
    }

    private void checkAvailability() {
        if (TextUtils.isEmpty(selectedDate) || TextUtils.isEmpty(selectedTime)) {
            Toast.makeText(this, "Please choose a date and time first.", Toast.LENGTH_SHORT).show();
            return;
        }

        viewModel.checkAvailability(doctor.getId(), selectedDate, selectedTime).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    setLoading(true);
                    break;
                case SUCCESS:
                    setLoading(false);
                    AvailabilityResponse body = resource.data;
                    tvAvailability.setVisibility(View.VISIBLE);
                    if (body.isAvailable()) {
                        tvAvailability.setText("✓ This slot is available");
                        tvAvailability.setTextColor(getColor(R.color.success_green));
                        availabilityConfirmed = true;
                        btnConfirmBooking.setEnabled(true);
                    } else {
                        tvAvailability.setText(body.message != null ? body.message : "This slot is not available.");
                        tvAvailability.setTextColor(getColor(R.color.error_red));
                        availabilityConfirmed = false;
                        btnConfirmBooking.setEnabled(false);
                    }
                    break;
                case ERROR:
                    setLoading(false);
                    showError(resource.message);
                    break;
            }
        });
    }

    private void confirmBooking() {
        if (!availabilityConfirmed) return;

        String fullName = text(etFullName);
        String phone = text(etPhone);
        String email = text(etEmail);

        tvError.setVisibility(View.GONE);

        if (TextUtils.isEmpty(fullName)) {
            tilFullName.setError("Enter your full name");
            return;
        }
        tilFullName.setError(null);

        if (TextUtils.isEmpty(phone) || phone.length() < 10) {
            tilPhone.setError("Enter a valid phone number");
            return;
        }
        tilPhone.setError(null);

        if (!TextUtils.isEmpty(email) && !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            Toast.makeText(this, "Enter a valid email, or leave it blank.", Toast.LENGTH_SHORT).show();
            return;
        }

        GuestBookingRequest req = new GuestBookingRequest();
        req.fullName = fullName;
        req.phone = phone;
        req.email = email;
        req.doctorId = doctor.getId();
        req.departmentName = doctor.getDepartmentName();
        req.appointmentDate = selectedDate;
        req.appointmentTime = selectedTime;
        req.reasonForVisit = text(etReason);

        viewModel.book(req).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    setLoading(true);
                    btnConfirmBooking.setEnabled(false);
                    break;
                case SUCCESS:
                    setLoading(false);
                    onSuccess(resource.data);
                    break;
                case ERROR:
                    setLoading(false);
                    btnConfirmBooking.setEnabled(true);
                    availabilityConfirmed = false;
                    tvAvailability.setVisibility(View.GONE);
                    showError(resource.message);
                    break;
            }
        });
    }

    private void onSuccess(GuestBookingResponse response) {
        Intent intent = new Intent(this, GuestAppointmentConfirmationActivity.class);
        intent.putExtra(GuestAppointmentConfirmationActivity.EXTRA_RESPONSE_JSON, new Gson().toJson(response));
        startActivity(intent);
        finish();
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnCheckAvailability.setEnabled(!loading);
    }

    private String text(TextInputEditText et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }
}
