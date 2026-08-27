package com.brainware.hospital.adapter;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Appointment;

import java.util.ArrayList;
import java.util.List;

public class AppointmentAdapter extends RecyclerView.Adapter<AppointmentAdapter.ViewHolder> {

    public interface OnAppointmentClick {
        void onClick(Appointment appointment);
    }

    private final List<Appointment> items = new ArrayList<>();
    private final OnAppointmentClick listener;

    public AppointmentAdapter(OnAppointmentClick listener) {
        this.listener = listener;
    }

    public void submitList(List<Appointment> newItems) {
        items.clear();
        if (newItems != null) items.addAll(newItems);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_appointment, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Appointment appt = items.get(position);
        
        String doctorName = appt.getDoctorName();
        holder.tvDoctorName.setText(doctorName != null && doctorName.startsWith("Dr.") ? doctorName : "Dr. " + (doctorName != null ? doctorName : "Specialist"));
        holder.tvDepartment.setText(appt.getDepartmentName() != null && !appt.getDepartmentName().isEmpty() ? appt.getDepartmentName() : "General Medicine");
        holder.tvDateTime.setText(appt.getAppointmentDate() + "  •  " + appt.getAppointmentTime());

        String status = appt.getStatus() != null ? appt.getStatus().toUpperCase() : "PENDING";
        if ("ACCEPTED".equals(status) || "CONFIRMED".equals(status)) {
            holder.tvStatus.setText("Confirmed");
            holder.tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            holder.tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
            holder.tvStatus.setTextColor(Color.parseColor("#2E7D32"));
        } else if ("PENDING".equals(status) || "SCHEDULED".equals(status)) {
            holder.tvStatus.setText("Scheduled");
            holder.tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            holder.tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E3F2FD")));
            holder.tvStatus.setTextColor(Color.parseColor("#1976D2"));
        } else if ("COMPLETED".equals(status)) {
            holder.tvStatus.setText("Completed");
            holder.tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            holder.tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#F3E5F5")));
            holder.tvStatus.setTextColor(Color.parseColor("#7B1FA2"));
        } else {
            holder.tvStatus.setText("Cancelled");
            holder.tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            holder.tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#FFEBEE")));
            holder.tvStatus.setTextColor(Color.parseColor("#D32F2F"));
        }

        if (holder.tvToken != null) {
            String token = appt.getTokenNumber() != null && !appt.getTokenNumber().isEmpty()
                    ? appt.getTokenNumber() : (appt.getQueueNumber() > 0 ? "OPD " + appt.getQueueNumber() : "OPD Main Wing");
            holder.tvToken.setText("Brainware Hospital, " + token);
        }

        holder.itemView.setOnClickListener(v -> listener.onClick(appt));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivPhoto;
        TextView tvDoctorName, tvDepartment, tvDateTime, tvStatus, tvToken;

        ViewHolder(View itemView) {
            super(itemView);
            ivPhoto = itemView.findViewById(R.id.ivPhoto);
            tvDoctorName = itemView.findViewById(R.id.tvDoctorName);
            tvDepartment = itemView.findViewById(R.id.tvDepartment);
            tvDateTime = itemView.findViewById(R.id.tvDateTime);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvToken = itemView.findViewById(R.id.tvToken);
        }
    }
}
