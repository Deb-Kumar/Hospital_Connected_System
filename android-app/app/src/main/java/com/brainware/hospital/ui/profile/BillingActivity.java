package com.brainware.hospital.ui.profile;

import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.brainware.hospital.R;

public class BillingActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_billing);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        findViewById(R.id.btnPayNow).setOnClickListener(v ->
                Toast.makeText(this, "Opening secure Razorpay / UPI Gateway for ₹1,250...", Toast.LENGTH_LONG).show());
    }
}
