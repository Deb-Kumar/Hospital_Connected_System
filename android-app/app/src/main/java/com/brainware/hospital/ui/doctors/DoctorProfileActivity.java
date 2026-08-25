package com.brainware.hospital.ui.doctors;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.ui.booking.BookAppointmentActivity;
import com.brainware.hospital.ui.booking.GuestBookingActivity;
import com.brainware.hospital.utils.Constants;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.gson.Gson;

public class DoctorProfileActivity extends AppCompatActivity {

    private Doctor doctor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_doctor_profile);

        String json = getIntent().getStringExtra(Constants.EXTRA_DOCTOR_JSON);
        doctor = new Gson().fromJson(json, Doctor.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        bindDoctor();
    }

    private void bindDoctor() {
        ((TextView) findViewById(R.id.tvName)).setText("Dr. " + doctor.getFullName());

        String specialization = doctor.getSpecialization() != null && !doctor.getSpecialization().isEmpty()
                ? doctor.getSpecialization() : doctor.getDepartmentName();
        ((TextView) findViewById(R.id.tvSpecialization)).setText(specialization);

        ((TextView) findViewById(R.id.tvQualification)).setText(
                "Qualification: " + safe(doctor.getQualification(), "Not specified"));
        ((TextView) findViewById(R.id.tvExperience)).setText(
                "Experience: " + doctor.getExperienceYears() + " years");
        ((TextView) findViewById(R.id.tvDepartment)).setText(
                "Department: " + doctor.getDepartmentName());
        ((TextView) findViewById(R.id.tvFee)).setText(
                String.format("Consultation Fee: ₹%.0f", doctor.getConsultationFee()));
        ((TextView) findViewById(R.id.tvAvailability)).setText(
                "Availability: " + safe(doctor.getAvailabilitySchedule(), "Contact reception for schedule"));
        ((TextView) findViewById(R.id.tvBio)).setText(
                safe(doctor.getBio(), "No additional information provided."));

        MaterialButton btnBook = findViewById(R.id.btnBook);
        if (doctor.isOnLeave()) {
            findViewById(R.id.tvOnLeaveNotice).setVisibility(View.VISIBLE);
            btnBook.setEnabled(false);
            btnBook.setText("Currently Unavailable");
        } else {
            btnBook.setOnClickListener(v -> {
                boolean loggedIn = TokenManager.getInstance(this).isLoggedIn();
                Intent intent = new Intent(this, loggedIn ? BookAppointmentActivity.class : GuestBookingActivity.class);
                intent.putExtra(Constants.EXTRA_DOCTOR_JSON, new Gson().toJson(doctor));
                startActivity(intent);
            });
        }
    }

    private String safe(String value, String fallback) {
        return (value == null || value.trim().isEmpty()) ? fallback : value;
    }
}
