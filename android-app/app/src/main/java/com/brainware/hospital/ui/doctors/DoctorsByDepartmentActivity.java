package com.brainware.hospital.ui.doctors;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.brainware.hospital.utils.Constants;

public class DoctorsByDepartmentActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Intent intent = new Intent(this, DoctorConsultationActivity.class);
        String deptName = getIntent().getStringExtra(Constants.EXTRA_DEPARTMENT_NAME);
        if (deptName != null && !deptName.trim().isEmpty()) {
            intent.putExtra(Constants.EXTRA_DEPARTMENT_NAME, deptName.trim());
        }
        startActivity(intent);
        finish();
    }
}
