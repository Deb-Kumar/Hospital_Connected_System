package com.brainware.hospital.adapter;

import android.content.Intent;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.brainware.hospital.R;
import com.brainware.hospital.model.MedicalRecord;

import java.util.ArrayList;
import java.util.List;

public class RecordAdapter extends RecyclerView.Adapter<RecordAdapter.ViewHolder> {

    private final List<MedicalRecord> items = new ArrayList<>();

    public void submitList(List<MedicalRecord> newItems) {
        items.clear();
        if (newItems != null) items.addAll(newItems);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_record, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        MedicalRecord record = items.get(position);
        holder.tvTitle.setText(record.getTitle());
        holder.tvMeta.setText(record.getRecordType() + " · " + formatDate(record.getCreatedAt()));

        if (record.getAiSummary() != null && !record.getAiSummary().isEmpty()) {
            holder.tvSummary.setVisibility(View.VISIBLE);
            holder.tvSummary.setText("Summary: " + record.getAiSummary());
        } else {
            holder.tvSummary.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> {
            if (record.getFileUrl() == null || record.getFileUrl().isEmpty()) return;
            try {
                String url = record.getFileUrl();
                if (url.startsWith("/")) {
                    // Local-fallback relative path — opening it directly isn't
                    // meaningful off-device, so skip rather than open a broken link.
                    return;
                }
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                v.getContext().startActivity(intent);
            } catch (Exception ignored) {
                // No app available to open the file — fail silently rather than crash.
            }
        });
    }

    private String formatDate(String iso) {
        if (iso == null || iso.length() < 10) return "";
        return iso.substring(0, 10);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvMeta, tvSummary;

        ViewHolder(View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvMeta = itemView.findViewById(R.id.tvMeta);
            tvSummary = itemView.findViewById(R.id.tvSummary);
        }
    }
}
