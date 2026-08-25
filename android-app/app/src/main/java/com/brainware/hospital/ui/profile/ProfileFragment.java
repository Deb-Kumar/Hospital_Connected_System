package com.brainware.hospital.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Patient;
import com.brainware.hospital.repository.AuthRepository;
import com.brainware.hospital.ui.auth.LoginActivity;
import com.brainware.hospital.viewmodel.ProfileViewModel;

public class ProfileFragment extends Fragment {

    private TextView tvName, tvPatientId, tvEmail, tvPhone, tvBloodGroup, tvAge, tvAllergies, tvError;
    private android.widget.ProgressBar progressBar;

    private ProfileViewModel viewModel;
    private Patient currentPatient;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        tvName = view.findViewById(R.id.tvName);
        tvPatientId = view.findViewById(R.id.tvPatientId);
        tvEmail = view.findViewById(R.id.tvEmail);
        tvPhone = view.findViewById(R.id.tvPhone);
        tvBloodGroup = view.findViewById(R.id.tvBloodGroup);
        tvAge = view.findViewById(R.id.tvAge);
        tvAllergies = view.findViewById(R.id.tvAllergies);
        tvError = view.findViewById(R.id.tvError);
        progressBar = view.findViewById(R.id.progressBar);

        view.findViewById(R.id.btnEditProfile).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), EditProfileActivity.class)));

        view.findViewById(R.id.btnDigitalId).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), DigitalIdActivity.class)));

        view.findViewById(R.id.btnFamilyMembers).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), FamilyMembersActivity.class)));

        view.findViewById(R.id.btnAccountSettings).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), AccountSettingsActivity.class)));

        view.findViewById(R.id.btnLogout).setOnClickListener(v -> confirmLogout());

        load();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Profile may have just been edited.
        load();
    }

    private void load() {
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);

        viewModel.getProfile().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    break;
                case SUCCESS:
                    progressBar.setVisibility(View.GONE);
                    currentPatient = resource.data;
                    bind(currentPatient);
                    break;
                case ERROR:
                    progressBar.setVisibility(View.GONE);
                    tvError.setText(resource.message);
                    tvError.setVisibility(View.VISIBLE);
                    break;
            }
        });
    }

    private void bind(Patient patient) {
        tvName.setText(patient.getFullName());
        tvPatientId.setText("Patient ID: " + shortId(patient.getId()));
        tvEmail.setText(patient.getEmail());
        tvPhone.setText(patient.getPhone() != null ? patient.getPhone() : "Not provided");
        tvBloodGroup.setText("Blood Group: " + orNotSet(patient.getBloodGroup()));
        tvAge.setText("Age: " + (patient.getAge() != null ? patient.getAge() : "Not set"));
        tvAllergies.setText("Allergies: " + orDefault(patient.getAllergies(), "None reported"));
    }

    private String shortId(String id) {
        if (id == null) return "";
        return id.length() > 10 ? id.substring(0, 10) + "…" : id;
    }

    private String orNotSet(String value) {
        return orDefault(value, "Not set");
    }

    private String orDefault(String value, String fallback) {
        return (value == null || value.trim().isEmpty()) ? fallback : value;
    }

    private void confirmLogout() {
        new AlertDialog.Builder(requireContext())
                .setTitle("Log out?")
                .setMessage("You'll need to log in again to book or view appointments.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Log Out", (dialog, which) -> {
                    new AuthRepository(requireContext()).logout();
                    Intent intent = new Intent(requireContext(), LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                })
                .show();
    }
}
