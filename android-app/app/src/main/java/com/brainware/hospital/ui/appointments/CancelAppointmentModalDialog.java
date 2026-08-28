package com.brainware.hospital.ui.appointments;

import android.app.Dialog;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.brainware.hospital.R;
import com.google.android.material.bottomsheet.BottomSheetBehavior;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

public class CancelAppointmentModalDialog extends BottomSheetDialogFragment {

    public interface OnCancelConfirmListener {
        void onConfirmCancel(String reason);
    }

    private OnCancelConfirmListener listener;
    private RadioGroup radioGroupReasons;
    private RadioButton rbOtherReason;
    private EditText etCustomReason;
    private TextView tvCancelError;
    private Button btnConfirmCancel;

    public static CancelAppointmentModalDialog newInstance() {
        return new CancelAppointmentModalDialog();
    }

    public void setOnCancelConfirmListener(OnCancelConfirmListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        BottomSheetDialog dialog = (BottomSheetDialog) super.onCreateDialog(savedInstanceState);
        dialog.setOnShowListener(dialogInterface -> {
            View bottomSheet = dialog.findViewById(com.google.android.material.R.id.design_bottom_sheet);
            if (bottomSheet != null) {
                bottomSheet.setBackgroundResource(android.R.color.transparent);
                BottomSheetBehavior<View> behavior = BottomSheetBehavior.from(bottomSheet);
                behavior.setState(BottomSheetBehavior.STATE_EXPANDED);
                behavior.setSkipCollapsed(true);
            }
        });
        return dialog;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.dialog_cancel_appointment, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        view.findViewById(R.id.btnClose).setOnClickListener(v -> dismiss());

        radioGroupReasons = view.findViewById(R.id.radioGroupReasons);
        rbOtherReason = view.findViewById(R.id.rbOtherReason);
        etCustomReason = view.findViewById(R.id.etCustomReason);
        tvCancelError = view.findViewById(R.id.tvCancelError);
        btnConfirmCancel = view.findViewById(R.id.btnConfirmCancel);

        radioGroupReasons.setOnCheckedChangeListener((group, checkedId) -> {
            tvCancelError.setVisibility(View.GONE);
            if (checkedId == R.id.rbOtherReason) {
                etCustomReason.setVisibility(View.VISIBLE);
            } else {
                etCustomReason.setVisibility(View.GONE);
            }
        });

        btnConfirmCancel.setOnClickListener(v -> handleConfirm());
    }

    private void handleConfirm() {
        tvCancelError.setVisibility(View.GONE);
        int selectedId = radioGroupReasons.getCheckedRadioButtonId();

        if (selectedId == -1) {
            showError("⚠️ Please select a cancellation reason before proceeding.");
            return;
        }

        String reason = "";
        if (selectedId == R.id.rbScheduleConflict) {
            reason = "Schedule Conflict";
        } else if (selectedId == R.id.rbDoctorNotAvailable) {
            reason = "Doctor Not Available";
        } else if (selectedId == R.id.rbPersonalReason) {
            reason = "Personal Reason / Emergency";
        } else if (selectedId == R.id.rbHealthImproved) {
            reason = "Health Improved / Not Needed";
        } else if (selectedId == R.id.rbOtherReason) {
            reason = etCustomReason.getText() != null ? etCustomReason.getText().toString().trim() : "";
            if (TextUtils.isEmpty(reason)) {
                showError("⚠️ Please specify your cancellation reason.");
                return;
            }
        }

        if (listener != null) {
            listener.onConfirmCancel(reason);
        }
        dismiss();
    }

    private void showError(String msg) {
        tvCancelError.setText(msg);
        tvCancelError.setVisibility(View.VISIBLE);
    }
}
