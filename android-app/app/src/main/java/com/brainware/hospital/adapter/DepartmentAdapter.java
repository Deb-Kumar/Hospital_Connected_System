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

        String nameLower = dept.getName() != null ? dept.getName().toLowerCase() : "";
        if (nameLower.contains("cardio") || nameLower.contains("heart") || nameLower.contains("thalassaem")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_cardio);
        } else if (nameLower.contains("neuro") || nameLower.contains("brain")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_neuro);
        } else if (nameLower.contains("ortho") || nameLower.contains("bone")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_ortho);
        } else if (nameLower.contains("paediatr") || nameLower.contains("pediatr") || nameLower.contains("child guidance") || nameLower.contains("child")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_pedia);
        } else if (nameLower.contains("gyna") || nameLower.contains("gyno") || nameLower.contains("female") || nameLower.contains("women") || nameLower.contains("obstetric")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_gynae);
        } else if (nameLower.contains("derma") || nameLower.contains("skin")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_derma);
        } else if (nameLower.contains("eye") || nameLower.contains("ophthal")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_eye);
        } else if (nameLower.contains("dental") || nameLower.contains("teeth") || nameLower.contains("maxillofacial")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_dental);
        } else if (nameLower.contains("ent") || nameLower.contains("otolaryngology") || nameLower.contains("ear") || nameLower.contains("throat")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_ent);
        } else if (nameLower.contains("critical care") || nameLower.contains("icu") || nameLower.contains("emerg") || nameLower.contains("trauma")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_icu);
        } else if (nameLower.contains("nutrition") || nameLower.contains("diet") || nameLower.contains("food")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_nutrition);
        } else if (nameLower.contains("surg") || nameLower.contains("operation")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_surgery);
        } else if (nameLower.contains("psychiatr") || nameLower.contains("mind") || nameLower.contains("mental")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_psychiatry);
        } else if (nameLower.contains("endocrin") || nameLower.contains("thyroid") || nameLower.contains("hormone")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_endocrin);
        } else if (nameLower.contains("geriatric") || nameLower.contains("senior")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_geriatric);
        } else if (nameLower.contains("gastro") || nameLower.contains("digest") || nameLower.contains("liver")) {
            holder.ivIcon.setImageResource(R.drawable.ic_dept_gastro);
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
