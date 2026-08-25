package com.brainware.hospital.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Doctor;

import java.util.ArrayList;
import java.util.List;

public class DoctorAdapter extends RecyclerView.Adapter<DoctorAdapter.ViewHolder> {

    public interface OnDoctorClick {
        void onClick(Doctor doctor);
    }

    // Only approved, non-leave doctors are shown — matches spec section 24:
    // "Only show active/approved doctors."
    private final List<Doctor> items = new ArrayList<>();
    private final OnDoctorClick listener;

    public DoctorAdapter(OnDoctorClick listener) {
        this.listener = listener;
    }

    public void submitList(List<Doctor> newItems) {
        items.clear();
        if (newItems != null) {
            for (Doctor d : newItems) {
                if ("APPROVED".equals(d.getApprovalStatus())) {
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
        holder.tvName.setText("Dr. " + doctor.getFullName());

        String specialization = doctor.getSpecialization() != null && !doctor.getSpecialization().isEmpty()
                ? doctor.getSpecialization() : doctor.getDepartmentName();
        String experience = doctor.getExperienceYears() + " yrs experience";
        holder.tvSpecialization.setText(specialization + " · " + experience);

        holder.tvFee.setText(String.format("₹%.0f consultation fee", doctor.getConsultationFee()));

        if (doctor.isOnLeave()) {
            holder.tvStatusBadge.setVisibility(View.VISIBLE);
            holder.tvStatusBadge.setText("On Leave");
        } else {
            holder.tvStatusBadge.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> listener.onClick(doctor));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivPhoto;
        TextView tvName, tvSpecialization, tvFee, tvStatusBadge;

        ViewHolder(View itemView) {
            super(itemView);
            ivPhoto = itemView.findViewById(R.id.ivPhoto);
            tvName = itemView.findViewById(R.id.tvName);
            tvSpecialization = itemView.findViewById(R.id.tvSpecialization);
            tvFee = itemView.findViewById(R.id.tvFee);
            tvStatusBadge = itemView.findViewById(R.id.tvStatusBadge);
        }
    }
}
