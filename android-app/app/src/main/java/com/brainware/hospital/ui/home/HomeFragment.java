package com.brainware.hospital.ui.home;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import androidx.viewpager2.widget.ViewPager2;

import com.brainware.hospital.R;
import com.brainware.hospital.adapter.DepartmentAdapter;
import com.brainware.hospital.storage.TokenManager;
import com.brainware.hospital.ui.doctors.DoctorConsultationActivity;
import com.brainware.hospital.ui.doctors.DoctorsByDepartmentActivity;
import com.brainware.hospital.ui.main.MainActivity;
import com.brainware.hospital.utils.Constants;
import com.brainware.hospital.utils.Resource;
import com.brainware.hospital.viewmodel.DepartmentsViewModel;

import java.util.ArrayList;
import java.util.List;

public class HomeFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private TextView tvGreeting, tvError;
    private RecyclerView rvDepartments;
    private View progressBar;

    // ViewPager2 & Patient Reviews Carousel State
    private ViewPager2 viewPagerReviews;
    private LinearLayout layoutDotsContainer;
    private final List<PatientReview> reviewsList = new ArrayList<>();
    private PatientReviewAdapter reviewAdapter;

    private DepartmentsViewModel departmentsViewModel;
    private DepartmentAdapter adapter;

    public static class PatientReview {
        String name;
        String treatment;
        String review;
        String stars;

        PatientReview(String name, String treatment, String review, String stars) {
            this.name = name;
            this.treatment = treatment;
            this.review = review;
            this.stars = stars;
        }
    }

    private static class PatientReviewAdapter extends RecyclerView.Adapter<PatientReviewAdapter.ViewHolder> {
        private final List<PatientReview> items;

        PatientReviewAdapter(List<PatientReview> items) {
            this.items = items;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_patient_review, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            PatientReview r = items.get(position);
            holder.tvStars.setText(r.stars);
            holder.tvText.setText(r.review);
            holder.tvAuthor.setText("— " + r.name + " (" + r.treatment + ")");
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvStars, tvText, tvAuthor;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                tvStars = itemView.findViewById(R.id.tvReviewStars);
                tvText = itemView.findViewById(R.id.tvReviewText);
                tvAuthor = itemView.findViewById(R.id.tvReviewAuthor);
            }
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_home, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        departmentsViewModel = new ViewModelProvider(this).get(DepartmentsViewModel.class);

        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        tvGreeting = view.findViewById(R.id.tvGreeting);
        rvDepartments = view.findViewById(R.id.rvDepartments);
        progressBar = view.findViewById(R.id.progressBar);
        tvError = view.findViewById(R.id.tvError);

        setGreeting();
        setupQuickActions(view);
        setupDepartmentsList();
        setupPatientReviewsCarousel(view);

        View btnCallAmbulance = view.findViewById(R.id.btnCallAmbulance);
        if (btnCallAmbulance != null) {
            btnCallAmbulance.setOnClickListener(v -> {
                Intent dialIntent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"));
                startActivity(dialIntent);
            });
        }

        view.findViewById(R.id.ivUserAvatar).setOnClickListener(v -> switchToTab(R.id.nav_profile));

        swipeRefresh.setOnRefreshListener(this::loadData);
        loadData();
    }

    private void setGreeting() {
        String name = TokenManager.getInstance(requireContext()).getFullName();
        if (name != null && !name.trim().isEmpty()) {
            tvGreeting.setText(name.trim());
        } else {
            tvGreeting.setText("Debkumar Payra");
        }
    }

    private void setupQuickActions(View root) {
        root.findViewById(R.id.actionBook).setOnClickListener(v ->
                com.brainware.hospital.ui.booking.BookAppointmentModalDialog.newInstance()
                        .show(getChildFragmentManager(), "BookAppointmentModal"));

        root.findViewById(R.id.actionDoctorConsult).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), DoctorConsultationActivity.class)));

        root.findViewById(R.id.actionMyReports).setOnClickListener(v ->
                switchToTab(R.id.nav_records));

        root.findViewById(R.id.actionPrescriptions).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), com.brainware.hospital.ui.records.PrescriptionsActivity.class)));

        root.findViewById(R.id.actionRecords).setOnClickListener(v ->
                switchToTab(R.id.nav_records));

        root.findViewById(R.id.actionBilling).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), com.brainware.hospital.ui.profile.BillingActivity.class)));

        root.findViewById(R.id.actionHealthPackages).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), DoctorConsultationActivity.class)));

        root.findViewById(R.id.actionFindHospital).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), HospitalInfoActivity.class)));

        View btnNotif = root.findViewById(R.id.btnNotification);
        if (btnNotif != null) {
            btnNotif.setOnClickListener(v ->
                    startActivity(new Intent(requireContext(), NotificationsActivity.class)));
        }
    }

    private void setupPatientReviewsCarousel(View root) {
        viewPagerReviews = root.findViewById(R.id.viewPagerReviews);
        layoutDotsContainer = root.findViewById(R.id.layoutDotsContainer);

        if (viewPagerReviews == null) return;

        reviewsList.clear();
        reviewsList.add(new PatientReview(
                "Siddharth Roy",
                "Angioplasty & Cardiac ICU",
                "\"The emergency response for my cardiac procedure was instantaneous and life-saving. Truly professional doctors and staff.\"",
                "⭐⭐⭐⭐⭐"
        ));
        reviewsList.add(new PatientReview(
                "Priyanka Das",
                "Maternity & Pediatric Care",
                "\"The gynecology & NICU team treated us like family. Every process was transparent, hygienic, and extremely well-managed.\"",
                "⭐⭐⭐⭐⭐"
        ));
        reviewsList.add(new PatientReview(
                "Amitava Chaudhuri",
                "Total Knee Replacement",
                "\"Dr. Mukherjee performed my knee surgery with utmost skill. Within 3 days I was walking with physiotherapy support. Excellent nursing care.\"",
                "⭐⭐⭐⭐⭐"
        ));
        reviewsList.add(new PatientReview(
                "Dr. Subhash Banerjee",
                "Executive Health Checkup",
                "\"Comprehensive executive health checkup completed seamlessly in 2 hours. Digital reports available on patient portal the same evening.\"",
                "⭐⭐⭐⭐⭐"
        ));
        reviewsList.add(new PatientReview(
                "Meenakshi Sen",
                "Neurology & Brain Stroke Unit",
                "\"Rapid ER response within the golden hour saved my mother from stroke paralysis. Dedicated 1:1 ICU nursing care was world-class.\"",
                "⭐⭐⭐⭐⭐"
        ));
        reviewsList.add(new PatientReview(
                "Rajesh Sharma",
                "Gastroenterology & Laparoscopy",
                "\"Laparoscopic surgery performed with zero pain and quick recovery. Highly hygienic private ward rooms and courteous hospital staff.\"",
                "⭐⭐⭐⭐⭐"
        ));
        reviewsList.add(new PatientReview(
                "Ananya Mukhopadhyay",
                "Oncology & Radiation Therapy",
                "\"Compassionate oncologists and state-of-the-art radiation therapy setup. Transparent insurance desk processing made our journey stress-free.\"",
                "⭐⭐⭐⭐⭐"
        ));
        reviewsList.add(new PatientReview(
                "Tanmoy Chakraborty",
                "Orthopedics & Fracture Rehab",
                "\"Excellent emergency fracture management followed by 2 weeks of dedicated physiotherapy. Walking normally now thanks to Brainware Hospital!\"",
                "⭐⭐⭐⭐⭐"
        ));

        reviewAdapter = new PatientReviewAdapter(reviewsList);
        viewPagerReviews.setAdapter(reviewAdapter);

        updateDots(0);

        viewPagerReviews.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                updateDots(position);
            }
        });
    }

    private void updateDots(int currentPosition) {
        if (layoutDotsContainer == null) return;
        layoutDotsContainer.removeAllViews();

        for (int i = 0; i < reviewsList.size(); i++) {
            TextView dot = new TextView(requireContext());
            dot.setText("●");
            dot.setTextSize(14.0f);
            dot.setPadding(6, 0, 6, 0);

            if (i == currentPosition) {
                dot.setTextColor(0xFFD97706); // Dark Gold Active Dot
            } else {
                dot.setTextColor(0xFFCBD5E1); // Soft Gray Inactive Dot
            }

            final int position = i;
            dot.setOnClickListener(v -> {
                if (viewPagerReviews != null) {
                    viewPagerReviews.setCurrentItem(position, true);
                }
            });

            layoutDotsContainer.addView(dot);
        }
    }

    private void switchToTab(int menuItemId) {
        if (getActivity() instanceof MainActivity) {
            MainActivity activity = (MainActivity) getActivity();
            if (menuItemId == R.id.nav_doctors) activity.selectTab(1);
            else if (menuItemId == R.id.nav_appointments) activity.selectTab(2);
            else if (menuItemId == R.id.nav_profile) activity.selectTab(3);
            else activity.selectTab(0);
        }
    }

    private void setupDepartmentsList() {
        adapter = new DepartmentAdapter(department -> {
            Intent intent = new Intent(requireContext(), DoctorsByDepartmentActivity.class);
            intent.putExtra(Constants.EXTRA_DEPARTMENT_ID, department.getId());
            intent.putExtra(Constants.EXTRA_DEPARTMENT_NAME, department.getName());
            startActivity(intent);
        });
        rvDepartments.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvDepartments.setAdapter(adapter);
    }

    private void loadData() {
        if (progressBar != null) progressBar.setVisibility(View.GONE);
        if (tvError != null) tvError.setVisibility(View.GONE);

        departmentsViewModel.getDepartments().observe(getViewLifecycleOwner(), resource -> {
            if (resource == null) return;
            swipeRefresh.setRefreshing(false);
            if (resource.status == Resource.Status.SUCCESS && resource.data != null) {
                adapter.submitList(resource.data);
            }
        });
    }
}
