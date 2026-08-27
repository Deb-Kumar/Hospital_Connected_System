package com.brainware.hospital.ui.doctors;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.ui.booking.BookAppointmentActivity;
import com.brainware.hospital.ui.booking.GuestBookingActivity;
import com.brainware.hospital.utils.Constants;
import com.google.gson.Gson;

public class DoctorProfileActivity extends AppCompatActivity {

    private Doctor doctor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_doctor_profile);

        String json = getIntent().getStringExtra(Constants.EXTRA_DOCTOR_JSON);
        if (json != null) {
            doctor = new Gson().fromJson(json, Doctor.class);
        }

        View btnBack = findViewById(R.id.btnBack);
        if (btnBack != null) {
            btnBack.setOnClickListener(v -> finish());
        }

        if (doctor != null) {
            bindDoctor();
        }
    }

    private void bindDoctor() {
        String name = doctor.getFullName();
        ((TextView) findViewById(R.id.tvName)).setText(name != null && name.startsWith("Dr.") ? name : "Dr. " + name);

        String specialization = doctor.getSpecialization() != null && !doctor.getSpecialization().isEmpty()
                ? doctor.getSpecialization() : (doctor.getDepartmentName() != null ? doctor.getDepartmentName() : "Cardiologist");
        ((TextView) findViewById(R.id.tvSpecialization)).setText(specialization);

        TextView tvQual = findViewById(R.id.tvQualification);
        if (tvQual != null) {
            tvQual.setText("MBBS, MD (" + specialization + ")");
        }

        TextView tvExp = findViewById(R.id.tvExperience);
        if (tvExp != null) {
            int exp = doctor.getExperienceYears() > 0 ? doctor.getExperienceYears() : 12;
            tvExp.setText(exp + "+ Years Experience");
        }

        TextView tvFee = findViewById(R.id.tvFee);
        if (tvFee != null) {
            tvFee.setText(String.format("₹%.0f", doctor.getConsultationFee() > 0 ? doctor.getConsultationFee() : 600.0));
        }

        TextView tvBio = findViewById(R.id.tvBio);
        if (tvBio != null) {
            tvBio.setText(safe(doctor.getBio(), "Dr. " + name + " is a senior specialist in " + specialization + " with extensive clinical experience in advanced patient care."));
        }

        View btnBook = findViewById(R.id.btnBook);
        if (doctor.isOnLeave()) {
            findViewById(R.id.tvOnLeaveNotice).setVisibility(View.VISIBLE);
            btnBook.setEnabled(false);
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
