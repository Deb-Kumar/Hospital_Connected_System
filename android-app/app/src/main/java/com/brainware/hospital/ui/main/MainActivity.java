package com.brainware.hospital.ui.main;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.brainware.hospital.R;
import com.brainware.hospital.api.SessionExpiredInterceptor;
import com.brainware.hospital.ui.appointments.AppointmentsFragment;
import com.brainware.hospital.ui.booking.BookAppointmentActivity;
import com.brainware.hospital.ui.auth.LoginActivity;
import com.brainware.hospital.ui.departments.DoctorsTabFragment;
import com.brainware.hospital.ui.home.HomeFragment;
import com.brainware.hospital.ui.profile.DigitalIdActivity;
import com.brainware.hospital.ui.profile.ProfileFragment;
import com.google.android.material.bottomsheet.BottomSheetDialog;

public class MainActivity extends AppCompatActivity {

    private LinearLayout navHome, navSearch, navHistory, navProfile;
    private View fabContainer;
    private ImageView ivHome, ivSearch, ivHistory, ivProfile;
    private TextView tvHome, tvSearch, tvHistory, tvProfile;

    private static final int COLOR_ACTIVE = Color.parseColor("#8E24AA");
    private static final int COLOR_INACTIVE = Color.parseColor("#757575");

    private int currentTabIndex = 0;

    private final BroadcastReceiver sessionExpiredReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Toast.makeText(MainActivity.this, "Your session has expired. Please log in again.", Toast.LENGTH_LONG).show();
            startActivity(new Intent(MainActivity.this, LoginActivity.class));
            finish();
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Bind Custom Navigation Views
        navHome = findViewById(R.id.nav_home);
        navSearch = findViewById(R.id.nav_search);
        navHistory = findViewById(R.id.nav_history);
        navProfile = findViewById(R.id.nav_profile);
        fabContainer = findViewById(R.id.fabContainer);

        ivHome = findViewById(R.id.ivNavHome);
        ivSearch = findViewById(R.id.ivNavSearch);
        ivHistory = findViewById(R.id.ivNavHistory);
        ivProfile = findViewById(R.id.ivNavProfile);

        tvHome = findViewById(R.id.tvNavHome);
        tvSearch = findViewById(R.id.tvNavSearch);
        tvHistory = findViewById(R.id.tvNavHistory);
        tvProfile = findViewById(R.id.tvNavProfile);

        // Set Click Listeners
        navHome.setOnClickListener(v -> selectTab(0));
        navSearch.setOnClickListener(v -> selectTab(1));
        navHistory.setOnClickListener(v -> selectTab(2));
        navProfile.setOnClickListener(v -> selectTab(3));

        // Central FAB + click listener: Opens Quick Booking BottomSheet Modal
        fabContainer.setOnClickListener(v -> showQuickBookingModal());

        // Handle back press gracefully — switch to Home tab if on another tab instead of exiting app
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (currentTabIndex != 0) {
                    selectTab(0);
                } else {
                    finish();
                }
            }
        });

        if (savedInstanceState == null) {
            selectTab(0);
        }
    }

    private void showQuickBookingModal() {
        try {
            BottomSheetDialog bottomSheetDialog = new BottomSheetDialog(this);

            View view = getLayoutInflater().inflate(R.layout.dialog_quick_booking, null);
            bottomSheetDialog.setContentView(view);

            // Option 1: Book OPD Appointment -> Open Doctors Directory
            view.findViewById(R.id.btnQuickBook).setOnClickListener(v -> {
                bottomSheetDialog.dismiss();
                Toast.makeText(MainActivity.this, "Select a doctor to book your OPD appointment slot.", Toast.LENGTH_SHORT).show();
                startActivity(new Intent(MainActivity.this, com.brainware.hospital.ui.doctors.DoctorsByDepartmentActivity.class));
            });

            // Option 2: AI Health Assistant
            view.findViewById(R.id.btnQuickAi).setOnClickListener(v -> {
                bottomSheetDialog.dismiss();
                selectTab(1); // Switch to Doctors/AI Search tab
            });

            // Option 3: Digital Health Pass
            view.findViewById(R.id.btnQuickQr).setOnClickListener(v -> {
                bottomSheetDialog.dismiss();
                startActivity(new Intent(MainActivity.this, DigitalIdActivity.class));
            });

            bottomSheetDialog.show();
        } catch (Exception e) {
            startActivity(new Intent(MainActivity.this, BookAppointmentActivity.class));
        }
    }

    public void selectTab(int index) {
        this.currentTabIndex = index;
        Fragment fragment = null;

        // Reset all tabs to inactive state
        ivHome.setColorFilter(COLOR_INACTIVE);
        tvHome.setTextColor(COLOR_INACTIVE);
        ivSearch.setColorFilter(COLOR_INACTIVE);
        tvSearch.setTextColor(COLOR_INACTIVE);
        ivHistory.setColorFilter(COLOR_INACTIVE);
        tvHistory.setTextColor(COLOR_INACTIVE);
        ivProfile.setColorFilter(COLOR_INACTIVE);
        tvProfile.setTextColor(COLOR_INACTIVE);

        switch (index) {
            case 0:
                fragment = new HomeFragment();
                ivHome.setColorFilter(COLOR_ACTIVE);
                tvHome.setTextColor(COLOR_ACTIVE);
                break;
            case 1:
                fragment = new DoctorsTabFragment();
                ivSearch.setColorFilter(COLOR_ACTIVE);
                tvSearch.setTextColor(COLOR_ACTIVE);
                break;
            case 2:
                fragment = new AppointmentsFragment();
                ivHistory.setColorFilter(COLOR_ACTIVE);
                tvHistory.setTextColor(COLOR_ACTIVE);
                break;
            case 3:
                fragment = new ProfileFragment();
                ivProfile.setColorFilter(COLOR_ACTIVE);
                tvProfile.setTextColor(COLOR_ACTIVE);
                break;
        }

        if (fragment != null) {
            showFragment(fragment);
        }
    }

    private void showFragment(Fragment fragment) {
        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.fragmentContainer, fragment)
                .commit();
    }

    @Override
    protected void onResume() {
        super.onResume();
        LocalBroadcastManager.getInstance(this).registerReceiver(
                sessionExpiredReceiver, new IntentFilter(SessionExpiredInterceptor.ACTION_SESSION_EXPIRED));
    }

    @Override
    protected void onPause() {
        super.onPause();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(sessionExpiredReceiver);
    }
}
