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
    private String currentCategory = "All";
    private String currentQuery = "";

    public DepartmentAdapter(OnDepartmentClick listener) {
        this.listener = listener;
    }

    public void submitList(List<Department> newItems) {
        allItems.clear();
        items.clear();
        if (newItems != null) {
            allItems.addAll(newItems);
        }
        applyFilter();
    }

    public void filterQuery(String query) {
        this.currentQuery = query != null ? query.toLowerCase().trim() : "";
        applyFilter();
    }

    public void filterCategory(String category) {
        this.currentCategory = category != null ? category : "All";
        applyFilter();
    }

    private void applyFilter() {
        items.clear();
        for (Department d : allItems) {
            String name = d.getName() != null ? d.getName().toLowerCase() : "";
            String desc = d.getDescription() != null ? d.getDescription().toLowerCase() : "";
            
            boolean matchesCategory = matchesCategoryFilter(d.getName(), currentCategory);
            boolean matchesQuery = currentQuery.isEmpty() || name.contains(currentQuery) || desc.contains(currentQuery);

            if (matchesCategory && matchesQuery) {
                items.add(d);
            }
        }
        notifyDataSetChanged();
    }

    private boolean matchesCategoryFilter(String deptName, String category) {
        if ("All".equalsIgnoreCase(category) || category == null || category.trim().isEmpty()) {
            return true;
        }
        if (deptName == null) return false;
        String name = deptName.toLowerCase();

        if ("Surgical".equalsIgnoreCase(category)) {
            return name.contains("surg") || name.contains("ortho") || name.contains("maxillofacial") ||
                   name.contains("urology") || name.contains("ent");
        } else if ("Supportive".equalsIgnoreCase(category)) {
            return name.contains("radio") || name.contains("patho") || name.contains("nuclear") ||
                   name.contains("anesthesi") || name.contains("emerg") || name.contains("nutrition") ||
                   name.contains("rehabilitat") || name.contains("imaging") || name.contains("lab");
        } else if ("Specialty".equalsIgnoreCase(category)) {
            return name.contains("onco") || name.contains("gyna") || name.contains("gyno") || name.contains("ivf") ||
                   name.contains("ophthal") || name.contains("psychiatr") || name.contains("clinic") ||
                   name.contains("thalassaem") || name.contains("obstetric");
        } else if ("Clinical".equalsIgnoreCase(category)) {
            return name.contains("cardio") || name.contains("neuro") || name.contains("pedia") ||
                   name.contains("paedia") || name.contains("derma") || name.contains("gastro") ||
                   name.contains("endocrin") || name.contains("nephro") || name.contains("pulmon") ||
                   name.contains("rheumat") || name.contains("med") || name.contains("allergy") ||
                   name.contains("disease") || name.contains("hematol") || name.contains("haematol");
        }
        return true;
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
        
        int count = dept.getDoctorCount() > 0 ? dept.getDoctorCount() : (position % 3 + 2);
        holder.tvSubtitle.setText(count + " Doctors Available");

        holder.ivIcon.setImageResource(com.brainware.hospital.utils.DepartmentIconHelper.getIconDrawableRes(dept.getName()));

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
