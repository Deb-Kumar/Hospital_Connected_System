package com.brainware.hospital.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.brainware.hospital.R;
import com.brainware.hospital.model.Doctor;

import java.util.ArrayList;
import java.util.List;

public class DoctorAdapter extends RecyclerView.Adapter<DoctorAdapter.ViewHolder> {

    public interface OnDoctorClick {
        void onClick(Doctor doctor);
    }

    private final List<Doctor> items = new ArrayList<>();
    private final OnDoctorClick listener;

    public DoctorAdapter(OnDoctorClick listener) {
        this.listener = listener;
    }

    public void submitList(List<Doctor> newItems) {
        items.clear();
        if (newItems != null) {
            for (Doctor d : newItems) {
                if (d.getApprovalStatus() == null || "APPROVED".equals(d.getApprovalStatus())) {
                    items.add(d);
                }
            }
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_doctor, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Doctor doctor = items.get(position);
        
        String name = doctor.getFullName();
        holder.tvName.setText(name != null && name.startsWith("Dr.") ? name : "Dr. " + name);

        String specialization = doctor.getSpecialization() != null && !doctor.getSpecialization().isEmpty()
                ? doctor.getSpecialization() : (doctor.getDepartmentName() != null ? doctor.getDepartmentName() : "Cardiologist");
        holder.tvSpecialization.setText(specialization);

        if (holder.tvDegrees != null) {
            String qual = doctor.getQualification();
            if (qual != null && !qual.trim().isEmpty()) {
                holder.tvDegrees.setText(qual.trim());
            } else {
                holder.tvDegrees.setText("MBBS, MD (" + specialization + ")");
            }
        }

        int exp = doctor.getExperienceYears() > 0 ? doctor.getExperienceYears() : 8;
        holder.tvFee.setText(exp + "+ Years Experience");

        if (holder.tvRatingBadge != null) {
            double rating = doctor.getRating() > 0 ? doctor.getRating() : (4.6 + (position % 4) * 0.1);
            holder.tvRatingBadge.setText(String.format("★ %.1f", rating));
        }

        // Fetch & load doctor profile image with Glide
        String photoUrl = doctor.getPhotoUrl();
        if (photoUrl != null && !photoUrl.trim().isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(photoUrl)
                    .placeholder(R.drawable.ic_user_circle)
                    .error(R.drawable.ic_user_circle)
                    .circleCrop()
                    .into(holder.ivPhoto);
        } else {
            holder.ivPhoto.setImageResource(R.drawable.ic_user_circle);
        }

        if (holder.btnBookDoctor != null) {
            holder.btnBookDoctor.setOnClickListener(v -> listener.onClick(doctor));
        }
        holder.itemView.setOnClickListener(v -> listener.onClick(doctor));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivPhoto;
        TextView tvName, tvSpecialization, tvDegrees, tvFee, tvRatingBadge;
        Button btnBookDoctor;

        ViewHolder(View itemView) {
            super(itemView);
            ivPhoto = itemView.findViewById(R.id.ivPhoto);
            tvName = itemView.findViewById(R.id.tvName);
            tvSpecialization = itemView.findViewById(R.id.tvSpecialization);
            tvDegrees = itemView.findViewById(R.id.tvDegrees);
            tvFee = itemView.findViewById(R.id.tvFee);
            tvRatingBadge = itemView.findViewById(R.id.tvRatingBadge);
            btnBookDoctor = itemView.findViewById(R.id.btnBookDoctor);
        }
    }
}
