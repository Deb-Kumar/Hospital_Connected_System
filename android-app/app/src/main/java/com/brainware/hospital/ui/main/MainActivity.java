package com.brainware.hospital.ui.main;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.brainware.hospital.R;
import com.brainware.hospital.api.SessionExpiredInterceptor;
import com.brainware.hospital.ui.appointments.AppointmentsFragment;
import com.brainware.hospital.ui.auth.LoginActivity;
import com.brainware.hospital.ui.departments.DoctorsTabFragment;
import com.brainware.hospital.ui.home.HomeFragment;
import com.brainware.hospital.ui.profile.ProfileFragment;
import com.brainware.hospital.ui.records.RecordsFragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;

/**
 * Hosts the 5 bottom-nav destinations (Home, Appointments, Doctors, Records,
 * Profile) via manual FragmentTransactions rather than the Navigation
 * Component, to keep the flow simple and explicit for a project this size.
 */
public class MainActivity extends AppCompatActivity {

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

        BottomNavigationView bottomNav = findViewById(R.id.bottomNav);

        if (savedInstanceState == null) {
            showFragment(new HomeFragment());
        }

        bottomNav.setOnItemSelectedListener(this::onNavItemSelected);
    }

    private boolean onNavItemSelected(@NonNull android.view.MenuItem item) {
        int id = item.getItemId();
        Fragment fragment = null;

        if (id == R.id.nav_home) {
            fragment = new HomeFragment();
        } else if (id == R.id.nav_appointments) {
            fragment = new AppointmentsFragment();
        } else if (id == R.id.nav_doctors) {
            fragment = new DoctorsTabFragment();
        } else if (id == R.id.nav_records) {
            fragment = new RecordsFragment();
        } else if (id == R.id.nav_profile) {
            fragment = new ProfileFragment();
        }

        if (fragment != null) {
            showFragment(fragment);
            return true;
        }
        return false;
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
