package com.brainware.hospital.ui.records;

import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.brainware.hospital.R;

public class PrescriptionsActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prescriptions);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        findViewById(R.id.btnDownloadPrescription).setOnClickListener(v ->
                Toast.makeText(this, "Downloading official prescription PDF...", Toast.LENGTH_LONG).show());
    }
}
