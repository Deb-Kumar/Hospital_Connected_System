package com.brainware.hospital.ui.profile;

import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Patient;
import com.brainware.hospital.viewmodel.ProfileViewModel;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

public class DigitalIdActivity extends AppCompatActivity {

    private ImageView ivQrCode;
    private TextView tvName, tvPatientId, tvBloodGroup, tvError;
    private android.view.View progressBar;

    private ProfileViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_digital_id);

        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        ivQrCode = findViewById(R.id.ivQrCode);
        tvName = findViewById(R.id.tvName);
        tvPatientId = findViewById(R.id.tvPatientId);
        tvBloodGroup = findViewById(R.id.tvBloodGroup);
        tvError = findViewById(R.id.tvError);
        progressBar = findViewById(R.id.progressBar);

        load();
    }

    private void load() {
        progressBar.setVisibility(View.VISIBLE);
        viewModel.getProfile().observe(this, resource -> {
            if (resource == null) return;
            switch (resource.status) {
                case LOADING:
                    break;
                case SUCCESS:
                    progressBar.setVisibility(View.GONE);
                    bind(resource.data);
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
        tvPatientId.setText("Patient ID: " + patient.getId());
        tvBloodGroup.setText("Blood Group: " + (patient.getBloodGroup() != null ? patient.getBloodGroup() : "Not set"));

        // The QR payload is intentionally just an opaque lookup identifier
        // (qrCodeId if the backend assigned one, otherwise the patient's own
        // record id) — never the JWT, password, or any medical history. Staff
        // scan this and look the patient up server-side; nothing sensitive
        // is embedded in the code itself.
        String payload = patient.getQrCodeId() != null && !patient.getQrCodeId().isEmpty()
                ? patient.getQrCodeId() : patient.getId();

        Bitmap qrBitmap = generateQrCode(payload, 600);
        if (qrBitmap != null) {
            ivQrCode.setImageBitmap(qrBitmap);
        }
    }

    private Bitmap generateQrCode(String content, int size) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size);
            Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565);
            for (int x = 0; x < size; x++) {
                for (int y = 0; y < size; y++) {
                    bitmap.setPixel(x, y, matrix.get(x, y) ? Color.BLACK : Color.WHITE);
                }
            }
            return bitmap;
        } catch (WriterException e) {
            return null;
        }
    }
}
