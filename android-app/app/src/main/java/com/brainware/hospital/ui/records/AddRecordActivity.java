package com.brainware.hospital.ui.records;

import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.text.TextUtils;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.brainware.hospital.R;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.RecordsViewModel;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

public class AddRecordActivity extends AppCompatActivity {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // matches backend multer limit

    private TextInputEditText etTitle;
    private AutoCompleteTextView etRecordType;
    private MaterialButton btnPickFile, btnUpload;
    private TextView tvFileName, tvError;
    private android.widget.ProgressBar progressBar;

    private RecordsViewModel viewModel;
    private Uri pickedUri;
    private String pickedFileName;
    private String pickedMimeType;

    private final ActivityResultLauncher<String> filePicker =
            registerForActivityResult(new ActivityResultContracts.GetContent(), this::onFilePicked);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_record);

        viewModel = new ViewModelProvider(this).get(RecordsViewModel.class);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        etTitle = findViewById(R.id.etTitle);
        etRecordType = findViewById(R.id.etRecordType);
        btnPickFile = findViewById(R.id.btnPickFile);
        btnUpload = findViewById(R.id.btnUpload);
        tvFileName = findViewById(R.id.tvFileName);
        tvError = findViewById(R.id.tvError);
        progressBar = findViewById(R.id.progressBar);

        etRecordType.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_list_item_1,
                getResources().getStringArray(R.array.record_types)));
        etRecordType.setText(getResources().getStringArray(R.array.record_types)[0], false);

        btnPickFile.setOnClickListener(v -> filePicker.launch("*/*"));
        btnUpload.setOnClickListener(v -> attemptUpload());
    }

    private void onFilePicked(Uri uri) {
        if (uri == null) return;
        pickedUri = uri;
        pickedMimeType = getContentResolver().getType(uri);
        pickedFileName = queryFileName(uri);

        tvFileName.setText(pickedFileName != null ? pickedFileName : "1 file selected");
        tvFileName.setVisibility(View.VISIBLE);
    }

    private String queryFileName(Uri uri) {
        try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (nameIndex >= 0) return cursor.getString(nameIndex);
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private void attemptUpload() {
        tvError.setVisibility(View.GONE);
        String title = etTitle.getText() != null ? etTitle.getText().toString().trim() : "";
        String recordType = etRecordType.getText() != null ? etRecordType.getText().toString().trim() : "";

        if (TextUtils.isEmpty(title)) {
            showError("Please enter a title for this record.");
            return;
        }
        if (pickedUri == null) {
            showError("Please choose a file to upload.");
            return;
        }

        byte[] bytes;
        try (InputStream input = getContentResolver().openInputStream(pickedUri)) {
            if (input == null) {
                showError("Couldn't read the selected file. Please try another.");
                return;
            }
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] chunk = new byte[8192];
            int bytesRead;
            int total = 0;
            while ((bytesRead = input.read(chunk)) != -1) {
                total += bytesRead;
                if (total > MAX_FILE_SIZE_BYTES) {
                    showError("File is too large. Please choose a file under 10 MB.");
                    return;
                }
                buffer.write(chunk, 0, bytesRead);
            }
            bytes = buffer.toByteArray();
        } catch (Exception e) {
            showError("Couldn't read the selected file. Please try another.");
            return;
        }

        String fileName = pickedFileName != null ? pickedFileName : ("record_" + System.currentTimeMillis());

        viewModel.uploadRecord(bytes, fileName, pickedMimeType, recordType, title)
                .observe(this, this::handleResult);
    }

    private void handleResult(Resource<com.brainware.hospital.model.MedicalRecord> resource) {
        if (resource == null) return;
        switch (resource.status) {
            case LOADING:
                setLoading(true);
                break;
            case SUCCESS:
                setLoading(false);
                Toast.makeText(this, "Record uploaded.", Toast.LENGTH_SHORT).show();
                finish();
                break;
            case ERROR:
                setLoading(false);
                showError(resource.message);
                break;
        }
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnUpload.setEnabled(!loading);
        btnPickFile.setEnabled(!loading);
    }
}
