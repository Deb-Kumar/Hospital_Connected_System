package com.brainware.hospital.ui.doctors;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
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

        // Doctor Degrees / Qualification
        TextView tvQual = findViewById(R.id.tvQualification);
        if (tvQual != null) {
            String qual = doctor.getQualification();
            if (qual != null && !qual.trim().isEmpty()) {
                tvQual.setText(qual.trim());
            } else {
                tvQual.setText("MBBS, MD (" + specialization + ")");
            }
        }

        // Years of Experience
        TextView tvExp = findViewById(R.id.tvExperience);
        if (tvExp != null) {
            int exp = doctor.getExperienceYears() > 0 ? doctor.getExperienceYears() : 12;
            tvExp.setText(exp + "+ Years Experience");
        }

        // OPD Schedule & Timings (Formatted One by One)
        TextView tvSchedule = findViewById(R.id.tvAvailabilitySchedule);
        if (tvSchedule != null) {
            tvSchedule.setText(formatOpdScheduleOneByOne(doctor.getAvailabilitySchedule()));
        }

        // Consultation Fee
        TextView tvFee = findViewById(R.id.tvFee);
        if (tvFee != null) {
            tvFee.setText(String.format("₹%.0f", doctor.getConsultationFee() > 0 ? doctor.getConsultationFee() : 600.0));
        }

        // About Doctor / Bio
        TextView tvBio = findViewById(R.id.tvBio);
        if (tvBio != null) {
            String bio = doctor.getBio();
            if (bio != null && !bio.trim().isEmpty()) {
                tvBio.setText(bio.trim());
            } else {
                tvBio.setText("Dr. " + name + " is a senior consultant in " + specialization + " with extensive clinical experience in advanced patient treatment and specialized diagnosis.");
            }
        }

        // Fetch & load doctor profile image with Glide
        ImageView ivDoctorPhoto = findViewById(R.id.ivDoctorPhoto);
        if (ivDoctorPhoto != null) {
            String photoUrl = doctor.getPhotoUrl();
            if (photoUrl != null && !photoUrl.trim().isEmpty()) {
                Glide.with(this)
                        .load(photoUrl)
                        .placeholder(R.drawable.ic_user_circle)
                        .error(R.drawable.ic_user_circle)
                        .circleCrop()
                        .into(ivDoctorPhoto);
            } else {
                ivDoctorPhoto.setImageResource(R.drawable.ic_user_circle);
            }
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

    private String formatOpdScheduleOneByOne(String rawSchedule) {
        if (rawSchedule == null || rawSchedule.trim().isEmpty()) {
            return "• Monday - Saturday : 09:00 AM - 05:00 PM";
        }

        String[] parts = rawSchedule.split("[,;\\n]");
        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < parts.length; i++) {
            String part = parts[i].trim();
            if (part.isEmpty()) continue;

            String formattedSlot = formatSingleSlot(part);
            if (builder.length() > 0) {
                builder.append("\n");
            }
            builder.append("• ").append(formattedSlot);
        }

        return builder.length() > 0 ? builder.toString() : "• Monday - Saturday : 09:00 AM - 05:00 PM";
    }

    private String formatSingleSlot(String slot) {
        if (slot.contains(":")) {
            int colonIndex = slot.indexOf(":");
            String dayPart = slot.substring(0, colonIndex).trim();
            String timePart = slot.substring(colonIndex + 1).trim();

            String prettyDay = expandDayName(dayPart);
            String prettyTime = formatTimeRange(timePart);

            return prettyDay + " : " + prettyTime;
        }
        return slot;
    }

    private String expandDayName(String day) {
        String upper = day.toUpperCase();
        switch (upper) {
            case "MON": return "Monday";
            case "TUE": return "Tuesday";
            case "WED": return "Wednesday";
            case "THU": return "Thursday";
            case "FRI": return "Friday";
            case "SAT": return "Saturday";
            case "SUN": return "Sunday";
            case "MON-FRI": return "Monday to Friday";
            case "MON-SAT": return "Monday to Saturday";
            default: return day;
        }
    }

    private String formatTimeRange(String timeRange) {
        if (timeRange.contains("-")) {
            String[] times = timeRange.split("-");
            if (times.length == 2) {
                return formatTime12h(times[0].trim()) + " - " + formatTime12h(times[1].trim());
            }
        }
        return timeRange;
    }

    private String formatTime12h(String time) {
        try {
            if (time.contains(":")) {
                String[] parts = time.split(":");
                int hour = Integer.parseInt(parts[0].trim());
                int min = Integer.parseInt(parts[1].trim());
                String ampm = hour >= 12 ? "PM" : "AM";
                int hour12 = hour % 12;
                if (hour12 == 0) hour12 = 12;
                return String.format("%02d:%02d %s", hour12, min, ampm);
            }
        } catch (Exception e) {}
        return time;
    }
}
