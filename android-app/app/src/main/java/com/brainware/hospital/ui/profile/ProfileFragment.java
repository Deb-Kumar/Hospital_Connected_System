package com.brainware.hospital.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Patient;
import com.brainware.hospital.repository.AuthRepository;
import com.brainware.hospital.ui.main.MainActivity;
import com.brainware.hospital.ui.auth.LoginActivity;
import com.brainware.hospital.viewmodel.ProfileViewModel;

public class ProfileFragment extends Fragment {

    private TextView tvName, tvPatientId, tvError;
    private View progressBar;

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
        tvError = view.findViewById(R.id.tvError);
        progressBar = view.findViewById(R.id.progressBar);

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


        // Menu click listeners matching Blueprint Screen 12
        view.findViewById(R.id.menuPersonal).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), EditProfileActivity.class)));

        view.findViewById(R.id.menuMedical).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), DigitalIdActivity.class)));

        view.findViewById(R.id.menuInsurance).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), FamilyMembersActivity.class)));

        view.findViewById(R.id.menuAddresses).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), AccountSettingsActivity.class)));

        view.findViewById(R.id.menuPaymentMethods).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), BillingActivity.class)));

        view.findViewById(R.id.menuNotifications).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), com.brainware.hospital.ui.home.NotificationsActivity.class)));

        view.findViewById(R.id.menuPrivacy).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), AccountSettingsActivity.class)));

        view.findViewById(R.id.menuHelp).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), com.brainware.hospital.ui.home.HospitalInfoActivity.class)));

        view.findViewById(R.id.btnLogout).setOnClickListener(v -> confirmLogout());

        load();
    }

    @Override
    public void onResume() {
        super.onResume();
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
        if (patient == null) return;
        if (patient.getFullName() != null && !patient.getFullName().isEmpty()) {
            tvName.setText(patient.getFullName());
        } else {
            tvName.setText("Debkumar Payra");
        }
        tvPatientId.setText("Patient ID: PAT125609");
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
