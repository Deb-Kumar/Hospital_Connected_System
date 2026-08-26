package com.brainware.hospital.ui.appointments;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.viewmodel.AppointmentsViewModel;
import com.brainware.hospital.viewmodel.BookingViewModel;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.gson.Gson;

import java.util.Calendar;
import java.util.Locale;

public class AppointmentDetailActivity extends AppCompatActivity {

    private Appointment appointment;
    private AppointmentsViewModel viewModel;
    private BookingViewModel bookingViewModel;
    private MaterialButton btnCancel, btnReschedule;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_appointment_detail);

        String json = getIntent().getStringExtra(Constants.EXTRA_APPOINTMENT_JSON);
        appointment = new Gson().fromJson(json, Appointment.class);

        viewModel = new ViewModelProvider(this).get(AppointmentsViewModel.class);
        bookingViewModel = new ViewModelProvider(this).get(BookingViewModel.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        btnCancel = findViewById(R.id.btnCancel);
        btnReschedule = findViewById(R.id.btnReschedule);

        bind();

        btnCancel.setOnClickListener(v -> confirmCancel());
        btnReschedule.setOnClickListener(v -> showReschedulePicker());
    }

    private void bind() {
        ((TextView) findViewById(R.id.tvStatus)).setText(appointment.getStatus());
        ((TextView) findViewById(R.id.tvDoctor)).setText(appointment.getDoctorName());
        ((TextView) findViewById(R.id.tvDepartment)).setText(
                appointment.getDepartmentName() != null ? appointment.getDepartmentName() : "");
        ((TextView) findViewById(R.id.tvDateTime)).setText(
                appointment.getAppointmentDate() + " · " + appointment.getAppointmentTime());

        String reason = appointment.getReasonForVisit();
        TextView tvReason = findViewById(R.id.tvReason);
        if (reason != null && !reason.isEmpty()) {
            tvReason.setVisibility(View.VISIBLE);
            tvReason.setText("Reason: " + reason);
        } else {
            tvReason.setVisibility(View.GONE);
        }

        TextView tvToken = findViewById(R.id.tvToken);
        TextView tvQueueInfo = findViewById(R.id.tvQueueInfo);
        TextView tvRawRefId = findViewById(R.id.tvRawRefId);

        String rawToken = appointment.getTokenNumber();
        String cleanToken = "Token #1";
        if (rawToken != null && !rawToken.isEmpty()) {
            cleanToken = rawToken;
            if (rawToken.contains("-")) {
                String[] parts = rawToken.split("-");
                cleanToken = "Token #" + parts[parts.length - 1];
            } else if (rawToken.length() > 12) {
                cleanToken = "Token #" + rawToken.substring(rawToken.length() - 4);
            } else if (!rawToken.startsWith("Token")) {
                cleanToken = "Token #" + rawToken;
            }
        } else if (appointment.getQueueNumber() > 0) {
            cleanToken = "Token #" + appointment.getQueueNumber();
        }

        tvToken.setText(cleanToken);

        if (appointment.getQueueNumber() > 0) {
            tvQueueInfo.setVisibility(View.VISIBLE);
            tvQueueInfo.setText(String.format("Queue position %d · ~%d min estimated wait",
                    appointment.getQueueNumber(), appointment.getEstimatedWaitMinutes()));
        } else {
            tvQueueInfo.setVisibility(View.GONE);
        }

        if (tvRawRefId != null) {
            String refId = appointment.getId() != null ? appointment.getId() : (rawToken != null ? rawToken : "");
            if (!refId.isEmpty()) {
                tvRawRefId.setVisibility(View.VISIBLE);
                tvRawRefId.setText("Ref ID: " + refId);
            } else {
                tvRawRefId.setVisibility(View.GONE);
            }
        }

        TextView tvCancellationReason = findViewById(R.id.tvCancellationReason);
        if (appointment.getCancellationReason() != null && !appointment.getCancellationReason().isEmpty()) {
            tvCancellationReason.setVisibility(View.VISIBLE);
            tvCancellationReason.setText("Cancellation reason: " + appointment.getCancellationReason());
        } else {
            tvCancellationReason.setVisibility(View.GONE);
        }

        btnCancel.setVisibility(appointment.isCancellable() ? View.VISIBLE : View.GONE);
        btnReschedule.setVisibility(appointment.isCancellable() ? View.VISIBLE : View.GONE);
    }

    private void showReschedulePicker() {
        Calendar cal = Calendar.getInstance();
        android.app.DatePickerDialog dateDialog = new android.app.DatePickerDialog(this, (dateView, year, month, day) -> {
            String newDate = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, day);
            Calendar timeCal = Calendar.getInstance();
            new android.app.TimePickerDialog(this, (timeView, hour, minute) -> {
                String newTime = String.format(Locale.US, "%02d:%02d", hour, minute);
                performReschedule(newDate, newTime);
            }, timeCal.get(Calendar.HOUR_OF_DAY), 0, true).show();
        }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH));
        dateDialog.getDatePicker().setMinDate(System.currentTimeMillis() - 1000);
        dateDialog.show();
    }

    private void performReschedule(String date, String time) {
        // The backend creates a brand-new Appointment for the new slot and
        // marks this one RESCHEDULED (see appointmentController.reschedule) —
        // it is NOT a plain PUT-in-place update, so we navigate away rather
        // than try to rebind this screen with the old appointment's id.
        bookingViewModel.reschedule(appointment.getId(), date, time).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    btnReschedule.setEnabled(false);
                    break;
                case SUCCESS:
                    Toast.makeText(this, "Appointment rescheduled.", Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(this, AppointmentDetailActivity.class);
                    intent.putExtra(Constants.EXTRA_APPOINTMENT_JSON, resource.data.toJson());
                    startActivity(intent);
                    finish();
                    break;
                case ERROR:
                    btnReschedule.setEnabled(true);
                    Toast.makeText(this, resource.message, Toast.LENGTH_LONG).show();
                    break;
            }
        });
    }

    private void confirmCancel() {
        final android.widget.EditText input = new android.widget.EditText(this);
        input.setHint("Reason (optional)");
        int pad = (int) (16 * getResources().getDisplayMetrics().density);
        input.setPadding(pad, pad, pad, pad);

        new AlertDialog.Builder(this)
                .setTitle("Cancel this appointment?")
                .setMessage("This can't be undone. The doctor and reception will be notified.")
                .setView(input)
                .setNegativeButton("Keep Appointment", null)
                .setPositiveButton("Cancel Appointment", (dialog, which) -> {
                    String reason = input.getText() != null ? input.getText().toString().trim() : "";
                    performCancel(reason);
                })
                .show();
    }

    private void performCancel(String reason) {
        viewModel.cancel(appointment.getId(), reason).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    btnCancel.setEnabled(false);
                    break;
                case SUCCESS:
                    Toast.makeText(this, "Appointment cancelled.", Toast.LENGTH_SHORT).show();
                    finish();
                    break;
                case ERROR:
                    btnCancel.setEnabled(true);
                    Toast.makeText(this, resource.message, Toast.LENGTH_LONG).show();
                    break;
            }
        });
    }
}
