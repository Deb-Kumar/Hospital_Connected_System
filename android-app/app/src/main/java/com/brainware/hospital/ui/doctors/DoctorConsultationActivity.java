package com.brainware.hospital.ui.doctors;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.DoctorAdapter;
import com.brainware.hospital.model.Department;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.DepartmentsViewModel;
import com.brainware.hospital.viewmodel.DoctorsViewModel;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.List;

public class DoctorConsultationActivity extends AppCompatActivity {

    private SwipeRefreshLayout swipeRefresh;
    private EditText etSearch;
    private Spinner spinnerDepartment, spinnerExperience;
    private View btnResetFilter, progressBar;
    private RecyclerView rvDoctors;
    private TextView tvEmptyState;

    private DoctorsViewModel doctorsViewModel;
    private DepartmentsViewModel departmentsViewModel;
    private DoctorAdapter adapter;

    private final List<Doctor> allDoctorsList = new ArrayList<>();
    private final List<String> departmentOptions = new ArrayList<>();
    private final List<String> experienceOptions = new ArrayList<>();

    private ArrayAdapter<String> deptSpinnerAdapter;
    private ArrayAdapter<String> expSpinnerAdapter;

    private String selectedDepartment = "Specialty";
    private String selectedExperience = "Experience";
    private String searchQuery = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_doctor_consultation);

        String initialDept = getIntent().getStringExtra(Constants.EXTRA_DEPARTMENT_NAME);
        if (initialDept != null && !initialDept.trim().isEmpty()) {
            selectedDepartment = initialDept.trim();
        }

        doctorsViewModel = new ViewModelProvider(this).get(DoctorsViewModel.class);
        departmentsViewModel = new ViewModelProvider(this).get(DepartmentsViewModel.class);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        swipeRefresh = findViewById(R.id.swipeRefresh);
        etSearch = findViewById(R.id.etSearch);
        spinnerDepartment = findViewById(R.id.spinnerDepartment);
        spinnerExperience = findViewById(R.id.spinnerExperience);
        btnResetFilter = findViewById(R.id.btnResetFilter);
        rvDoctors = findViewById(R.id.rvDoctors);
        progressBar = findViewById(R.id.progressBar);
        tvEmptyState = findViewById(R.id.tvEmptyState);

        setupRecyclerView();
        setupSpinners();
        setupSearchListener();

        if (btnResetFilter != null) {
            btnResetFilter.setOnClickListener(v -> resetAllFilters());
        }

        swipeRefresh.setOnRefreshListener(this::loadData);
        loadData();
    }

    private void setupRecyclerView() {
        adapter = new DoctorAdapter(doctor -> {
            Intent intent = new Intent(this, DoctorProfileActivity.class);
            intent.putExtra(Constants.EXTRA_DOCTOR_JSON, new Gson().toJson(doctor));
            startActivity(intent);
        });
        rvDoctors.setLayoutManager(new LinearLayoutManager(this));
        rvDoctors.setAdapter(adapter);
    }

    private void setupSpinners() {
        // Department / Specialty Spinner
        departmentOptions.clear();
        departmentOptions.add("Specialty");

        deptSpinnerAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, departmentOptions);
        deptSpinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDepartment.setAdapter(deptSpinnerAdapter);

        spinnerDepartment.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedDepartment = departmentOptions.get(position);
                filterDoctors();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedDepartment = "Specialty";
                filterDoctors();
            }
        });

        // Experience Spinner
        experienceOptions.clear();
        experienceOptions.add("Experience");
        experienceOptions.add("3+ Years");
        experienceOptions.add("5+ Years");
        experienceOptions.add("10+ Years");

        expSpinnerAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, experienceOptions);
        expSpinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerExperience.setAdapter(expSpinnerAdapter);

        spinnerExperience.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedExperience = experienceOptions.get(position);
                filterDoctors();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedExperience = "Experience";
                filterDoctors();
            }
        });
    }

    private void setupSearchListener() {
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchQuery = s != null ? s.toString().trim().toLowerCase() : "";
                filterDoctors();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void resetAllFilters() {
        etSearch.setText("");
        searchQuery = "";
        selectedDepartment = "Specialty";
        selectedExperience = "Experience";

        spinnerDepartment.setSelection(0);
        spinnerExperience.setSelection(0);
        filterDoctors();
    }

    private void loadData() {
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
        tvEmptyState.setVisibility(View.GONE);
        rvDoctors.setVisibility(View.GONE);

        // Load all doctors
        doctorsViewModel.getDoctors().observe(this, resource -> {
            if (resource == null) return;
            swipeRefresh.setRefreshing(false);
            if (resource.status == Resource.Status.SUCCESS && resource.data != null) {
                if (progressBar != null) progressBar.setVisibility(View.GONE);
                allDoctorsList.clear();
                allDoctorsList.addAll(resource.data);
                filterDoctors();
            } else if (resource.status == Resource.Status.ERROR) {
                if (progressBar != null) progressBar.setVisibility(View.GONE);
                filterDoctors();
            }
        });

        // Load all 44 departments for dropdown filter
        departmentsViewModel.getDepartments().observe(this, resource -> {
            if (resource != null && resource.status == Resource.Status.SUCCESS && resource.data != null) {
                departmentOptions.clear();
                departmentOptions.add("Specialty");
                int initialIndex = 0;
                for (int i = 0; i < resource.data.size(); i++) {
                    Department d = resource.data.get(i);
                    if (d.getName() != null && !d.getName().trim().isEmpty()) {
                        String name = d.getName().trim();
                        departmentOptions.add(name);
                        if (selectedDepartment != null && selectedDepartment.equalsIgnoreCase(name)) {
                            initialIndex = departmentOptions.size() - 1;
                        }
                    }
                }
                deptSpinnerAdapter.notifyDataSetChanged();
                if (initialIndex > 0 && initialIndex < departmentOptions.size()) {
                    spinnerDepartment.setSelection(initialIndex);
                }
            }
        });
    }

    private void filterDoctors() {
        if (progressBar != null && progressBar.getVisibility() == View.VISIBLE) {
            tvEmptyState.setVisibility(View.GONE);
            rvDoctors.setVisibility(View.GONE);
            return;
        }

        List<Doctor> filtered = new ArrayList<>();

        for (Doctor d : allDoctorsList) {
            String name = d.getFullName() != null ? d.getFullName().toLowerCase() : "";
            String spec = d.getSpecialization() != null ? d.getSpecialization().toLowerCase() : "";
            String qual = d.getQualification() != null ? d.getQualification().toLowerCase() : "";
            String dept = d.getDepartmentName() != null ? d.getDepartmentName().toLowerCase() : "";
            String bio = d.getBio() != null ? d.getBio().toLowerCase() : "";

            boolean matchesDepartment = "Specialty".equalsIgnoreCase(selectedDepartment)
                    || "All Departments".equalsIgnoreCase(selectedDepartment)
                    || (d.getDepartmentName() != null && d.getDepartmentName().equalsIgnoreCase(selectedDepartment))
                    || (d.getSpecialization() != null && d.getSpecialization().equalsIgnoreCase(selectedDepartment));

            int expYears = d.getExperienceYears() > 0 ? d.getExperienceYears() : 8;
            boolean matchesExperience = true;
            if ("3+ Years".equalsIgnoreCase(selectedExperience)) {
                matchesExperience = expYears >= 3;
            } else if ("5+ Years".equalsIgnoreCase(selectedExperience)) {
                matchesExperience = expYears >= 5;
            } else if ("10+ Years".equalsIgnoreCase(selectedExperience)) {
                matchesExperience = expYears >= 10;
            }

            boolean matchesQuery = searchQuery.isEmpty()
                    || name.contains(searchQuery)
                    || spec.contains(searchQuery)
                    || qual.contains(searchQuery)
                    || dept.contains(searchQuery)
                    || bio.contains(searchQuery);

            if (matchesDepartment && matchesExperience && matchesQuery) {
                filtered.add(d);
            }
        }

        adapter.submitList(filtered);

        if (filtered.isEmpty()) {
            tvEmptyState.setVisibility(View.VISIBLE);
            rvDoctors.setVisibility(View.GONE);
        } else {
            tvEmptyState.setVisibility(View.GONE);
            rvDoctors.setVisibility(View.VISIBLE);
        }
    }
}
