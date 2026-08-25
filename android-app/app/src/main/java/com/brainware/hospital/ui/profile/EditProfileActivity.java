package com.brainware.hospital.ui.profile;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Patient;
import com.brainware.hospital.viewmodel.ProfileViewModel;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.util.HashMap;
import java.util.Map;

public class EditProfileActivity extends AppCompatActivity {

    private TextInputEditText etFullName, etPhone, etAge, etAddress, etEmergencyContact, etAllergies, etChronicConditions;
    private AutoCompleteTextView etBloodGroup;
    private MaterialButton btnSave;
    private android.widget.ProgressBar progressBar;
    private android.widget.TextView tvError;

    private ProfileViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_profile);

        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        etFullName = findViewById(R.id.etFullName);
        etPhone = findViewById(R.id.etPhone);
        etAge = findViewById(R.id.etAge);
        etBloodGroup = findViewById(R.id.etBloodGroup);
        etAddress = findViewById(R.id.etAddress);
        etEmergencyContact = findViewById(R.id.etEmergencyContact);
        etAllergies = findViewById(R.id.etAllergies);
        etChronicConditions = findViewById(R.id.etChronicConditions);
        btnSave = findViewById(R.id.btnSave);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);

        etBloodGroup.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_list_item_1,
                getResources().getStringArray(R.array.blood_groups)));

        btnSave.setOnClickListener(v -> save());

        loadCurrentProfile();
    }

    private void loadCurrentProfile() {
        progressBar.setVisibility(View.VISIBLE);
        viewModel.getProfile().observe(this, resource -> {
            if (resource == null) return;
            if (resource.status == com.brainware.hospital.utils.Resource.Status.SUCCESS) {
                progressBar.setVisibility(View.GONE);
                prefill(resource.data);
            } else if (resource.status == com.brainware.hospital.utils.Resource.Status.ERROR) {
                progressBar.setVisibility(View.GONE);
                showError(resource.message);
            }
        });
    }

    private void prefill(Patient patient) {
        etFullName.setText(patient.getFullName());
        etPhone.setText(patient.getPhone());
        if (patient.getAge() != null) etAge.setText(String.valueOf(patient.getAge()));
        if (patient.getBloodGroup() != null) etBloodGroup.setText(patient.getBloodGroup(), false);
        etAddress.setText(patient.getAddress());
        etEmergencyContact.setText(patient.getEmergencyContact());
        etAllergies.setText(patient.getAllergies());
        etChronicConditions.setText(patient.getChronicConditions());
    }

    private void save() {
        tvError.setVisibility(View.GONE);
        String fullName = text(etFullName);

        if (TextUtils.isEmpty(fullName)) {
            showError("Full name can't be empty.");
            return;
        }

        Map<String, Object> fields = new HashMap<>();
        fields.put("fullName", fullName);
        fields.put("phone", text(etPhone));
        String ageText = text(etAge);
        if (!TextUtils.isEmpty(ageText)) {
            try {
                fields.put("age", Integer.parseInt(ageText));
            } catch (NumberFormatException ignored) {
                // skip invalid age rather than block the whole save
            }
        }
        fields.put("bloodGroup", text(etBloodGroup));
        fields.put("address", text(etAddress));
        fields.put("emergencyContact", text(etEmergencyContact));
        fields.put("allergies", text(etAllergies));
        fields.put("chronicConditions", text(etChronicConditions));

        viewModel.updateProfile(fields).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    setLoading(true);
                    break;
                case SUCCESS:
                    setLoading(false);
                    Toast.makeText(this, "Profile updated.", Toast.LENGTH_SHORT).show();
                    finish();
                    break;
                case ERROR:
                    setLoading(false);
                    showError(resource.message);
                    break;
            }
        });
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnSave.setEnabled(!loading);
    }

    private String text(TextInputEditText et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }

    private String text(AutoCompleteTextView et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }
}
