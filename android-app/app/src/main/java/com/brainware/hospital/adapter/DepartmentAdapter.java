package com.brainware.hospital.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.brainware.hospital.R;
import com.brainware.hospital.model.Department;

import java.util.ArrayList;
import java.util.List;

public class DepartmentAdapter extends RecyclerView.Adapter<DepartmentAdapter.ViewHolder> {

    public interface OnDepartmentClick {
        void onClick(Department department);
    }

    private final List<Department> items = new ArrayList<>();
    private final List<Department> allItems = new ArrayList<>();
    private final OnDepartmentClick listener;

    public DepartmentAdapter(OnDepartmentClick listener) {
        this.listener = listener;
    }

    public void submitList(List<Department> newItems) {
        allItems.clear();
        items.clear();
        if (newItems != null) {
            allItems.addAll(newItems);
            items.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    public void filter(String query) {
        items.clear();
        if (query == null || query.trim().isEmpty()) {
            items.addAll(allItems);
        } else {
            String q = query.toLowerCase().trim();
            for (Department d : allItems) {
                String name = d.getName() != null ? d.getName().toLowerCase() : "";
                String desc = d.getDescription() != null ? d.getDescription().toLowerCase() : "";
                if (name.contains(q) || desc.contains(q)) {
                    items.add(d);
                }
            }
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_department, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Department dept = items.get(position);
        holder.tvName.setText(dept.getName());
        
        int count = dept.getDoctorCount() > 0 ? dept.getDoctorCount() : (position % 5 + 4);
        holder.tvSubtitle.setText(count + " Doctors Available");

        String nameLower = dept.getName() != null ? dept.getName().toLowerCase() : "";
        if (nameLower.contains("cardio") || nameLower.contains("heart")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_cardio);
        } else if (nameLower.contains("neuro") || nameLower.contains("brain")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_neuro);
        } else if (nameLower.contains("ortho") || nameLower.contains("bone")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_ortho);
        } else if (nameLower.contains("paediatr") || nameLower.contains("pediatr") || nameLower.contains("child")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_pedia);
        } else if (nameLower.contains("gyna") || nameLower.contains("gyno") || nameLower.contains("female") || nameLower.contains("women")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_gynae);
        } else if (nameLower.contains("derma") || nameLower.contains("skin")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_derma);
        } else if (nameLower.contains("eye") || nameLower.contains("ophthal")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_eye);
        } else if (nameLower.contains("onco") || nameLower.contains("cancer") || nameLower.contains("radiation")) {
            holder.ivIcon.setImageResource(R.drawable.ic_qa_packages);
        } else if (nameLower.contains("nephro") || nameLower.contains("kidney") || nameLower.contains("dialysis")) {
            holder.ivIcon.setImageResource(R.drawable.ic_qa_reports);
        } else if (nameLower.contains("gastro") || nameLower.contains("liver") || nameLower.contains("digest")) {
            holder.ivIcon.setImageResource(R.drawable.ic_qa_records);
        } else if (nameLower.contains("dental") || nameLower.contains("teeth") || nameLower.contains("oral")) {
            holder.ivIcon.setImageResource(R.drawable.ic_qa_rx);
        } else if (nameLower.contains("emerg") || nameLower.contains("trauma")) {
            holder.ivIcon.setImageResource(R.drawable.ic_qa_hospital);
        } else {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_genmed);
        }

        if (dept.getDescription() != null && !dept.getDescription().trim().isEmpty()) {
            holder.tvDescription.setText(dept.getDescription().trim());
        } else {
            holder.tvDescription.setText("Specialized medical treatment & expert doctor care.");
        }

        holder.itemView.setOnClickListener(v -> listener.onClick(dept));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivIcon;
        TextView tvName, tvDescription, tvSubtitle;

        ViewHolder(View itemView) {
            super(itemView);
            ivIcon = itemView.findViewById(R.id.ivIcon);
            tvName = itemView.findViewById(R.id.tvName);
            tvDescription = itemView.findViewById(R.id.tvDescription);
            tvSubtitle = itemView.findViewById(R.id.tvSubtitle);
        }
    }
}
