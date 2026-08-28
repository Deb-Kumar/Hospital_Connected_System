package com.brainware.hospital.adapter;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.brainware.hospital.R;
import com.brainware.hospital.model.Appointment;

import java.util.ArrayList;
import java.util.List;

public class AppointmentAdapter extends RecyclerView.Adapter<AppointmentAdapter.ViewHolder> {

    public interface OnItemClickListener {
        void onClick(Appointment appointment);
    }

    private final OnItemClickListener listener;
    private final List<Appointment> items = new ArrayList<>();

    public AppointmentAdapter(OnItemClickListener listener) {
        this.listener = listener;
    }

    public void submitList(List<Appointment> list) {
        items.clear();
        if (list != null) items.addAll(list);
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
        holder.tvDoctorName.setText(doctorName);
        holder.tvDepartment.setText(appt.getDepartmentName() != null && !appt.getDepartmentName().isEmpty() ? appt.getDepartmentName() : "General Medicine");
        
        // Scheduled Appointment Date & Time (e.g. 2026-08-31 • 10:00 PM)
        holder.tvDateTime.setText(appt.getAppointmentDate() + " • " + appt.getAppointmentTime());

        // Booking Created Timestamp (e.g. Booked: 28 Aug, 12:17 PM)
        if (holder.tvBookingTime != null) {
            holder.tvBookingTime.setText(appt.getFormattedBookingTime());
        }

        String status = appt.getStatus() != null ? appt.getStatus().toUpperCase() : "PENDING";
        if ("ACCEPTED".equals(status) || "CONFIRMED".equals(status)) {
            holder.tvStatus.setText("Confirmed");
            holder.tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            holder.tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
            holder.tvStatus.setTextColor(Color.parseColor("#2E7D32"));
        } else if ("PENDING".equals(status) || "SCHEDULED".equals(status)) {
            holder.tvStatus.setText("Pending");
            holder.tvStatus.setBackgroundResource(R.drawable.bg_tile_card);
            holder.tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#FEF3C7")));
            holder.tvStatus.setTextColor(Color.parseColor("#D97706"));
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

        // Fetch & load doctor photo in appointment card using Glide
        String photoUrl = appt.getDoctorPhotoUrl();
        if (photoUrl != null && !photoUrl.trim().isEmpty() && holder.ivPhoto != null) {
            Glide.with(holder.itemView.getContext())
                    .load(photoUrl)
                    .placeholder(R.drawable.ic_user_circle)
                    .error(R.drawable.ic_user_circle)
                    .circleCrop()
                    .into(holder.ivPhoto);
        } else if (holder.ivPhoto != null) {
            holder.ivPhoto.setImageResource(R.drawable.ic_user_circle);
        }

        if (holder.tvToken != null) {
            holder.tvToken.setText(appt.getFormattedToken());
        }

        holder.itemView.setOnClickListener(v -> listener.onClick(appt));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivPhoto;
        TextView tvDoctorName, tvDepartment, tvDateTime, tvBookingTime, tvStatus, tvToken;

        ViewHolder(View itemView) {
            super(itemView);
            ivPhoto = itemView.findViewById(R.id.ivPhoto);
            tvDoctorName = itemView.findViewById(R.id.tvDoctorName);
            tvDepartment = itemView.findViewById(R.id.tvDepartment);
            tvDateTime = itemView.findViewById(R.id.tvDateTime);
            tvBookingTime = itemView.findViewById(R.id.tvBookingTime);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvToken = itemView.findViewById(R.id.tvToken);
        }
    }
}
