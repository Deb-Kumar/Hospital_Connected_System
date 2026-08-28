package com.brainware.hospital.ui.view;

import android.content.Context;
import android.graphics.Color;
import android.util.AttributeSet;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MortarLoaderView extends WebView {

    public MortarLoaderView(Context context) {
        super(context);
        init();
    }

    public MortarLoaderView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public MortarLoaderView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        setBackgroundColor(Color.TRANSPARENT);
        setLayerType(LAYER_TYPE_HARDWARE, null);

        WebSettings settings = getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);

        setVerticalScrollBarEnabled(false);
        setHorizontalScrollBarEnabled(false);

        loadUrl("file:///android_asset/mortar_loader.html");
    }
}
