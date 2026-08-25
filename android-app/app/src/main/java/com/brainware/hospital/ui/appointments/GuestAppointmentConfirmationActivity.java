package com.brainware.hospital.ui.appointments;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.brainware.hospital.R;
import com.brainware.hospital.model.dto.GuestBookingResponse;
import com.brainware.hospital.ui.auth.LoginActivity;
import com.google.gson.Gson;

public class GuestAppointmentConfirmationActivity extends AppCompatActivity {

    public static final String EXTRA_RESPONSE_JSON = "extra_guest_response_json";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_guest_appointment_confirmation);

        String json = getIntent().getStringExtra(EXTRA_RESPONSE_JSON);
        GuestBookingResponse response = new Gson().fromJson(json, GuestBookingResponse.class);

        ((TextView) findViewById(R.id.tvToken)).setText(
                response.tokenNumber != null ? response.tokenNumber : "—");
        ((TextView) findViewById(R.id.tvDetails)).setText(
                response.doctorName + " · " + response.departmentName + "\n"
                        + response.appointmentDate + ", " + response.appointmentTime);

        findViewById(R.id.btnDone).setOnClickListener(v -> {
            Intent intent = new Intent(this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });
    }
}
