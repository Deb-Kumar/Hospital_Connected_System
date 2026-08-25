package com.brainware.hospital.ui.departments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.DepartmentAdapter;
import com.brainware.hospital.ui.doctors.DoctorsByDepartmentActivity;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.viewmodel.DepartmentsViewModel;

public class DoctorsTabFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private RecyclerView rvDepartments;
    private android.widget.ProgressBar progressBar;
    private android.widget.TextView tvError;

    private DepartmentsViewModel viewModel;
    private DepartmentAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_doctors_tab, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        viewModel = new ViewModelProvider(this).get(DepartmentsViewModel.class);

        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        rvDepartments = view.findViewById(R.id.rvDepartments);
        progressBar = view.findViewById(R.id.progressBar);
        tvError = view.findViewById(R.id.tvError);

        adapter = new DepartmentAdapter(department -> {
            Intent intent = new Intent(requireContext(), DoctorsByDepartmentActivity.class);
            intent.putExtra(Constants.EXTRA_DEPARTMENT_ID, department.getId());
            intent.putExtra(Constants.EXTRA_DEPARTMENT_NAME, department.getName());
            startActivity(intent);
        });
        rvDepartments.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvDepartments.setAdapter(adapter);

        view.findViewById(R.id.tvViewAll).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), DoctorsByDepartmentActivity.class)));

        swipeRefresh.setOnRefreshListener(this::load);
        load();
    }

    private void load() {
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);

        viewModel.getDepartments().observe(getViewLifecycleOwner(), resource -> {
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
    }
}
