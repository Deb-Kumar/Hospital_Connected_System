package com.brainware.hospital.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.CompoundButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.repository.AuthRepository;
import com.brainware.hospital.ui.auth.LoginActivity;
import com.brainware.hospital.viewmodel.AccountSettingsViewModel;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.switchmaterial.SwitchMaterial;
import com.google.android.material.textfield.TextInputEditText;

public class AccountSettingsActivity extends AppCompatActivity {

    private TextInputEditText etCurrentPassword, etNewPassword;
    private TextView tvPasswordError;
    private MaterialButton btnChangePassword, btnDeleteAccount;
    private SwitchMaterial switch2fa;
    private android.view.View progressBar;

    private AccountSettingsViewModel viewModel;
    private boolean suppressSwitchCallback = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_settings);

        viewModel = new ViewModelProvider(this).get(AccountSettingsViewModel.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        etCurrentPassword = findViewById(R.id.etCurrentPassword);
        etNewPassword = findViewById(R.id.etNewPassword);
        tvPasswordError = findViewById(R.id.tvPasswordError);
        btnChangePassword = findViewById(R.id.btnChangePassword);
        btnDeleteAccount = findViewById(R.id.btnDeleteAccount);
        switch2fa = findViewById(R.id.switch2fa);
        progressBar = findViewById(R.id.progressBar);

        btnChangePassword.setOnClickListener(v -> attemptChangePassword());
        btnDeleteAccount.setOnClickListener(v -> confirmDeleteAccount());
        switch2fa.setOnCheckedChangeListener(this::onToggle2FA);
    }

    private void attemptChangePassword() {
        tvPasswordError.setVisibility(View.GONE);
        String current = text(etCurrentPassword);
        String newPass = text(etNewPassword);

        if (TextUtils.isEmpty(current) || TextUtils.isEmpty(newPass)) {
            showPasswordError("Enter your current and new password.");
            return;
        }
        if (newPass.length() < 6) {
            showPasswordError("New password must be at least 6 characters.");
            return;
        }

        viewModel.changePassword(current, newPass).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    setLoading(true);
                    break;
                case SUCCESS:
                    setLoading(false);
                    etCurrentPassword.setText(null);
                    etNewPassword.setText(null);
                    Toast.makeText(this, "Password updated.", Toast.LENGTH_SHORT).show();
                    break;
                case ERROR:
                    setLoading(false);
                    showPasswordError(resource.message);
                    break;
            }
        });
    }

    private void onToggle2FA(CompoundButton button, boolean isChecked) {
        if (suppressSwitchCallback) return;

        viewModel.toggle2FA(isChecked).observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    break;
                case SUCCESS:
                    Toast.makeText(this, resource.data.message, Toast.LENGTH_SHORT).show();
                    // Reflect the server's authoritative state, in case it
                    // differs from what we optimistically set the switch to.
                    suppressSwitchCallback = true;
                    switch2fa.setChecked(resource.data.twoFactorEnabled);
                    suppressSwitchCallback = false;
                    break;
                case ERROR:
                    Toast.makeText(this, resource.message, Toast.LENGTH_LONG).show();
                    suppressSwitchCallback = true;
                    switch2fa.setChecked(!isChecked); // revert on failure
                    suppressSwitchCallback = false;
                    break;
            }
        });
    }

    private void confirmDeleteAccount() {
        new AlertDialog.Builder(this)
                .setTitle("Delete your account?")
                .setMessage("This permanently deletes your profile, appointment history, and medical records. This can't be undone.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Delete Permanently", (dialog, which) -> performDelete())
                .show();
    }

    private void performDelete() {
        viewModel.deleteAccount().observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    setLoading(true);
                    break;
                case SUCCESS:
                    setLoading(false);
                    new AuthRepository(this).logout();
                    Toast.makeText(this, "Your account has been deleted.", Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    break;
                case ERROR:
                    setLoading(false);
                    Toast.makeText(this, resource.message, Toast.LENGTH_LONG).show();
                    break;
            }
        });
    }

    private void showPasswordError(String message) {
        tvPasswordError.setText(message);
        tvPasswordError.setVisibility(View.VISIBLE);
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnChangePassword.setEnabled(!loading);
        btnDeleteAccount.setEnabled(!loading);
    }

    private String text(TextInputEditText et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }
}
