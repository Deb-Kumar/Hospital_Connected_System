package com.brainware.hospital.ui.appointments;

import android.content.Intent;
import android.graphics.Color;
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
        TextView tvStatus = findViewById(R.id.tvStatus);
        String status = appointment.getStatus() != null ? appointment.getStatus().toUpperCase() : "PENDING";

        if ("ACCEPTED".equals(status) || "CONFIRMED".equals(status)) {
            tvStatus.setText("CONFIRMED");
            tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
            tvStatus.setTextColor(Color.parseColor("#2E7D32"));
        } else if ("PENDING".equals(status) || "SCHEDULED".equals(status)) {
            tvStatus.setText("PENDING");
            tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#FEF3C7")));
            tvStatus.setTextColor(Color.parseColor("#D97706"));
        } else if ("COMPLETED".equals(status)) {
            tvStatus.setText("COMPLETED");
            tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#F3E5F5")));
            tvStatus.setTextColor(Color.parseColor("#7B1FA2"));
        } else {
            tvStatus.setText("CANCELLED");
            tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#FFEBEE")));
            tvStatus.setTextColor(Color.parseColor("#D32F2F"));
        }

        ((TextView) findViewById(R.id.tvDoctor)).setText(appointment.getDoctorName());
        ((TextView) findViewById(R.id.tvDepartment)).setText(
                appointment.getDepartmentName() != null ? appointment.getDepartmentName() : "General Medicine");
        ((TextView) findViewById(R.id.tvDateTime)).setText(
                "📅 Appointment: " + appointment.getAppointmentDate() + "  •  ⏰ " + appointment.getAppointmentTime());

        TextView tvBookingTime = findViewById(R.id.tvBookingTime);
        if (tvBookingTime != null) {
            String bTime = appointment.getFormattedBookingTime();
            if (!bTime.isEmpty()) {
                tvBookingTime.setVisibility(View.VISIBLE);
                tvBookingTime.setText("📝 " + bTime);
            } else {
                tvBookingTime.setVisibility(View.GONE);
            }
        }

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

        tvToken.setText(appointment.getFormattedToken());

        if (appointment.getQueueNumber() > 0) {
            tvQueueInfo.setVisibility(View.VISIBLE);
            tvQueueInfo.setText(String.format("Queue position %d · ~%d min estimated wait",
                    appointment.getQueueNumber(), appointment.getEstimatedWaitMinutes()));
        } else {
            tvQueueInfo.setVisibility(View.GONE);
        }

        if (tvRawRefId != null) {
            tvRawRefId.setVisibility(View.GONE);
        }

        View layoutPendingNote = findViewById(R.id.layoutPendingNote);
        if (layoutPendingNote != null) {
            boolean isDoctorUnassigned = "Doctor not assigned".equals(appointment.getDoctorName());
            boolean isPending = "PENDING".equals(status) || "SCHEDULED".equals(status) || isDoctorUnassigned;
            layoutPendingNote.setVisibility(isPending ? View.VISIBLE : View.GONE);
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
        String sched = appointment.getDoctorAvailabilitySchedule();
        if (sched == null || sched.trim().isEmpty()) {
            sched = "MON:09:00-17:00,TUE:09:00-17:00,WED:09:00-17:00,THU:09:00-17:00,FRI:09:00-17:00";
        }

        int startHour = 9;
        int endHour = 17;
        String hoursStr = "09:00 AM - 05:00 PM";
        try {
            String[] parts = sched.split(",");
            for (String p : parts) {
                String[] tokens = p.split(":");
                if (tokens.length >= 2) {
                    String timeRange = tokens[1].trim();
                    String[] times = timeRange.split("-");
                    if (times.length == 2) {
                        startHour = Integer.parseInt(times[0].split(":")[0]);
                        endHour = Integer.parseInt(times[1].split(":")[0]);
                        String sAmPm = startHour >= 12 ? (startHour == 12 ? "12:00 PM" : (startHour - 12) + ":00 PM") : startHour + ":00 AM";
                        String eAmPm = endHour >= 12 ? (endHour == 12 ? "12:00 PM" : (endHour - 12) + ":00 PM") : endHour + ":00 AM";
                        hoursStr = sAmPm + " - " + eAmPm;
                        break;
                    }
                }
            }
        } catch (Exception ignored) {}

        final String finalSched = sched;
        final int finalStartHour = startHour;
        final int finalEndHour = endHour;
        final String finalHoursStr = hoursStr;

        Calendar cal = Calendar.getInstance();
        android.app.DatePickerDialog dateDialog = new android.app.DatePickerDialog(this, (dateView, year, month, day) -> {
            Calendar chosenCal = Calendar.getInstance();
            chosenCal.set(year, month, day);
            int dayOfWeek = chosenCal.get(Calendar.DAY_OF_WEEK);
            String dayCode = getDayCode(dayOfWeek);

            if (!finalSched.toUpperCase().contains(dayCode)) {
                String docName = appointment.getDoctorName();
                Toast.makeText(this, "⚠️ " + docName + " is NOT available on " + getDayFullName(dayOfWeek) + "s. Please pick another day.", Toast.LENGTH_LONG).show();
                return;
            }

            String newDate = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, day);

            new android.app.TimePickerDialog(this, (timeView, hour, minute) -> {
                if (hour < finalStartHour || hour >= finalEndHour) {
                    String docName = appointment.getDoctorName();
                    Toast.makeText(this, "⚠️ " + docName + " is available only between " + finalHoursStr + ". Please pick a time slot within shift hours.", Toast.LENGTH_LONG).show();
                    return;
                }
                String newTime = String.format(Locale.US, "%02d:%02d", hour, minute);
                performReschedule(newDate, newTime);
            }, finalStartHour, 0, false).show();
        }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH));
        dateDialog.getDatePicker().setMinDate(System.currentTimeMillis() - 1000);
        dateDialog.show();
    }

    private String getDayCode(int dayOfWeek) {
        switch (dayOfWeek) {
            case Calendar.MONDAY: return "MON";
            case Calendar.TUESDAY: return "TUE";
            case Calendar.WEDNESDAY: return "WED";
            case Calendar.THURSDAY: return "THU";
            case Calendar.FRIDAY: return "FRI";
            case Calendar.SATURDAY: return "SAT";
            case Calendar.SUNDAY: return "SUN";
            default: return "MON";
        }
    }

    private String getDayFullName(int dayOfWeek) {
        switch (dayOfWeek) {
            case Calendar.MONDAY: return "Monday";
            case Calendar.TUESDAY: return "Tuesday";
            case Calendar.WEDNESDAY: return "Wednesday";
            case Calendar.THURSDAY: return "Thursday";
            case Calendar.FRIDAY: return "Friday";
            case Calendar.SATURDAY: return "Saturday";
            case Calendar.SUNDAY: return "Sunday";
            default: return "Day";
        }
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
        CancelAppointmentModalDialog dialog = CancelAppointmentModalDialog.newInstance();
        dialog.setOnCancelConfirmListener(reason -> performCancel(reason));
        dialog.show(getSupportFragmentManager(), "CancelAppointmentModalDialog");
    }

    private void performCancel(String reason) {
        viewModel.cancel(appointment.getId(), reason).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    btnCancel.setEnabled(false);
                    break;
                case SUCCESS:
                    Toast.makeText(this, "Your booking appointment is cancelled.", Toast.LENGTH_LONG).show();
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
