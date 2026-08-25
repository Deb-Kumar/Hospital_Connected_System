package com.brainware.hospital.ui.doctors;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.DoctorAdapter;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.DoctorsViewModel;
import com.google.android.material.appbar.MaterialToolbar;

import java.util.List;

public class DoctorsByDepartmentActivity extends AppCompatActivity {

    private SwipeRefreshLayout swipeRefresh;
    private RecyclerView rvDoctors;
    private android.widget.ProgressBar progressBar;
    private android.widget.TextView tvError, tvEmpty;

    private DoctorsViewModel viewModel;
    private DoctorAdapter adapter;
    private String departmentId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_doctors_list);

        departmentId = getIntent().getStringExtra(Constants.EXTRA_DEPARTMENT_ID);
        String departmentName = getIntent().getStringExtra(Constants.EXTRA_DEPARTMENT_NAME);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setTitle(departmentName != null ? departmentName : "All Doctors");
        toolbar.setNavigationOnClickListener(v -> finish());

        viewModel = new ViewModelProvider(this).get(DoctorsViewModel.class);

        swipeRefresh = findViewById(R.id.swipeRefresh);
        rvDoctors = findViewById(R.id.rvDoctors);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);
        tvEmpty = findViewById(R.id.tvEmpty);

        adapter = new DoctorAdapter(doctor -> {
            Intent intent = new Intent(this, DoctorProfileActivity.class);
            intent.putExtra(Constants.EXTRA_DOCTOR_JSON, new com.google.gson.Gson().toJson(doctor));
            startActivity(intent);
        });
        rvDoctors.setLayoutManager(new LinearLayoutManager(this));
        rvDoctors.setAdapter(adapter);

        swipeRefresh.setOnRefreshListener(this::load);
        load();
    }

    private void load() {
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);
        tvEmpty.setVisibility(View.GONE);

        androidx.lifecycle.LiveData<Resource<List<Doctor>>> liveData = departmentId != null
                ? viewModel.getDoctorsByDepartment(departmentId)
                : viewModel.getAllDoctors();

        liveData.observe(this, resource -> {
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
