package com.brainware.hospital.ui.auth;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.brainware.hospital.BuildConfig;
import com.brainware.hospital.R;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.ui.main.MainActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        WebView webViewSvg = findViewById(R.id.webViewSvg);
        TextView tvAppName = findViewById(R.id.tvAppName);
        TextView tvSubtitle = findViewById(R.id.tvSubtitle);
        TextView tvAppVersion = findViewById(R.id.tvAppVersion);

        if (tvAppVersion != null) {
            tvAppVersion.setText("v" + BuildConfig.VERSION_NAME);
        }

        if (webViewSvg != null) {
            webViewSvg.setBackgroundColor(Color.TRANSPARENT);
            webViewSvg.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);
            WebSettings settings = webViewSvg.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setAllowFileAccess(true);

            String htmlData = "<html><head><style>" +
                    "html, body { margin:0; padding:0; width:100%; height:100%; display:flex; justify-content:center; align-items:center; background:transparent; overflow:hidden; }" +
                    "img, svg { width:100%; height:100%; object-fit:contain; transform: scale(1.35); transform-origin: center center; }" +
                    "</style></head><body>" +
                    "<img src=\"file:///android_asset/hospital_preloaded.svg\" />" +
                    "</body></html>";

            webViewSvg.loadDataWithBaseURL("file:///android_asset/", htmlData, "text/html", "UTF-8", null);
        }

        tvAppName.setAlpha(0f);
        tvSubtitle.setAlpha(0f);
        tvAppName.animate().alpha(1f).setStartDelay(300).setDuration(600).start();
        tvSubtitle.animate().alpha(1f).setStartDelay(400).setDuration(600).start();

        new Handler(Looper.getMainLooper()).postDelayed(this::routeNext, 3600);
    }

    private void routeNext() {
        boolean loggedIn = TokenManager.getInstance(this).isLoggedIn();
        Intent intent = new Intent(this, loggedIn ? MainActivity.class : LoginActivity.class);
        startActivity(intent);
        finish();
    }
}
