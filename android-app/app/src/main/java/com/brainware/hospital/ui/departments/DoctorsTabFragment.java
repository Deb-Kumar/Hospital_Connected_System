package com.brainware.hospital.ui.departments;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.DoctorAdapter;
import com.brainware.hospital.model.Department;
import com.brainware.hospital.model.Doctor;
import com.brainware.hospital.ui.doctors.DoctorProfileActivity;
import com.brainware.hospital.ui.main.MainActivity;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.DepartmentsViewModel;
import com.brainware.hospital.viewmodel.DoctorsViewModel;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.List;

public class DoctorsTabFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private EditText etSearchDept;
    private Spinner spinnerDepartment;
    private RecyclerView rvDoctors;
    private View progressBar;
    private TextView tvDoctorCount, tvEmptyState, tvError;

    private DoctorsViewModel doctorsViewModel;
    private DepartmentsViewModel departmentsViewModel;
    private DoctorAdapter adapter;

    private final List<Doctor> allDoctorsList = new ArrayList<>();
    private final List<String> departmentOptions = new ArrayList<>();
    private ArrayAdapter<String> spinnerAdapter;

    private String selectedDepartment = "All Departments";
    private String searchQuery = "";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_doctors_tab, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        doctorsViewModel = new ViewModelProvider(this).get(DoctorsViewModel.class);
        departmentsViewModel = new ViewModelProvider(this).get(DepartmentsViewModel.class);

        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        etSearchDept = view.findViewById(R.id.etSearchDept);
        spinnerDepartment = view.findViewById(R.id.spinnerDepartment);
        rvDoctors = view.findViewById(R.id.rvDoctors);
        progressBar = view.findViewById(R.id.progressBar);
        tvDoctorCount = view.findViewById(R.id.tvDoctorCount);
        tvEmptyState = view.findViewById(R.id.tvEmptyState);
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

        setupRecyclerView();
        setupSpinner();
        setupSearchListener();

        swipeRefresh.setOnRefreshListener(this::load);
        load();
    }

    private void setupRecyclerView() {
        adapter = new DoctorAdapter(doctor -> {
            Intent intent = new Intent(requireContext(), DoctorProfileActivity.class);
            intent.putExtra(Constants.EXTRA_DOCTOR_JSON, new Gson().toJson(doctor));
            startActivity(intent);
        });
        rvDoctors.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvDoctors.setAdapter(adapter);
    }

    private void setupSpinner() {
        departmentOptions.clear();
        departmentOptions.add("All Departments");

        spinnerAdapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_item, departmentOptions);
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDepartment.setAdapter(spinnerAdapter);

        spinnerDepartment.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedDepartment = departmentOptions.get(position);
                filterDoctors();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedDepartment = "All Departments";
                filterDoctors();
            }
        });
    }

    private void setupSearchListener() {
        if (etSearchDept != null) {
            etSearchDept.addTextChangedListener(new TextWatcher() {
                @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
                @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                    searchQuery = s != null ? s.toString().trim().toLowerCase() : "";
                    filterDoctors();
                }
                @Override public void afterTextChanged(Editable s) {}
            });
        }
    }

    private void load() {
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);

        // Fetch Doctors
        doctorsViewModel.getDoctors().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            swipeRefresh.setRefreshing(false);
            if (resource.status == Resource.Status.SUCCESS && resource.data != null) {
                progressBar.setVisibility(View.GONE);
                allDoctorsList.clear();
                allDoctorsList.addAll(resource.data);
                filterDoctors();
            } else if (resource.status == Resource.Status.ERROR) {
                progressBar.setVisibility(View.GONE);
                if (tvError != null) {
                    tvError.setText(resource.message);
                    tvError.setVisibility(View.VISIBLE);
                }
            }
        });

        // Fetch 44 Departments for Dropdown Filter
        departmentsViewModel.getDepartments().observe(getViewLifecycleOwner(), resource -> {
            if (resource != null && resource.status == Resource.Status.SUCCESS && resource.data != null) {
                departmentOptions.clear();
                departmentOptions.add("All Departments");
                for (Department d : resource.data) {
                    if (d.getName() != null && !d.getName().trim().isEmpty()) {
                        departmentOptions.add(d.getName().trim());
                    }
                }
                spinnerAdapter.notifyDataSetChanged();
            }
        });
    }

    private void filterDoctors() {
        List<Doctor> filtered = new ArrayList<>();

        for (Doctor d : allDoctorsList) {
            String name = d.getFullName() != null ? d.getFullName().toLowerCase() : "";
            String spec = d.getSpecialization() != null ? d.getSpecialization().toLowerCase() : "";
            String qual = d.getQualification() != null ? d.getQualification().toLowerCase() : "";
            String dept = d.getDepartmentName() != null ? d.getDepartmentName().toLowerCase() : "";
            String bio = d.getBio() != null ? d.getBio().toLowerCase() : "";

            boolean matchesDepartment = "All Departments".equalsIgnoreCase(selectedDepartment)
                    || (d.getDepartmentName() != null && d.getDepartmentName().equalsIgnoreCase(selectedDepartment))
                    || (d.getSpecialization() != null && d.getSpecialization().equalsIgnoreCase(selectedDepartment));

            boolean matchesQuery = searchQuery.isEmpty()
                    || name.contains(searchQuery)
                    || spec.contains(searchQuery)
                    || qual.contains(searchQuery)
                    || dept.contains(searchQuery)
                    || bio.contains(searchQuery);

            if (matchesDepartment && matchesQuery) {
                filtered.add(d);
            }
        }

        adapter.submitList(filtered);

        if (filtered.isEmpty()) {
            if (tvEmptyState != null) tvEmptyState.setVisibility(View.VISIBLE);
            rvDoctors.setVisibility(View.GONE);
            if (tvDoctorCount != null) tvDoctorCount.setText("0 Doctors Found");
        } else {
            if (tvEmptyState != null) tvEmptyState.setVisibility(View.GONE);
            rvDoctors.setVisibility(View.VISIBLE);
            if (tvDoctorCount != null) tvDoctorCount.setText("Showing " + filtered.size() + " of " + allDoctorsList.size() + " Doctors");
        }
    }
}
