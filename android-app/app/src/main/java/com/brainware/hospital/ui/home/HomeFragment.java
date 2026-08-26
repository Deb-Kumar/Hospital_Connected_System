package com.brainware.hospital.ui.home;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.ui.main.MainActivity;

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

        view.findViewById(R.id.ivUserAvatar).setOnClickListener(v -> switchToTab(R.id.nav_profile));
        view.findViewById(R.id.btnViewAllAppointments).setOnClickListener(v -> switchToTab(R.id.nav_appointments));

        swipeRefresh.setOnRefreshListener(this::loadData);
        loadData();
    }

    private void setGreeting() {
        String name = TokenManager.getInstance(requireContext()).getFullName();
        if (name != null && !name.trim().isEmpty()) {
            tvGreeting.setText(name.trim());
        } else {
            tvGreeting.setText("Debkumar Payra");
        }
    }

    private void setupQuickActions(View root) {
        // Row 1
        root.findViewById(R.id.actionBook).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), DoctorsByDepartmentActivity.class)));

        root.findViewById(R.id.actionDoctorConsult).setOnClickListener(v ->
                switchToTab(R.id.nav_doctors));

        root.findViewById(R.id.actionMyReports).setOnClickListener(v ->
                switchToTab(R.id.nav_records));

        root.findViewById(R.id.actionPrescriptions).setOnClickListener(v ->
                switchToTab(R.id.nav_records));

        // Row 2
        root.findViewById(R.id.actionRecords).setOnClickListener(v ->
                switchToTab(R.id.nav_records));

        root.findViewById(R.id.actionBilling).setOnClickListener(v ->
                Toast.makeText(requireContext(), "Billing & Payments: No pending dues", Toast.LENGTH_SHORT).show());

        root.findViewById(R.id.actionHealthPackages).setOnClickListener(v ->
                Toast.makeText(requireContext(), "Health Packages: Annual Checkup 20% OFF", Toast.LENGTH_SHORT).show());

        root.findViewById(R.id.actionFindHospital).setOnClickListener(v ->
                showEmergencyInfo());
    }

    private void switchToTab(int menuItemId) {
        if (getActivity() instanceof MainActivity) {
            MainActivity activity = (MainActivity) getActivity();
            if (menuItemId == R.id.nav_doctors) activity.selectTab(1);
            else if (menuItemId == R.id.nav_appointments) activity.selectTab(2);
            else if (menuItemId == R.id.nav_profile) activity.selectTab(3);
            else activity.selectTab(0);
        }
    }

    private void showEmergencyInfo() {
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
                        .setTitle("Hospital Location & Emergency")
                        .setMessage((settings.hospitalName != null ? settings.hospitalName : "Hospital") + " Emergency: " + hotline
                                + "\n\nLocation: Sector V, Salt Lake, Kolkata 700091")
                        .setPositiveButton("Close", null)
                        .show();
            } else if (resource.status == Resource.Status.ERROR) {
                loadingDialog.dismiss();
                new androidx.appcompat.app.AlertDialog.Builder(requireContext())
                        .setTitle("Emergency")
                        .setMessage("Couldn't load emergency contact info: " + resource.message)
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
        progressBar.setVisibility(View.GONE);
        tvError.setVisibility(View.GONE);

        departmentsViewModel.getDepartments().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            swipeRefresh.setRefreshing(false);
            if (resource.status == Resource.Status.SUCCESS && resource.data != null) {
                adapter.submitList(resource.data);
            }
        });

        appointmentsViewModel.getHistory().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null || resource.status != Resource.Status.SUCCESS || resource.data == null) return;
            Appointment next = findNextUpcoming(resource.data);
            if (next != null) {
                layoutUpcoming.setVisibility(View.VISIBLE);
                tvNoUpcoming.setVisibility(View.GONE);
                tvUpcomingDoctor.setText(next.getDoctorName());
                tvUpcomingDetails.setText(next.getAppointmentDate() + "  •  " + next.getAppointmentTime());
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
