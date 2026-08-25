package com.brainware.hospital.ui.home;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.DepartmentAdapter;
import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.ui.doctors.DoctorsByDepartmentActivity;
import com.brainware.hospital.ui.profile.DigitalIdActivity;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.AppointmentsViewModel;
import com.brainware.hospital.viewmodel.DepartmentsViewModel;
import com.brainware.hospital.viewmodel.SettingsViewModel;

import java.util.List;

public class HomeFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private TextView tvGreeting, tvUpcomingDoctor, tvUpcomingDetails, tvNoUpcoming, tvError;
    private View layoutUpcoming;
    private RecyclerView rvDepartments;
    private android.widget.ProgressBar progressBar;

    private DepartmentsViewModel departmentsViewModel;
    private AppointmentsViewModel appointmentsViewModel;
    private SettingsViewModel settingsViewModel;
    private DepartmentAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_home, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        departmentsViewModel = new ViewModelProvider(this).get(DepartmentsViewModel.class);
        appointmentsViewModel = new ViewModelProvider(this).get(AppointmentsViewModel.class);
        settingsViewModel = new ViewModelProvider(this).get(SettingsViewModel.class);

        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        tvGreeting = view.findViewById(R.id.tvGreeting);
        layoutUpcoming = view.findViewById(R.id.layoutUpcoming);
        tvUpcomingDoctor = view.findViewById(R.id.tvUpcomingDoctor);
        tvUpcomingDetails = view.findViewById(R.id.tvUpcomingDetails);
        tvNoUpcoming = view.findViewById(R.id.tvNoUpcoming);
        rvDepartments = view.findViewById(R.id.rvDepartments);
        progressBar = view.findViewById(R.id.progressBar);
        tvError = view.findViewById(R.id.tvError);

        setGreeting();
        setupQuickActions(view);
        setupDepartmentsList();

        swipeRefresh.setOnRefreshListener(this::loadData);
        loadData();
    }

    private void setGreeting() {
        String name = TokenManager.getInstance(requireContext()).getFullName();
        int hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY);
        String timeOfDay = hour < 12 ? "Good Morning" : (hour < 17 ? "Good Afternoon" : "Good Evening");
        tvGreeting.setText(timeOfDay + (name != null ? ", " + firstName(name) : ""));
    }

    private String firstName(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 0 ? parts[0] : fullName;
    }

    private void setupQuickActions(View root) {
        bindAction(root, R.id.actionBook, android.R.drawable.ic_menu_agenda, "Book Appointment",
                () -> switchToTab(R.id.nav_doctors));

        bindAction(root, R.id.actionAppointments, android.R.drawable.ic_menu_recent_history, "My Appointments",
                () -> switchToTab(R.id.nav_appointments));

        bindAction(root, R.id.actionRecords, android.R.drawable.ic_menu_edit, "Medical Records",
                () -> switchToTab(R.id.nav_records));

        bindAction(root, R.id.actionFindDoctor, android.R.drawable.ic_menu_search, "Find Doctor",
                () -> switchToTab(R.id.nav_doctors));

        bindAction(root, R.id.actionDigitalId, android.R.drawable.ic_menu_gallery, "Digital Patient ID",
                () -> startActivity(new Intent(requireContext(), DigitalIdActivity.class)));

        bindAction(root, R.id.actionEmergency, android.R.drawable.ic_dialog_alert, "Emergency",
                this::showEmergencyInfo);
    }

    private void bindAction(View root, int includeId, int iconRes, String label, Runnable onClick) {
        View tile = root.findViewById(includeId);
        ImageView icon = tile.findViewById(R.id.ivIcon);
        TextView tvLabel = tile.findViewById(R.id.tvLabel);
        icon.setImageResource(iconRes);
        tvLabel.setText(label);
        tile.setOnClickListener(v -> onClick.run());
    }

    private void switchToTab(int menuItemId) {
        View bottomNav = requireActivity().findViewById(R.id.bottomNav);
        if (bottomNav instanceof com.google.android.material.bottomnavigation.BottomNavigationView) {
            ((com.google.android.material.bottomnavigation.BottomNavigationView) bottomNav)
                    .setSelectedItemId(menuItemId);
        }
    }

    private void showEmergencyInfo() {
        // Never hard-code a hospital emergency number — always fetch the
        // admin-configured value from the backend (GET /api/settings/public).
        androidx.appcompat.app.AlertDialog loadingDialog = new androidx.appcompat.app.AlertDialog.Builder(requireContext())
                .setTitle("Emergency")
                .setMessage("Loading emergency contact information…")
                .setCancelable(true)
                .show();

        settingsViewModel.getPublicSettings().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            if (resource.status == Resource.Status.SUCCESS) {
                loadingDialog.dismiss();
                com.brainware.hospital.model.dto.PublicSettings settings = resource.data;
                String hotline = settings.emergencyHotline != null && !settings.emergencyHotline.isEmpty()
                        ? settings.emergencyHotline : "Not configured — contact reception directly.";
                new androidx.appcompat.app.AlertDialog.Builder(requireContext())
                        .setTitle("Emergency")
                        .setMessage((settings.hospitalName != null ? settings.hospitalName : "Hospital") + " Emergency: " + hotline
                                + "\n\nFor a life-threatening emergency, call your local emergency number immediately.")
                        .setPositiveButton("Close", null)
                        .show();
            } else if (resource.status == Resource.Status.ERROR) {
                loadingDialog.dismiss();
                new androidx.appcompat.app.AlertDialog.Builder(requireContext())
                        .setTitle("Emergency")
                        .setMessage("Couldn't load emergency contact info: " + resource.message
                                + "\n\nFor a life-threatening emergency, call your local emergency number immediately.")
                        .setPositiveButton("Close", null)
                        .show();
            }
        });
    }

    private void setupDepartmentsList() {
        adapter = new DepartmentAdapter(department -> {
            Intent intent = new Intent(requireContext(), DoctorsByDepartmentActivity.class);
            intent.putExtra(Constants.EXTRA_DEPARTMENT_ID, department.getId());
            intent.putExtra(Constants.EXTRA_DEPARTMENT_NAME, department.getName());
            startActivity(intent);
        });
        rvDepartments.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvDepartments.setAdapter(adapter);
    }

    private void loadData() {
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);

        departmentsViewModel.getDepartments().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            swipeRefresh.setRefreshing(false);
            switch (resource.status) {
                case LOADING:
                    break;
                case SUCCESS:
                    progressBar.setVisibility(View.GONE);
                    adapter.submitList(resource.data);
                    break;
                case ERROR:
                    progressBar.setVisibility(View.GONE);
                    tvError.setText(resource.message);
                    tvError.setVisibility(View.VISIBLE);
                    break;
            }
        });

        appointmentsViewModel.getHistory().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null || resource.status != Resource.Status.SUCCESS || resource.data == null) return;
            Appointment next = findNextUpcoming(resource.data);
            if (next != null) {
                layoutUpcoming.setVisibility(View.VISIBLE);
                tvNoUpcoming.setVisibility(View.GONE);
                tvUpcomingDoctor.setText(next.getDoctorName());
                tvUpcomingDetails.setText(next.getDepartmentName() + " · " + next.getAppointmentDate()
                        + ", " + next.getAppointmentTime()
                        + (next.getTokenNumber() != null ? " · Token " + next.getTokenNumber() : ""));
            } else {
                layoutUpcoming.setVisibility(View.GONE);
                tvNoUpcoming.setVisibility(View.VISIBLE);
            }
        });
    }

    @Nullable
    private Appointment findNextUpcoming(List<Appointment> appointments) {
        for (Appointment a : appointments) {
            if ("PENDING".equals(a.getStatus()) || "ACCEPTED".equals(a.getStatus())) {
                return a;
            }
        }
        return null;
    }
}
