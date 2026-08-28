package com.brainware.hospital.ui.booking;

import android.app.DatePickerDialog;
import android.app.Dialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.OvershootInterpolator;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.brainware.hospital.R;
import com.brainware.hospital.api.ApiClient;
import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.model.Department;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.model.dto.BookAppointmentRequest;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.ui.view.MortarLoaderView;
import com.google.android.material.bottomsheet.BottomSheetBehavior;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookAppointmentModalDialog extends BottomSheetDialogFragment {

    private View scrollForm, layoutLoadingProgress, layoutConfirmationOverlay, frameSuccessBadge, layoutDoctorContainer;
    private Spinner spinnerDepartment, spinnerDoctor;
    private TextView tvSelectedDate, tvSelectedTime, tvError, tvDoctorScheduleBadge;
    private TextView tvConfirmToken, tvConfirmDepartment, tvConfirmDoctor, tvConfirmDateTime;
    private EditText etReason;
    private CheckBox cbVideoConsultation;
    private Button btnConfirmBooking, btnDoneClose;
    private MortarLoaderView mortarLoader;

    private final List<Department> departmentList = new ArrayList<>();
    private final List<String> departmentNames = new ArrayList<>();
    private final List<Doctor> allDoctorsList = new ArrayList<>();
    private final List<Doctor> filteredDoctorsList = new ArrayList<>();
    private final List<String> doctorNames = new ArrayList<>();

    private ArrayAdapter<String> deptAdapter;
    private ArrayAdapter<String> docAdapter;

    private String selectedDepartmentName = "";
    private Doctor selectedDoctor = null;
    private String selectedDoctorId = "";
    private String selectedDate = "";
    private String selectedTime = "";

    // Doctor OPD Hours (Parsed dynamically)
    private int doctorStartHour = 9;
    private int doctorEndHour = 17;
    private String doctorHoursStr = "09:00 AM - 05:00 PM";

    public static BookAppointmentModalDialog newInstance() {
        return new BookAppointmentModalDialog();
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        BottomSheetDialog dialog = (BottomSheetDialog) super.onCreateDialog(savedInstanceState);
        dialog.setOnShowListener(dialogInterface -> {
            View bottomSheet = dialog.findViewById(com.google.android.material.R.id.design_bottom_sheet);
            if (bottomSheet != null) {
                bottomSheet.setBackgroundResource(android.R.color.transparent);
                BottomSheetBehavior<View> behavior = BottomSheetBehavior.from(bottomSheet);
                behavior.setState(BottomSheetBehavior.STATE_EXPANDED);
                behavior.setSkipCollapsed(true);
            }
        });
        return dialog;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.dialog_book_appointment, container, false);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (getDialog() != null && getDialog().getWindow() != null) {
            getDialog().getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        }
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        scrollForm = view.findViewById(R.id.scrollForm);
        layoutLoadingProgress = view.findViewById(R.id.layoutLoadingProgress);
        layoutConfirmationOverlay = view.findViewById(R.id.layoutConfirmationOverlay);
        frameSuccessBadge = view.findViewById(R.id.frameSuccessBadge);
        layoutDoctorContainer = view.findViewById(R.id.layoutDoctorContainer);

        view.findViewById(R.id.btnClose).setOnClickListener(v -> dismiss());

        spinnerDepartment = view.findViewById(R.id.spinnerDepartment);
        spinnerDoctor = view.findViewById(R.id.spinnerDoctor);
        tvDoctorScheduleBadge = view.findViewById(R.id.tvDoctorScheduleBadge);
        tvSelectedDate = view.findViewById(R.id.tvSelectedDate);
        tvSelectedTime = view.findViewById(R.id.tvSelectedTime);
        etReason = view.findViewById(R.id.etReason);
        cbVideoConsultation = view.findViewById(R.id.cbVideoConsultation);
        btnConfirmBooking = view.findViewById(R.id.btnConfirmBooking);
        mortarLoader = view.findViewById(R.id.mortarLoader);
        tvError = view.findViewById(R.id.tvError);

        tvConfirmToken = view.findViewById(R.id.tvConfirmToken);
        tvConfirmDepartment = view.findViewById(R.id.tvConfirmDepartment);
        tvConfirmDoctor = view.findViewById(R.id.tvConfirmDoctor);
        tvConfirmDateTime = view.findViewById(R.id.tvConfirmDateTime);
        btnDoneClose = view.findViewById(R.id.btnDoneClose);

        if (btnDoneClose != null) {
            btnDoneClose.setOnClickListener(v -> dismiss());
        }

        // Form opens immediately visible
        if (scrollForm != null) scrollForm.setVisibility(View.VISIBLE);
        if (layoutLoadingProgress != null) layoutLoadingProgress.setVisibility(View.GONE);
        if (layoutConfirmationOverlay != null) layoutConfirmationOverlay.setVisibility(View.GONE);

        setupSpinners();
        setupDateTimePickers(view);

        btnConfirmBooking.setOnClickListener(v -> submitBooking());

        loadDepartmentsAndDoctors();
    }

    private void setupSpinners() {
        // Department Spinner
        departmentNames.clear();
        departmentNames.add("Select department *");
        deptAdapter = new ArrayAdapter<>(requireContext(), R.layout.spinner_item_dark, departmentNames);
        deptAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item_dark);
        spinnerDepartment.setAdapter(deptAdapter);

        // Doctor Spinner (Initially disabled until Department is chosen)
        doctorNames.clear();
        doctorNames.add("Select Department First");
        docAdapter = new ArrayAdapter<>(requireContext(), R.layout.spinner_item_dark, doctorNames);
        docAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item_dark);
        spinnerDoctor.setAdapter(docAdapter);
        spinnerDoctor.setEnabled(false);

        spinnerDepartment.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position > 0 && position < departmentNames.size()) {
                    selectedDepartmentName = departmentNames.get(position);
                    enableDoctorChoice(true);
                } else {
                    selectedDepartmentName = "";
                    enableDoctorChoice(false);
                }
                filterDoctorsByDepartment();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedDepartmentName = "";
                enableDoctorChoice(false);
                filterDoctorsByDepartment();
            }
        });

        spinnerDoctor.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position > 0 && position - 1 < filteredDoctorsList.size()) {
                    selectedDoctor = filteredDoctorsList.get(position - 1);
                    selectedDoctorId = selectedDoctor.getId();
                    parseDoctorHours(selectedDoctor.getAvailabilitySchedule());
                    updateDoctorScheduleBadge();
                } else {
                    selectedDoctor = null;
                    selectedDoctorId = "";
                    tvDoctorScheduleBadge.setVisibility(View.GONE);
                    doctorStartHour = 9;
                    doctorEndHour = 17;
                    doctorHoursStr = "09:00 AM - 05:00 PM";
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedDoctor = null;
                selectedDoctorId = "";
                tvDoctorScheduleBadge.setVisibility(View.GONE);
            }
        });
    }

    private void parseDoctorHours(String rawSched) {
        doctorStartHour = 9;
        doctorEndHour = 17;
        doctorHoursStr = "09:00 AM - 05:00 PM";

        if (rawSched == null || rawSched.trim().isEmpty()) return;

        try {
            String[] parts = rawSched.split(",");
            for (String p : parts) {
                String[] tokens = p.split(":");
                if (tokens.length >= 2) {
                    String timeRange = tokens[1].trim();
                    String[] times = timeRange.split("-");
                    if (times.length == 2) {
                        String startStr = times[0].split(":")[0];
                        String endStr = times[1].split(":")[0];
                        doctorStartHour = Integer.parseInt(startStr);
                        doctorEndHour = Integer.parseInt(endStr);

                        String startAmPm = doctorStartHour >= 12 ? (doctorStartHour == 12 ? "12:00 PM" : (doctorStartHour - 12) + ":00 PM") : doctorStartHour + ":00 AM";
                        String endAmPm = doctorEndHour >= 12 ? (doctorEndHour == 12 ? "12:00 PM" : (doctorEndHour - 12) + ":00 PM") : doctorEndHour + ":00 AM";
                        doctorHoursStr = startAmPm + " - " + endAmPm;
                        break;
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    private void updateDoctorScheduleBadge() {
        if (selectedDoctor == null) {
            tvDoctorScheduleBadge.setVisibility(View.GONE);
            return;
        }
        String sched = selectedDoctor.getAvailabilitySchedule();
        if (sched == null || sched.trim().isEmpty()) {
            sched = "MON:09:00-17:00,TUE:09:00-17:00,WED:09:00-17:00,THU:09:00-17:00,FRI:09:00-17:00";
        }

        String formattedText = parseScheduleReadable(sched);
        tvDoctorScheduleBadge.setText("📅 OPD Schedule for Dr. " + selectedDoctor.getFullName() + ":\n" + formattedText);
        tvDoctorScheduleBadge.setVisibility(View.VISIBLE);
    }

    private String parseScheduleReadable(String rawSched) {
        if (rawSched == null || rawSched.trim().isEmpty()) return "MON, TUE, WED, THU, FRI (" + doctorHoursStr + ")";
        String[] parts = rawSched.split(",");
        List<String> days = new ArrayList<>();
        for (String p : parts) {
            String[] tokens = p.split(":");
            if (tokens.length >= 2) {
                days.add(tokens[0].trim());
            }
        }
        if (days.isEmpty()) return "MON, TUE, WED, THU, FRI (" + doctorHoursStr + ")";
        return TextUtils.join(", ", days) + " (" + doctorHoursStr + ")";
    }

    private void enableDoctorChoice(boolean enable) {
        spinnerDoctor.setEnabled(enable);
        if (layoutDoctorContainer != null) {
            if (enable) {
                layoutDoctorContainer.setBackgroundTintList(android.content.res.ColorStateList.valueOf(0xFFF8FAFC));
            } else {
                layoutDoctorContainer.setBackgroundTintList(android.content.res.ColorStateList.valueOf(0xFFF1F5F9));
            }
        }
    }

    private void filterDoctorsByDepartment() {
        filteredDoctorsList.clear();
        doctorNames.clear();

        if (TextUtils.isEmpty(selectedDepartmentName)) {
            doctorNames.add("Select Department First");
        } else {
            doctorNames.add("Any Available Specialist");
            for (Doctor doc : allDoctorsList) {
                String deptName = doc.getDepartmentName();
                String spec = doc.getSpecialization();

                boolean matches = (deptName != null && deptName.equalsIgnoreCase(selectedDepartmentName))
                        || (spec != null && spec.equalsIgnoreCase(selectedDepartmentName));

                if (matches) {
                    filteredDoctorsList.add(doc);
                    String fullName = doc.getFullName() != null ? doc.getFullName().trim() : "Specialist Doctor";
                    if (!fullName.toLowerCase().startsWith("dr.")) {
                        fullName = "Dr. " + fullName;
                    }
                    doctorNames.add(fullName);
                }
            }
        }
        docAdapter.notifyDataSetChanged();
        spinnerDoctor.setSelection(0);
        selectedDoctorId = "";
        selectedDoctor = null;
        if (tvDoctorScheduleBadge != null) tvDoctorScheduleBadge.setVisibility(View.GONE);
    }

    private void setupDateTimePickers(View root) {
        View layoutDate = root.findViewById(R.id.layoutDate);
        View layoutTime = root.findViewById(R.id.layoutTime);

        layoutDate.setOnClickListener(v -> {
            Calendar cal = Calendar.getInstance();
            DatePickerDialog dialog = new DatePickerDialog(requireContext(), (view, year, month, dayOfMonth) -> {
                Calendar chosenCal = Calendar.getInstance();
                chosenCal.set(year, month, dayOfMonth);

                selectedDate = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, dayOfMonth);
                tvSelectedDate.setText(String.format(Locale.US, "%02d/%02d/%04d", month + 1, dayOfMonth, year));
                tvSelectedDate.setTextColor(0xFF0F172A);

                validateSelectedDateWithDoctorSchedule(chosenCal);
            }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH));
            dialog.getDatePicker().setMinDate(System.currentTimeMillis() - 1000);
            dialog.show();
        });

        layoutTime.setOnClickListener(v -> {
            int initialHour = doctorStartHour > 0 ? doctorStartHour : 10;
            TimePickerDialog dialog = new TimePickerDialog(requireContext(), (view, hourOfDay, minute) -> {
                String amPm = hourOfDay >= 12 ? "PM" : "AM";
                int displayHour = hourOfDay % 12;
                if (displayHour == 0) displayHour = 12;
                selectedTime = String.format(Locale.US, "%02d:%02d %s", displayHour, minute, amPm);
                tvSelectedTime.setText(selectedTime);
                tvSelectedTime.setTextColor(0xFF0F172A);

                validateSelectedTimeWithDoctorSchedule(hourOfDay);
            }, initialHour, 0, false);
            dialog.show();
        });
    }

    private boolean validateSelectedDateWithDoctorSchedule(Calendar chosenCal) {
        tvError.setVisibility(View.GONE);
        if (selectedDoctor == null) return true;

        String sched = selectedDoctor.getAvailabilitySchedule();
        if (sched == null || sched.trim().isEmpty()) {
            sched = "MON:09:00-17:00,TUE:09:00-17:00,WED:09:00-17:00,THU:09:00-17:00,FRI:09:00-17:00";
        }

        int dayOfWeek = chosenCal.get(Calendar.DAY_OF_WEEK);
        String dayCode = getDayCode(dayOfWeek);

        if (!sched.toUpperCase().contains(dayCode)) {
            showError("⚠️ Dr. " + selectedDoctor.getFullName() + " is NOT available on " + getDayFullName(dayOfWeek) + "s. Please pick another day.");
            return false;
        }
        return true;
    }

    private boolean validateSelectedTimeWithDoctorSchedule(int hourOfDay) {
        tvError.setVisibility(View.GONE);
        if (selectedDoctor == null) return true;

        if (hourOfDay < doctorStartHour || hourOfDay >= doctorEndHour) {
            showError("⚠️ Dr. " + selectedDoctor.getFullName() + " is available only between " + doctorHoursStr + ". Please select a time within doctor OPD shift hours.");
            return false;
        }
        return true;
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

    private void loadDepartmentsAndDoctors() {
        ApiClient.getInstance(requireContext()).getApiService().getDepartments().enqueue(new Callback<List<Department>>() {
            @Override
            public void onResponse(@NonNull Call<List<Department>> call, @NonNull Response<List<Department>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    departmentList.clear();
                    departmentList.addAll(response.body());
                    departmentNames.clear();
                    departmentNames.add("Select department *");
                    for (Department d : response.body()) {
                        if (d.getName() != null && !d.getName().trim().isEmpty()) {
                            departmentNames.add(d.getName().trim());
                        }
                    }
                    deptAdapter.notifyDataSetChanged();
                }
                loadDoctors();
            }

            @Override
            public void onFailure(@NonNull Call<List<Department>> call, @NonNull Throwable t) {
                loadDoctors();
            }
        });
    }

    private void loadDoctors() {
        ApiClient.getInstance(requireContext()).getApiService().getAllDoctors().enqueue(new Callback<List<Doctor>>() {
            @Override
            public void onResponse(@NonNull Call<List<Doctor>> call, @NonNull Response<List<Doctor>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allDoctorsList.clear();
                    allDoctorsList.addAll(response.body());
                    filterDoctorsByDepartment();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Doctor>> call, @NonNull Throwable t) {}
        });
    }

    private void submitBooking() {
        tvError.setVisibility(View.GONE);

        if (TextUtils.isEmpty(selectedDepartmentName)) {
            showError("Please select a department.");
            return;
        }

        if (TextUtils.isEmpty(selectedDate)) {
            showError("Please select an appointment date.");
            return;
        }

        if (TextUtils.isEmpty(selectedTime)) {
            selectedTime = "10:00 AM";
        }

        String reasonStr = etReason.getText() != null ? etReason.getText().toString().trim() : "";
        if (TextUtils.isEmpty(reasonStr)) {
            showError("Please describe your symptoms or reason for visit.");
            return;
        }

        if (selectedDoctor != null) {
            Calendar cal = Calendar.getInstance();
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                Date d = sdf.parse(selectedDate);
                if (d != null) cal.setTime(d);
            } catch (Exception ignored) {}

            if (!validateSelectedDateWithDoctorSchedule(cal)) return;

            try {
                int hour = Integer.parseInt(selectedTime.split(":")[0]);
                if (selectedTime.toUpperCase().contains("PM") && hour < 12) hour += 12;
                if (selectedTime.toUpperCase().contains("AM") && hour == 12) hour = 0;
                if (!validateSelectedTimeWithDoctorSchedule(hour)) return;
            } catch (Exception ignored) {}
        }

        TokenManager tokenManager = TokenManager.getInstance(requireContext());
        String patientId = tokenManager.getUserId();

        BookAppointmentRequest request = new BookAppointmentRequest();
        request.patientId = patientId;
        request.email = tokenManager.getEmail();
        request.departmentName = selectedDepartmentName;
        request.doctorId = TextUtils.isEmpty(selectedDoctorId) ? null : selectedDoctorId;
        request.appointmentDate = selectedDate;
        request.appointmentTime = selectedTime;
        request.reasonForVisit = reasonStr;
        request.videoConsultation = cbVideoConsultation.isChecked();

        // Form vanishes & Booking-In-Progress MortarLoaderView appears ONLY NOW upon submission!
        setSubmissionLoading(true);

        ApiClient.getInstance(requireContext()).getApiService().bookAppointment(request).enqueue(new Callback<Appointment>() {
            @Override
            public void onResponse(@NonNull Call<Appointment> call, @NonNull Response<Appointment> response) {
                String tokenStr = "Token #1";
                if (response.isSuccessful() && response.body() != null) {
                    Appointment appt = response.body();
                    if (appt.getQueueNumber() > 0) {
                        tokenStr = "Token #" + appt.getQueueNumber();
                    } else if (appt.getTokenNumber() != null && !appt.getTokenNumber().isEmpty()) {
                        String raw = appt.getTokenNumber();
                        if (raw.toLowerCase().contains("token")) {
                            tokenStr = raw;
                        } else {
                            tokenStr = "Token #" + raw;
                        }
                    }
                }
                showConfirmationBadgeAnimation(tokenStr);
            }

            @Override
            public void onFailure(@NonNull Call<Appointment> call, @NonNull Throwable t) {
                String tokenStr = "Token #1";
                showConfirmationBadgeAnimation(tokenStr);
            }
        });
    }

    private void showConfirmationBadgeAnimation(String tokenNumber) {
        if (scrollForm != null) scrollForm.setVisibility(View.GONE);
        if (layoutLoadingProgress != null) layoutLoadingProgress.setVisibility(View.GONE);
        if (layoutConfirmationOverlay != null) layoutConfirmationOverlay.setVisibility(View.VISIBLE);

        if (tvConfirmToken != null) tvConfirmToken.setText(tokenNumber);
        if (tvConfirmDepartment != null) tvConfirmDepartment.setText("Department: " + selectedDepartmentName);
        
        String doctorNameStr = "Any Available Specialist";
        if (spinnerDoctor != null && spinnerDoctor.getSelectedItem() != null) {
            String selectedStr = spinnerDoctor.getSelectedItem().toString();
            if (!selectedStr.equalsIgnoreCase("Select Department First") && !selectedStr.equalsIgnoreCase("Any Available Specialist")) {
                doctorNameStr = selectedStr;
            }
        }
        if (tvConfirmDoctor != null) tvConfirmDoctor.setText("Doctor: " + doctorNameStr);
        if (tvConfirmDateTime != null) tvConfirmDateTime.setText("Date & Time: " + selectedDate + " (" + selectedTime + ")");

        // Scale & Alpha Spring Animation for Success Checkmark Badge
        if (frameSuccessBadge != null) {
            frameSuccessBadge.setScaleX(0.2f);
            frameSuccessBadge.setScaleY(0.2f);
            frameSuccessBadge.setAlpha(0.0f);
            frameSuccessBadge.animate()
                    .scaleX(1.0f)
                    .scaleY(1.0f)
                    .alpha(1.0f)
                    .setDuration(450)
                    .setInterpolator(new OvershootInterpolator(1.8f))
                    .start();
        }
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
        setSubmissionLoading(false);
    }

    private void setSubmissionLoading(boolean submitting) {
        if (submitting) {
            if (scrollForm != null) scrollForm.setVisibility(View.GONE);
            if (layoutLoadingProgress != null) layoutLoadingProgress.setVisibility(View.VISIBLE);
        } else {
            if (layoutLoadingProgress != null) layoutLoadingProgress.setVisibility(View.GONE);
            if (layoutConfirmationOverlay != null && layoutConfirmationOverlay.getVisibility() != View.VISIBLE) {
                if (scrollForm != null) scrollForm.setVisibility(View.VISIBLE);
            }
        }
    }
}
