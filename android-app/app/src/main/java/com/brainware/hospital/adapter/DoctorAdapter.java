package com.brainware.hospital.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
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

    private final List<Doctor> items = new ArrayList<>();
    private final OnDoctorClick listener;

    public DoctorAdapter(OnDoctorClick listener) {
        this.listener = listener;
    }

    public void submitList(List<Doctor> newItems) {
        items.clear();
        if (newItems != null) {
            for (Doctor d : newItems) {
                // If approvalStatus is null or APPROVED, include in list
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
            holder.tvDegrees.setText("MBBS, MD, DM (" + specialization + ")");
        }


        int exp = doctor.getExperienceYears() > 0 ? doctor.getExperienceYears() : 8;
        holder.tvFee.setText(exp + "+ Years Experience");

        if (doctor.isOnLeave()) {
            holder.tvStatusBadge.setText("• On Leave");
            holder.tvStatusBadge.setTextColor(0xFFD32F2F);
        } else {
            holder.tvStatusBadge.setText("• Available");
            holder.tvStatusBadge.setTextColor(0xFF2E7D32);
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
        TextView tvName, tvSpecialization, tvDegrees, tvFee, tvStatusBadge;
        Button btnBookDoctor;

        ViewHolder(View itemView) {
            super(itemView);
            ivPhoto = itemView.findViewById(R.id.ivPhoto);
            tvName = itemView.findViewById(R.id.tvName);
            tvSpecialization = itemView.findViewById(R.id.tvSpecialization);
            tvDegrees = itemView.findViewById(R.id.tvDegrees);
            tvFee = itemView.findViewById(R.id.tvFee);
            tvStatusBadge = itemView.findViewById(R.id.tvStatusBadge);
            btnBookDoctor = itemView.findViewById(R.id.btnBookDoctor);
        }
    }
}
