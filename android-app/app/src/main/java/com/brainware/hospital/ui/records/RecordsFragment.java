package com.brainware.hospital.ui.records;

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
import com.brainware.hospital.adapter.RecordAdapter;
import com.brainware.hospital.viewmodel.RecordsViewModel;

public class RecordsFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private RecyclerView rvRecords;
    private android.widget.ProgressBar progressBar;
    private TextView tvError, tvEmpty, tabAllRecords, tabLabReports, tabImaging;

    private RecordsViewModel viewModel;
    private RecordAdapter adapter;
    private int selectedTab = 0;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_records, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        viewModel = new ViewModelProvider(this).get(RecordsViewModel.class);

        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        rvRecords = view.findViewById(R.id.rvRecords);
        progressBar = view.findViewById(R.id.progressBar);
        tvError = view.findViewById(R.id.tvError);
        tvEmpty = view.findViewById(R.id.tvEmpty);

        tabAllRecords = view.findViewById(R.id.tabAllRecords);
        tabLabReports = view.findViewById(R.id.tabLabReports);
        tabImaging = view.findViewById(R.id.tabImaging);

        View btnBack = view.findViewById(R.id.btnBack);
        if (btnBack != null) {
            btnBack.setOnClickListener(v -> requireActivity().onBackPressed());
        }

        View btnRequest = view.findViewById(R.id.btnRequestRecordCta);
        if (btnRequest != null) {
            btnRequest.setOnClickListener(v -> startActivity(new Intent(requireContext(), AddRecordActivity.class)));
        }

        if (tabAllRecords != null) tabAllRecords.setOnClickListener(v -> selectCategoryTab(0));
        if (tabLabReports != null) tabLabReports.setOnClickListener(v -> selectCategoryTab(1));
        if (tabImaging != null) tabImaging.setOnClickListener(v -> selectCategoryTab(2));

        adapter = new RecordAdapter();
        rvRecords.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvRecords.setAdapter(adapter);

        swipeRefresh.setOnRefreshListener(this::load);
        load();
    }

    private void selectCategoryTab(int index) {
        selectedTab = index;
        resetTabPills();
        if (index == 0) {
            tabAllRecords.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#1976D2")));
            tabAllRecords.setTextColor(Color.WHITE);
        } else if (index == 1) {
            tabLabReports.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#1976D2")));
            tabLabReports.setTextColor(Color.WHITE);
        } else {
            tabImaging.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#1976D2")));
            tabImaging.setTextColor(Color.WHITE);
        }
    }

    private void resetTabPills() {
        if (tabAllRecords != null) {
            tabAllRecords.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#F5F5F5")));
            tabAllRecords.setTextColor(Color.parseColor("#616161"));
        }
        if (tabLabReports != null) {
            tabLabReports.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#F5F5F5")));
            tabLabReports.setTextColor(Color.parseColor("#616161"));
        }
        if (tabImaging != null) {
            tabImaging.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#F5F5F5")));
            tabImaging.setTextColor(Color.parseColor("#616161"));
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        load();
    }

    private void load() {
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);
        tvEmpty.setVisibility(View.GONE);

        viewModel.getRecords().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            swipeRefresh.setRefreshing(false);
            switch (resource.status) {
                case LOADING:
                    break;
                case SUCCESS:
                    progressBar.setVisibility(View.GONE);
                    adapter.submitList(resource.data);
                    tvEmpty.setVisibility(resource.data == null || resource.data.isEmpty() ? View.VISIBLE : View.GONE);
                    break;
                case ERROR:
                    progressBar.setVisibility(View.GONE);
                    tvError.setText(resource.message);
                    tvError.setVisibility(View.VISIBLE);
                    break;
            }
        });
    }
}
