package com.brainware.hospital.ui.appointments;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.AppointmentAdapter;
import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.ui.doctors.DoctorsByDepartmentActivity;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.viewmodel.AppointmentsViewModel;
import com.google.android.material.tabs.TabLayout;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class AppointmentsFragment extends Fragment {

    private static final List<String> UPCOMING_STATUSES = Arrays.asList("PENDING", "ACCEPTED");
    private static final List<String> PAST_STATUSES = Arrays.asList("COMPLETED", "CANCELLED", "REJECTED");

    private SwipeRefreshLayout swipeRefresh;
    private RecyclerView rvAppointments;
    private TabLayout tabLayout;
    private TextView tabUpcoming, tabPast, tvError, tvEmpty;
    private android.widget.ProgressBar progressBar;

    private AppointmentsViewModel viewModel;
    private AppointmentAdapter adapter;
    private List<Appointment> allAppointments = new ArrayList<>();
    private int selectedTab = 0;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_appointments, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        viewModel = new ViewModelProvider(this).get(AppointmentsViewModel.class);

        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        rvAppointments = view.findViewById(R.id.rvAppointments);
        tabLayout = view.findViewById(R.id.tabLayout);
        tabUpcoming = view.findViewById(R.id.tabUpcoming);
        tabPast = view.findViewById(R.id.tabPast);
        progressBar = view.findViewById(R.id.progressBar);
        tvError = view.findViewById(R.id.tvError);
        tvEmpty = view.findViewById(R.id.tvEmpty);

        View btnBack = view.findViewById(R.id.btnBack);
        if (btnBack != null) {
            btnBack.setOnClickListener(v -> requireActivity().onBackPressed());
        }

        View btnCta = view.findViewById(R.id.btnBookAppointmentCta);
        if (btnCta != null) {
            btnCta.setOnClickListener(v ->
                    startActivity(new Intent(requireContext(), DoctorsByDepartmentActivity.class)));
        }

        if (tabUpcoming != null && tabPast != null) {
            tabUpcoming.setOnClickListener(v -> setSegmentedTab(0));
            tabPast.setOnClickListener(v -> setSegmentedTab(1));
        }

        adapter = new AppointmentAdapter(appointment -> {
            Intent intent = new Intent(requireContext(), AppointmentDetailActivity.class);
            intent.putExtra(Constants.EXTRA_APPOINTMENT_JSON, appointment.toJson());
            startActivity(intent);
        });
        rvAppointments.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvAppointments.setAdapter(adapter);

        swipeRefresh.setOnRefreshListener(this::load);
        load();
    }

    private void setSegmentedTab(int index) {
        selectedTab = index;
        if (index == 0) {
            tabUpcoming.setBackgroundResource(R.drawable.bg_tile_card);
            tabUpcoming.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#1976D2")));
            tabUpcoming.setTextColor(Color.WHITE);

            tabPast.setBackgroundResource(R.drawable.bg_tile_card);
            tabPast.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#F5F5F5")));
            tabPast.setTextColor(Color.parseColor("#616161"));
        } else {
            tabPast.setBackgroundResource(R.drawable.bg_tile_card);
            tabPast.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#1976D2")));
            tabPast.setTextColor(Color.WHITE);

            tabUpcoming.setBackgroundResource(R.drawable.bg_tile_card);
            tabUpcoming.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#F5F5F5")));
            tabUpcoming.setTextColor(Color.parseColor("#616161"));
        }
        applyFilter();
    }

    @Override
    public void onResume() {
        super.onResume();
        load();
    }

    private void load() {
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);

        viewModel.getHistory().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            swipeRefresh.setRefreshing(false);
            switch (resource.status) {
                case LOADING:
                    break;
                case SUCCESS:
                    progressBar.setVisibility(View.GONE);
                    allAppointments = resource.data != null ? resource.data : new ArrayList<>();
                    applyFilter();
                    break;
                case ERROR:
                    progressBar.setVisibility(View.GONE);
                    tvError.setText(resource.message);
                    tvError.setVisibility(View.VISIBLE);
                    break;
            }
        });
    }

    private void applyFilter() {
        List<String> statuses = selectedTab == 0 ? UPCOMING_STATUSES : PAST_STATUSES;

        List<Appointment> filtered = new ArrayList<>();
        for (Appointment a : allAppointments) {
            if (statuses.contains(a.getStatus())) filtered.add(a);
        }

        adapter.submitList(filtered);
        tvEmpty.setVisibility(filtered.isEmpty() ? View.VISIBLE : View.GONE);
    }
}
