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
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.AppointmentAdapter;
import com.brainware.hospital.model.Appointment;
import com.brainware.hospital.ui.booking.BookAppointmentModalDialog;
import com.brainware.hospital.ui.main.MainActivity;
import com.brainware.hospital.ui.view.MortarLoaderView;
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
    private TextView tabUpcoming, tabPast, tvError;
    private CardView cardEmptyState;
    private MortarLoaderView mortarLoader;

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
        mortarLoader = view.findViewById(R.id.mortarLoader);
        cardEmptyState = view.findViewById(R.id.cardEmptyState);
        tvError = view.findViewById(R.id.tvError);

        View btnBack = view.findViewById(R.id.btnBack);
        if (btnBack != null) {
            btnBack.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).selectTab(0);
                } else {
                    requireActivity().onBackPressed();
                }
            });
        }

        View btnCta = view.findViewById(R.id.btnBookAppointmentCta);
        if (btnCta != null) {
            btnCta.setOnClickListener(v -> {
                BookAppointmentModalDialog dialog = BookAppointmentModalDialog.newInstance();
                dialog.show(getChildFragmentManager(), "BookAppointmentModalDialog");
            });
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
        if (mortarLoader != null) mortarLoader.setVisibility(View.VISIBLE);
        if (tvError != null) tvError.setVisibility(View.GONE);

        viewModel.getHistory().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            swipeRefresh.setRefreshing(false);
            switch (resource.status) {
                case LOADING:
                    break;
                case SUCCESS:
                    if (mortarLoader != null) mortarLoader.setVisibility(View.GONE);
                    allAppointments = resource.data != null ? resource.data : new ArrayList<>();
                    applyFilter();
                    break;
                case ERROR:
                    if (mortarLoader != null) mortarLoader.setVisibility(View.GONE);
                    if (tvError != null) {
                        tvError.setText(resource.message);
                        tvError.setVisibility(View.VISIBLE);
                    }
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

        if (filtered.isEmpty()) {
            if (rvAppointments != null) rvAppointments.setVisibility(View.GONE);
            if (cardEmptyState != null) cardEmptyState.setVisibility(View.VISIBLE);
        } else {
            if (rvAppointments != null) rvAppointments.setVisibility(View.VISIBLE);
            if (cardEmptyState != null) cardEmptyState.setVisibility(View.GONE);
        }
    }
}
