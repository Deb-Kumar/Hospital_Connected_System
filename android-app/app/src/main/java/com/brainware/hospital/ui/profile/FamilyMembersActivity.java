package com.brainware.hospital.ui.profile;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.FamilyMemberAdapter;
import com.brainware.hospital.model.dto.FamilyMemberRequest;
import com.brainware.hospital.viewmodel.FamilyMembersViewModel;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.textfield.TextInputEditText;

public class FamilyMembersActivity extends AppCompatActivity {

    private SwipeRefreshLayout swipeRefresh;
    private RecyclerView rvFamilyMembers;
    private android.widget.ProgressBar progressBar;
    private android.widget.TextView tvError, tvEmpty;

    private FamilyMembersViewModel viewModel;
    private FamilyMemberAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_family_members);

        viewModel = new ViewModelProvider(this).get(FamilyMembersViewModel.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        swipeRefresh = findViewById(R.id.swipeRefresh);
        rvFamilyMembers = findViewById(R.id.rvFamilyMembers);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);
        tvEmpty = findViewById(R.id.tvEmpty);

        adapter = new FamilyMemberAdapter();
        rvFamilyMembers.setLayoutManager(new LinearLayoutManager(this));
        rvFamilyMembers.setAdapter(adapter);

        FloatingActionButton fab = findViewById(R.id.fabAdd);
        fab.setOnClickListener(v -> showAddDialog());

        swipeRefresh.setOnRefreshListener(this::load);
        load();
    }

    private void load() {
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);
        tvEmpty.setVisibility(View.GONE);

        viewModel.getFamilyMembers().observe(this, resource -> {
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

    private void showAddDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_add_family_member, null);
        TextInputEditText etFullName = dialogView.findViewById(R.id.etFullName);
        TextInputEditText etRelation = dialogView.findViewById(R.id.etRelation);
        TextInputEditText etPhone = dialogView.findViewById(R.id.etPhone);
        TextInputEditText etEmail = dialogView.findViewById(R.id.etEmail);
        TextInputEditText etPassword = dialogView.findViewById(R.id.etPassword);
        android.widget.TextView tvDialogError = dialogView.findViewById(R.id.tvDialogError);

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle("Add Family Member")
                .setView(dialogView)
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Add", null) // overridden below to prevent auto-dismiss on error
                .create();

        dialog.setOnShowListener(d -> {
            android.widget.Button addButton = dialog.getButton(AlertDialog.BUTTON_POSITIVE);
            addButton.setOnClickListener(v -> {
                String fullName = text(etFullName);
                String relation = text(etRelation);
                String phone = text(etPhone);
                String email = text(etEmail);
                String password = text(etPassword);

                tvDialogError.setVisibility(View.GONE);

                if (TextUtils.isEmpty(fullName)) {
                    tvDialogError.setText("Full name is required.");
                    tvDialogError.setVisibility(View.VISIBLE);
                    return;
                }
                if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                    tvDialogError.setText("Enter a valid email address.");
                    tvDialogError.setVisibility(View.VISIBLE);
                    return;
                }
                if (TextUtils.isEmpty(phone) || phone.length() < 10) {
                    tvDialogError.setText("Enter a valid phone number.");
                    tvDialogError.setVisibility(View.VISIBLE);
                    return;
                }
                if (TextUtils.isEmpty(password) || password.length() < 6) {
                    tvDialogError.setText("Password must be at least 6 characters.");
                    tvDialogError.setVisibility(View.VISIBLE);
                    return;
                }

                FamilyMemberRequest req = new FamilyMemberRequest();
                req.fullName = fullName;
                req.relation = relation;
                req.phone = phone;
                req.email = email;
                req.password = password;

                addButton.setEnabled(false);
                viewModel.addFamilyMember(req).observe(this, resource -> {
                    if (resource == null) return;
                    switch (resource.status) {
                        case LOADING:
                            break;
                        case SUCCESS:
                            addButton.setEnabled(true);
                            Toast.makeText(this, "Family member added.", Toast.LENGTH_SHORT).show();
                            dialog.dismiss();
                            load();
                            break;
                        case ERROR:
                            addButton.setEnabled(true);
                            tvDialogError.setText(resource.message);
                            tvDialogError.setVisibility(View.VISIBLE);
                            break;
                    }
                });
            });
        });

        dialog.show();
    }

    private String text(TextInputEditText et) {
        return et.getText() == null ? "" : et.getText().toString().trim();
    }
}
