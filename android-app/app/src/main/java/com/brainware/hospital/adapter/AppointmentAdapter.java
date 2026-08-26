package com.brainware.hospital.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
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
        holder.tvDoctorName.setText(appt.getDoctorName());
        holder.tvDepartment.setText(appt.getDepartmentName() != null ? appt.getDepartmentName() : "");
        holder.tvDateTime.setText(appt.getAppointmentDate() + " · " + appt.getAppointmentTime());
        holder.tvStatus.setText(appt.getStatus());

        int color;
        switch (appt.getStatus() == null ? "" : appt.getStatus()) {
            case "ACCEPTED": color = R.color.status_accepted; break;
            case "COMPLETED": color = R.color.status_completed; break;
            case "CANCELLED": color = R.color.status_cancelled; break;
            case "REJECTED": color = R.color.status_rejected; break;
            default: color = R.color.status_pending;
        }
        holder.tvStatus.getBackground().setTint(holder.itemView.getContext().getColor(color));

        String rawToken = appt.getTokenNumber();
        if (rawToken != null && !rawToken.isEmpty()) {
            holder.tvToken.setVisibility(View.VISIBLE);
            String cleanToken = rawToken;
            if (rawToken.contains("-")) {
                String[] parts = rawToken.split("-");
                cleanToken = "Token #" + parts[parts.length - 1];
            } else if (rawToken.length() > 12) {
                cleanToken = "Token #" + rawToken.substring(rawToken.length() - 4);
            } else if (!rawToken.startsWith("Token")) {
                cleanToken = "Token #" + rawToken;
            }
            holder.tvToken.setText(cleanToken);
        } else if (appt.getQueueNumber() > 0) {
            holder.tvToken.setVisibility(View.VISIBLE);
            holder.tvToken.setText("Token #" + appt.getQueueNumber());
        } else {
            holder.tvToken.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> listener.onClick(appt));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvDoctorName, tvDepartment, tvDateTime, tvStatus, tvToken;

        ViewHolder(View itemView) {
            super(itemView);
            tvDoctorName = itemView.findViewById(R.id.tvDoctorName);
            tvDepartment = itemView.findViewById(R.id.tvDepartment);
            tvDateTime = itemView.findViewById(R.id.tvDateTime);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvToken = itemView.findViewById(R.id.tvToken);
        }
    }
}
