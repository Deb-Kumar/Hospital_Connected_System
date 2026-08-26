package com.brainware.hospital.ui.booking;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.model.dto.AvailabilityResponse;
import com.brainware.hospital.model.dto.BookAppointmentRequest;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.ui.appointments.AppointmentDetailActivity;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.BookingViewModel;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.checkbox.MaterialCheckBox;
import com.google.android.material.textfield.TextInputEditText;
import com.google.gson.Gson;

import java.util.Calendar;
import java.util.Locale;

public class BookAppointmentActivity extends AppCompatActivity {

    private TextInputEditText etDate, etTime, etReason;
    private TextView tvAvailability, tvError, tvDoctorMeta, tvDoctorName;
    private MaterialButton btnCheckAvailability, btnConfirmBooking;
    private MaterialCheckBox cbVideoConsultation;
    private android.widget.ProgressBar progressBar;

    private BookingViewModel viewModel;
    private Doctor doctor;
    private String selectedDate, selectedTime;
    private boolean availabilityConfirmed = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_book_appointment);

        String json = getIntent().getStringExtra(Constants.EXTRA_DOCTOR_JSON);
        if (json == null) {
            Toast.makeText(this, "Please select a doctor to book your OPD appointment.", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(this, com.brainware.hospital.ui.doctors.DoctorsByDepartmentActivity.class);
            startActivity(intent);
            finish();
            return;
        }
        doctor = new Gson().fromJson(json, Doctor.class);


        viewModel = new ViewModelProvider(this).get(BookingViewModel.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        tvDoctorName = findViewById(R.id.tvDoctorName);
        tvDoctorMeta = findViewById(R.id.tvDoctorMeta);
        etDate = findViewById(R.id.etDate);
        etTime = findViewById(R.id.etTime);
        etReason = findViewById(R.id.etReason);
        tvAvailability = findViewById(R.id.tvAvailability);
        tvError = findViewById(R.id.tvError);
        btnCheckAvailability = findViewById(R.id.btnCheckAvailability);
        btnConfirmBooking = findViewById(R.id.btnConfirmBooking);
        cbVideoConsultation = findViewById(R.id.cbVideoConsultation);
        progressBar = findViewById(R.id.progressBar);

        tvDoctorName.setText("Dr. " + doctor.getFullName());
        String specialization = doctor.getSpecialization() != null && !doctor.getSpecialization().isEmpty()
                ? doctor.getSpecialization() : doctor.getDepartmentName();
        tvDoctorMeta.setText(String.format(Locale.US, "%s · ₹%.0f consultation fee", specialization, doctor.getConsultationFee()));

        etDate.setOnClickListener(v -> showDatePicker());
        etTime.setOnClickListener(v -> showTimePicker());

        btnCheckAvailability.setOnClickListener(v -> checkAvailability());
        btnConfirmBooking.setOnClickListener(v -> confirmBooking());

        // Any change to date/time invalidates a previous availability check —
        // never let a stale check authorize a booking against a new slot.
        android.text.TextWatcher invalidator = new android.text.TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void afterTextChanged(android.text.Editable s) { invalidateAvailability(); }
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

    private void invalidateAvailability() {
        availabilityConfirmed = false;
        btnConfirmBooking.setEnabled(false);
        tvAvailability.setVisibility(View.GONE);
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
                        tvAvailability.setText(body.message != null ? body.message : "This slot is not available. Please choose another time.");
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
        // Belt-and-suspenders: even though the button is only enabled after a
        // successful availability check, the backend is the real authority
        // and will still reject with 409 if the slot was taken meanwhile.
        if (!availabilityConfirmed) return;

        TokenManager tokenManager = TokenManager.getInstance(this);

        BookAppointmentRequest req = new BookAppointmentRequest();
        req.patientId = tokenManager.getUserId();
        req.doctorId = doctor.getId();
        req.departmentName = doctor.getDepartmentName();
        req.appointmentDate = selectedDate;
        req.appointmentTime = selectedTime;
        req.reasonForVisit = etReason.getText() != null ? etReason.getText().toString().trim() : "";
        req.videoConsultation = cbVideoConsultation.isChecked();
        req.email = tokenManager.getEmail();

        viewModel.book(req).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    setLoading(true);
                    btnConfirmBooking.setEnabled(false);
                    break;
                case SUCCESS:
                    setLoading(false);
                    onBookingSuccess(resource.data);
                    break;
                case ERROR:
                    setLoading(false);
                    btnConfirmBooking.setEnabled(true);
                    // A 409 here means someone else took the slot between our
                    // check and this request — force a fresh check.
                    invalidateAvailability();
                    showError(resource.message);
                    break;
            }
        });
    }

    private void onBookingSuccess(Appointment appointment) {
        Toast.makeText(this, "Appointment booked!", Toast.LENGTH_LONG).show();
        Intent intent = new Intent(this, AppointmentDetailActivity.class);
        intent.putExtra(Constants.EXTRA_APPOINTMENT_JSON, appointment.toJson());
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
}
