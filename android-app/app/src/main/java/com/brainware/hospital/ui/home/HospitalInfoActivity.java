package com.brainware.hospital.ui.home;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.brainware.hospital.R;

public class HospitalInfoActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hospital_info);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
    }
}
