package com.brainware.hospital.ui.view;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.Window;
import android.widget.TextView;
import com.brainware.hospital.R;

public class MortarLoadingDialog {
    private final Dialog dialog;
    private final TextView tvMessage;

    public MortarLoadingDialog(Context context) {
        dialog = new Dialog(context);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.setContentView(R.layout.dialog_mortar_loader);
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        }
        dialog.setCancelable(false);
        tvMessage = dialog.findViewById(R.id.tvLoadingMessage);
    }

    public void show(String message) {
        if (tvMessage != null && message != null) {
            tvMessage.setText(message);
        }
        if (!dialog.isShowing()) {
            dialog.show();
        }
    }

    public void show() {
        show("Loading...");
    }

    public void dismiss() {
        if (dialog.isShowing()) {
            dialog.dismiss();
        }
    }

    public boolean isShowing() {
        return dialog.isShowing();
    }
}
